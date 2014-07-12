(function () {
    $.ajaxSetup({ cache: false });

    var list = document.getElementById("result");
    var results = [];

    function runTest(name, files) {

        var schemaUrl = "../schemas/json/" + name + ".json";

        $.getJSON(schemaUrl, null, function (schema) {

            for (var i = 0; i < files.length; i++) {

                $.getJSON("/" + files[i], null, function (file) {
                    var result = tv4.validateMultiple(file, schema, true);
                    result.url = cleanUrl(this.url);
                    result.name = name;
                    results.push(result);
                });
            }
        });
    }

    function cleanUrl(url) {

        if (url.indexOf("/test/") === 0)
            url = url.substring(6);

        var index = url.indexOf("?");

        if (index > -1) {
            return url.substring(0, index);
        }

        return url;
    }

    $(document).ajaxStop(function () {

        results = results.sort(function (a, b) {
            if (a.name === b.name)
                return a.url > b.url;

            return a.name > b.name
        });

        list.innerHTML = "";

        var last = "";
        var ul = null;

        for (var i = 0; i < results.length; i++) {
            var result = results[i];

            if (result.name != last) {
                ul = document.createElement("ul");
                var cat = document.createElement("li");
                cat.innerHTML = result.name;
                ul.appendChild(cat);
                list.appendChild(ul);
            }

            last = result.name;

            var a = document.createElement("a");
            a.innerHTML = result.url;
            a.href = result.url;
            a.className = result.valid;

            var li = document.createElement("li");
            li.appendChild(a);

            if (!result.valid) {
                var error = result.errors.join("<br />");
                var msg = document.createElement("span");
                msg.innerHTML = error;
                li.appendChild(msg);
            }

            ul.appendChild(li);
        }
    });

    $.getJSON("tests.json", null, function (data) {

        list.innerHTML = "Testing " + (Object.keys(data).length - 2) + " JSON Schemas..."

        for (var test in data) {
            if (test === "catalog" || test == "schemas")
                continue;

            var name = test.replace("_", ".");
            var files = data[test].src;
            runTest(name, files);
        }
    });
})();