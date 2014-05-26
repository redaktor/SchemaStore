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
        var elemScript = document.createElement("script");

        elemScript.onerror = function () {
            link.style.color = "red";
            link.innerHTML += " &#10007;";
        };

        elemScript.onload = function () {
            link.style.color = "green";
            link.innerHTML += " &#10003;";
        };

        elemScript.src = link.href + "?rnd=" + Math.random();
        document.head.appendChild(elemScript);
    }

    function SetStyles(link) {
        link.style.background = "none";
        link.style.padding = "0";
        link.style.textDecoration = "none";
        link.innerHTML = link.href.substring(link.href.lastIndexOf("/") + 1);
    }

    window.addEventListener("load", function load(event) {
        window.removeEventListener("load", load, false); //remove listener, no longer needed
        setTimeout(function () { TestLinks() }, 500);
    }, false);

})();