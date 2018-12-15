function setConfig(data) {
    chrome.storage.local.set(data);
}

function initUI(data) {
    if (typeof data.config === 'undefined') {
        data.config = {
            url: 'http://127.0.0.1:8000/hello.js',
            enabled: false
        };
    }

    let cfg = data.config;
    let elUrl = document.getElementById('url');
    let elEnable = document.getElementById('enabled');
    let elUpdate = document.getElementById('update-url');

    function updateUrlState() {
        toDisable = !elEnable.checked;
        elUrl.disabled = toDisable;
        elUpdate.disabled = toDisable;
    }

    elUrl.value = cfg.url;
    elEnable.checked = cfg.enabled;
    updateUrlState();

    elEnable.addEventListener('change', function() {
        data.config.enabled = elEnable.checked;
        setConfig(data);
        updateUrlState();
    });

    elUpdate.addEventListener('click', function() {
        data.config.url = elUrl.value;
        setConfig(data);
        window.close();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('config', function(data) {
        initUI(data);
    });
});