(() => {
    "use strict";

    function demo() {
        // if code here is too long, you can write them 
        // in a standalone file and add it to [require]
        console.log('hello demo');
    }

    let apps = [{
            match: /./,
            enabled: true,
            topFrameOnly: true,
            require: ['http://127.0.0.1:8000/hello.txt'],
            call: demo
        },
        {
            match: /^https?:\/\/stackoverflow.com\/questions\//,
            enabled: false,
            topFrameOnly: true,
            require: [],
            call: () => {
                console.log(this);
            }
        },
    ];

    class ScriptLoader {
        constructor(require, onAllLoad) {
            if (require.length == 0) {
                onAllLoad();
                return;
            }

            this.requiredJs = require;
            this.finallyRun = onAllLoad;
            this.requiredJsDone = 0;
            this.requiredCode = [];
            this.sendRequests();
        }

        onRequiredDone() {
            this.requiredJsDone += 1;
            if (this.requiredJsDone == this.requiredJs.length) {
                this.requiredCode.forEach(x => eval(x));
                this.finallyRun();
            }
        }

        sendRequests() {
            let that = this;
            this.requiredJs.forEach((url) => {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        that.requiredCode.push(this.responseText);
                        that.onRequiredDone();
                    }
                };
                xhttp.open('GET', url, true);
                xhttp.send();
            });
        }
    }

    apps.forEach(app => {
        if (!app.enabled) {
            return;
        }

        if (!window.top.location.href.match(app.match)) {
            return;
        }

        if (app.topFrameOnly == undefined) {
            app.topFrameOnly = true;
        }

        if (app.topFrameOnly && window !== window.top) {
            return;
        }

        new ScriptLoader(app.require, app.call);
    });
})();