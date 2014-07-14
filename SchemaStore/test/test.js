/// <reference path="http://geraintluff.github.io/tv4/tv4.min.js" />
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js" />

(function () {
    $.ajaxSetup({ cache: false });

    var list = document.getElementById("result");
    var recap = document.getElementById("recap");
    var progress = document.querySelector("progress");
    var results = [];

    function runTest(name, files) {

        var schemaUrl = "../schemas/json/" + name + ".json";

        $.getJSON(schemaUrl, null, function (schema) {
            var gets = [];

            for (var i = 0; i < files.length; i++) {

                gets.push($.getJSON("/" + files[i], null, function (file) {
                    var result = tv4.validateMultiple(file, schema, true);
                    result.url = cleanUrl(this.url);
                    result.name = name;
                    results.push(result);
                }));
            }

            $.when.apply($, gets).then(function () {
                progress.value = 1 + progress.value;
            });
        });
    }

    function cleanUrl(url) {
        var index = url.indexOf("/", 1);
        if (index > -1)
            url = url.substring(index + 1);

        var index = url.indexOf("?");

        if (index > -1) {
            return url.substring(0, index);
        }

        return url;
    }

    function sortResults(a, b) {
        if (a.name > b.name)
            return 1;
        else if (a.name < b.name)
            return -1;
        else if (a.url > b.url)
            return 1;

        return -1;
    }

    $(document).ajaxStop(function () {

        results = results.sort(sortResults);

        list.innerHTML = "";

        var last = "";
        var ul = null;
        var hasErrors = false;

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
            a.innerHTML = result.url.replace(result.name.replace(".", "_") + "/", "");
            a.href = result.url;
            a.className = result.valid;

            var li = document.createElement("li");
            li.appendChild(a);

            if (!result.valid) {
                var error = result.errors.map(function (e) { return "<strong>" + e.schemaPath + "</strong>: " + e.message }).join("<br />");
                var msg = document.createElement("span");
                msg.innerHTML = error;
                li.appendChild(msg);
                hasErrors = true;
                progress.style.color = "red"; //This only works in IE. How to fix?
                recap.innerHTML = "One or more tests failed";
                recap.className = "false";
            }

            ul.appendChild(li);
        }

        if (!hasErrors) {
            recap.innerHTML = "All tests ran successfully. No errors found";
            recap.className = "true";
        }

        recap.style.visibility = "visible";
    });

    $.getJSON("tests.json", null, function (data) {

        var count = (Object.keys(data).length - 2);
        list.innerHTML = "Testing " + count + " JSON Schemas...";
        progress.max = count + 1;
        progress.value = 1;

        for (var test in data) {
            if (test === "catalog" || test == "schemas")
                continue;

            var name = test.replace("_", ".");
            var files = data[test].src;
            runTest(name, files);
        }
    });
})();