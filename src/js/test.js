/* global ga, tv4, get */
/// <reference path="http://geraintluff.github.io/tv4/tv4.js" />
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.js" />

(function () {

    var list = document.getElementById("result");
    var recap = document.getElementById("recap");
    var progress = document.querySelector("progress");
    var hyperSchema;

    function validateFile(element, schema, file) {
        get("/" + file + "?" + Math.random(), true, function (data) {
            validateSchema(element, data, schema);
        });
    }

    function validateSchema(element, data, schema) {
        var result = tv4.validateMultiple(data, schema, true);

        element.setAttribute("aria-invalid", !result.valid);

        if (!result.valid) {
            var error = result.errors.map(function (e) { return "<strong>" + e.dataPath + "</strong> " + e.message; }).join("<br />");
            var msg = document.createElement("span");
            msg.innerHTML = error;
            element.appendChild(msg);
            progress.setAttribute("aria-invalid", true);
            recap.innerHTML = "One or more tests failed";
            recap.setAttribute("aria-invalid", true);
        }

        progress.value = 1 + progress.value;

        if (progress.value >= progress.max && progress.attributes["aria-invalid"] === undefined) {
            recap.innerHTML = "All tests ran successfully";
            recap.setAttribute("aria-invalid", false);
        }
    }

    function cleanUrl(url) {

        var index = url.lastIndexOf("/");
        url = url.substring(index + 1);

        index = url.indexOf("?");

        if (index > -1)
            url = url.substring(0, index);

        return url.replace(".json", "");
    }

    function createElement(ul, name, file) {
        var a = document.createElement("a");
        a.innerHTML = file == "http://json-schema.org/draft-04/schema" ? "[schema draft v4]" : cleanUrl(file);
        a.href = file;
        a.setAttribute("aria-describedby", name);

        var li = document.createElement("li");
        li.appendChild(a);
        ul.appendChild(li);
        return li;
    }

    function createBlock(test) {

        var ul = document.createElement("ul");
        ul.setAttribute("role", "group");

        var cat = document.createElement("li");
        cat.innerHTML = test.name
        cat.id = test.name;
        cat.appendChild(ul);

        var schema = createElement(ul, test.name, "http://json-schema.org/draft-04/schema");

        for (var i = 0; i < test.files.length; i++) {
            var file = test.files[i];
            var li = createElement(ul, test.name, file);
        }

        get("schemas/json/" + test.name + ".json?" + Math.random(), true, function (data) {

            validateSchema(schema, data, hyperSchema);

            var links = ul.getElementsByTagName("a");

            for (var i = 0; i < links.length; i++) {
                validateFile(links[i].parentNode, data, file);
            }
        });

        list.appendChild(cat);
    }

    function setupTests(data) {

        var count = (Object.keys(data).length);
        recap.innerHTML = "Testing " + count + " JSON Schemas...";

        for (var test in data) {
            var files = data[test].files;
            data[test].name = test;
            progress.max += files.length;
            createBlock(data[test]);
        }
    }

    get("test/hyper-schema.json", true, function (data) {
        hyperSchema = data;
        tv4.addSchema("http://json-schema.org/draft-04/schema", data);
    }, true);

    get("test/tests.json?_=" + Math.random(), true, function (data) {
        setTimeout(function () { setupTests(data) }, 100);
    });



    //if (document.querySelector("progress[aria-invalid=true]") === null) {
    //    recap.innerHTML = "All tests ran successfully";
    //    recap.setAttribute("aria-invalid", false);
    //}
    //});
})();