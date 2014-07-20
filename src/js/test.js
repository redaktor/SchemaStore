/* global ga, tv4 */
/// <reference path="http://geraintluff.github.io/tv4/tv4.js" />
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.js" />

(function () {
    //$.ajaxSetup({ cache: false });

    var list = document.getElementById("result");
    var recap = document.getElementById("recap");
    var progress = document.querySelector("progress");
    var results = [];
    var hyperSchema;

    function runTest(name, files) {

        var schemaUrl = "../schemas/json/" + name + ".json";

        $.getJSON(schemaUrl, null, function (schema) {
            var gets = [];

            var hyper = tv4.validateMultiple(schema, hyperSchema, true);
            hyper.url = "[schema draft v4]";
            hyper.name = name;
            results.push(hyper);

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

        index = url.indexOf("?");

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

            if (result.name !== last) {
                ul = document.createElement("ul");
                ul.setAttribute("role", "group");

                var cat = document.createElement("li");
                cat.innerHTML = result.name;
                cat.id = result.name;

                cat.appendChild(ul);
                list.appendChild(cat);
            }

            last = result.name;

            var a = document.createElement("a");
            a.innerHTML = result.url.replace(result.name.replace(".", "_") + "/", "").replace(".json", "");
            a.href = "test/" + result.url;
            a.setAttribute("aria-describedby", result.name);

            if (result.url.indexOf("schema draft") > -1)
                a.href = "http://json-schema.org/draft-04/schema";

            var li = document.createElement("li");
            li.setAttribute("aria-invalid", !result.valid);
            li.appendChild(a);

            if (!result.valid) {
                var error = result.errors.map(function (e) { return "<strong>" + e.dataPath + "</strong>: " + e.message; }).join("<br />");
                var msg = document.createElement("span");
                msg.innerHTML = error;
                li.appendChild(msg);
                hasErrors = true;
                progress.style.color = "red"; //This only works in IE. How to fix?
                recap.innerHTML = "One or more tests failed";
                recap.setAttribute("aria-invalid", true);
            }

            ul.appendChild(li);
        }

        if (!hasErrors) {
            // Set timeout to delay the reponse. Give people a change to see the loader
            setTimeout(function () {
                recap.innerHTML = "All tests ran successfully";
                recap.setAttribute("aria-invalid", false);
            }, 1000);
        }
    });

    $.getJSON("test/hyper-schema.json", null, function (data) {
        hyperSchema = data;
        tv4.addSchema("http://json-schema.org/draft-04/schema", hyperSchema);

        $.getJSON("test/tests.json", null, function (data) {

            var count = (Object.keys(data).length - 3);
            recap.innerHTML = "Testing " + count + " JSON Schemas...";
            progress.max = count + 1;
            progress.value = 1;

            for (var test in data) {
                if (test === "catalog" || test === "schemas" || test === "options")
                    continue;

                var name = test.replace("_", ".");
                var files = data[test].src;
                runTest(name, files);
            }
        });
    });
})();