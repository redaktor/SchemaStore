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
            a.href = schema.url.replace("http://schemastore.org", "");
            a.title = schema.description;
            a.innerHTML = schema.name;

            li.appendChild(a);
            ul.appendChild(li);
        }
        setTimeout(function () {
            ul.parentNode.style.maxHeight = "9999px";
        }, 100);

    };
    req.send(null);

})();