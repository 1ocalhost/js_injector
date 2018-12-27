((window) => {
    "use strict";

    function demo() {
        // if code here is too long, you can write them 
        // in a standalone file and add it to [require]
        console.log('hello demo');
    }

    let apps = [{
            match: /./,
            enabled: true,
            topFrameOnly: false,
            require: [
                'https://cdn.jsdelivr.net/npm/vue'
            ],
            call: demo
        },
        {
            match: /^https?:\/\/stackoverflow.com\/questions\//,
            enabled: false,
            topFrameOnly: false,
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
                this.requiredCode.forEach(
                    (function(x) { eval(x); }).bind(window)
                );
                this.finallyRun();
            }
        }

        sendRequests() {
            let that = this;
            let order = 0;
            this.requiredJs.forEach((url) => {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = (function(index) {
                    if (this.readyState == 4 && this.status == 200) {
                        that.requiredCode[index] = this.responseText;
                        that.onRequiredDone();
                    }
                }).bind(xhttp, order);
                xhttp.open('GET', url, true);
                xhttp.send();
                order += 1;
            });
        }
    }

    apps.forEach(app => {
        if (!app.enabled ||
            !window.location.href.match(app.match)) {
            return;
        }

        let isTopFrame = (window === window.top);
        if (app.topFrameOnly && !isTopFrame) {
            return;
        }

        new ScriptLoader(app.require, app.call);
    });
})(this);