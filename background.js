function esc(str) {
	return str.replace("`", "\\\`");
}

function httpFailedMsg(url, inject, msg) {
	inject(`console.error(\`Resource:${esc(url)} load failed. (${esc(msg)})\`)`);
}

function handleHttp(url, xhr, inject)
{
	if (xhr.status !== 200) {
		httpFailedMsg(url, inject, xhr.statusText);
		return;
	}

	let mime = xhr.getResponseHeader("Content-Type");
	if (!mime || !mime.startsWith('application/javascript')) {
		inject(`console.warn(\`Resource:${esc(url)} (${esc(mime)}) is not JS type.\`)`);
	}

	inject(`console.info(\`JS file:${esc(url)} is loaded.\`)`);
	inject(xhr.responseText);
}

function loadScript(url, inject) {
	var xhr = new XMLHttpRequest();
	try {
		xhr.open('GET', url, true);
	}
	catch (err) {
		let msg = err.stack.split('\n')[0];
		httpFailedMsg(url, inject, msg);
	}

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			handleHttp(url, xhr, inject);
		}
	}
	xhr.send();
}

function isNormalUrl(url) {
	if (url.startsWith('https://www.google.com/_/chrome/newtab')) {
		return false;
	}

	return true;
}

function onCompletedEvent(e) {
	function injectCode(code) {
		chrome.tabs.executeScript(e.tabId, {
			matchAboutBlank: true,
			frameId: e.frameId,
			code: code
		});
	}

    chrome.storage.local.get('config', function(data) {
        if (typeof data.config === 'undefined') {
            return;
		}
		
		if (!data.config.enabled) {
            return;
		}

		chrome.webNavigation.getFrame({
			tabId: e.tabId,
			frameId: 0 // top frame
		}, function (info) {
			if (isNormalUrl(info.url)) {
				loadScript(data.config.url, injectCode);
			}
		});
	});
}

chrome.webNavigation.onCompleted.addListener(
	onCompletedEvent, {
		url: [
			{ schemes: ['http', 'https'] }
		]
	}
);