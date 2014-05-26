(function () {

    var ul = document.getElementById("schemas");

    function TestLinks() {
        var links = ul.querySelectorAll("a");

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
        };

        script.onload = function () {
            link.style.color = "green";
            link.innerHTML = "&#10003; " + link.innerHTML;
        };

        script.src = link.href + "?rnd=" + Math.random();
        document.head.appendChild(script);
    }

    function SetStyles(link) {
        link.style.background = "none";
        link.style.padding = "0";
        link.style.textDecoration = "none";
        link.innerHTML = link.href.substring(link.href.lastIndexOf("/") + 1);
    }

    window.addEventListener("load", function load(event) {
        window.removeEventListener("load", load, false); //remove listener, no longer needed
        setTimeout(function () { TestLinks(); }, 500);
    }, false);

})();