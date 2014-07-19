/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.js" />

(function () {

    $.getJSON("/api/json/catalog.json", null, function (catalog) {
        var ul = document.querySelector("#schemalist ul");
        var p = document.getElementById("count");

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

        setTimeout(function () {
            ul.parentNode.style.maxHeight = "9999px";
        }, 100);
    });
})();