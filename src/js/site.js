/* global ga */

(function (global) {

    global.get = function (url, asJson, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (asJson)
                callback(JSON.parse(xhr.responseText));
            else
                callback(xhr.responseText);
        };

        xhr.send();
    };

}(typeof window !== undefined ? window : this));



(function () {

    var ul = document.querySelector("#schemalist ul");
    var p = document.getElementById("count");

    if (!ul || !p)
        return;

    get("/api/json/catalog.json", true, function (catalog) {

        p.innerHTML = p.innerHTML.replace("{0}", catalog.schemas.length);

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

        ul.parentNode.style.maxHeight = "9999px";
    });

})();


(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
})(window, document, 'script', '//google-analytics.com.m82.be/analytics.js', 'ga');

ga('create', 'UA-51110136-1', 'auto');
ga('send', 'pageview');
