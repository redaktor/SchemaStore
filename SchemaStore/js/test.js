(function () {

    var ul = document.querySelector("#schemalist ul");
    var progress = document.querySelector("progress");
    var links;

    function TestLinks() {
        links = ul.querySelectorAll("a");
        progress.max = links.length;

        for (var i = 0; i < links.length; i++) {
            SetStyles(links[i]);
            GetSchemas(links[i]);
        }
    }

    function GetSchemas(link) {
        // Using a script element since we can't trust CORS implemented on all the remote hosts
        var script = document.createElement("script");

        script.onerror = function () {
            link.style.color = "darkorange";
            link.innerHTML = "&#9888; " + link.innerHTML;
            link.title = "Could be a security issue where browsers (IE) blocks based on the MIME type. In that case, it's false alarm.";
            reportProgress();
        };

        script.onload = function () {
            link.style.color = "green";
            link.innerHTML = "&#10003; " + link.innerHTML;
            reportProgress();
        };

        script.src = link.href + "?rnd=" + Math.random();
        document.head.appendChild(script);
    }

    function reportProgress() {
        progress.value = 1 + progress.value;
    }

    function SetStyles(link) {
        link.style.background = "none";
        link.style.padding = "0";
        link.style.textDecoration = "none";
    }

    window.addEventListener("load", function load(event) {
        window.removeEventListener("load", load, false); //remove listener, no longer needed
        setTimeout(function () { TestLinks(); }, 500);
    }, false);

})();