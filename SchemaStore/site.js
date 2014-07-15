(function () {
    // List all schemas in the catalog
    var req = new XMLHttpRequest();
    req.open('GET', "/api/json/catalog.json", true);
    req.onload = function () {

        var catalog = JSON.parse(req.responseText);
        var ul = document.querySelector("#schemalist ul");
        var p = document.getElementById("count");

        if (p) {
            p.innerHTML = p.innerHTML.replace("{0}", catalog.schemas.length);
        }

        for (var i = 0; i < catalog.schemas.length; i++) {

            var schema = catalog.schemas[i];
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = schema.url;
            a.title = schema.description;
            a.innerHTML = schema.name;

            li.appendChild(a);
            ul.appendChild(li);
        }
        setTimeout(function () {
            ul.parentNode.style.maxHeight = "999px";
        }, 100);

    };
    req.send(null);

    // Google Analytics
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-51110136-1', 'auto');
    ga('send', 'pageview');

})();