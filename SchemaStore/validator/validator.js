/// <reference path="http://geraintluff.github.io/tv4/tv4.js" />
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.js" />

(function () {
    $.ajaxSetup({ cache: false });
    var select = document.querySelector("select");
    var schema = document.getElementById("schema");
    var json = document.getElementById("json");
    var toggle = document.getElementById("toggle");
    var output = document.querySelector("output");

    function onSelectChange() {
        
        if (select.selectedIndex > 0)
            location.hash = select.options[select.selectedIndex].text;
        else
            location.hash = "";
    }

    function loadSchema() {

        if (select.selectedIndex === 0) {
            schema.value = "";
            schema.style.display = "block";
            toggle.innerHTML = "Hide schema";
            clear();
        }
        else {
            var url = select.options[select.selectedIndex].value;

            $.get(url, null, function (data) {

                schema.value = data;
                toggle.style.display = "inline";
                validate();
            });

            toggle.style.display = "inline";
        }
    }

    function toggleSchema() {
        if (schema.style.display !== "none") {
            schema.style.display = "none";
            this.innerHTML = "Show schema";
            localStorage.toggle = false;
        }
        else {
            schema.style.display = ""
            this.innerHTML = "Hide schema";
            localStorage.toggle = true;
        }

        return false;
    }

    function loadSelect() {
        $.getJSON("/api/json/catalog.json", null, function (data) {

            for (var i = 0; i < data.schemas.length; i++) {

                var schema = data.schemas[i];

                if (schema.url.indexOf("schemastore.org") < 0)
                    continue;

                var option = document.createElement("option");
                option.text = schema.name;
                option.value = schema.url;

                if (location.hash === "#" + option.text) {
                    option.selected = "selected";
                }

                select.querySelector("optgroup").appendChild(option);
            }

            loadSchema();
        });
    }

    //function loadHyperSchema() {
    //    $.getJSON("/test/hyper-schema.json", null, function (data) {

    //        tv4.addSchema("http://json-schema.org/draft-04/schema", data);
    //    });
    //}

    function validate() {

        if (!IsJsonString(json.value) || !IsJsonString(schema.value))
            return;

        localStorage.json = json.value;

        var result = tv4.validateMultiple(JSON.parse(json.value), JSON.parse(schema.value), true);

        if (result.valid) {
            clear();
            output.innerHTML = "Congrats! The JSON validates against the schema";
            output.className = "true";
            json.className = "true";
        }
        else {
            var errors = "";
            for (var i = 0; i < result.errors.length; i++) {

                var error = result.errors[i];
                errors += "<dl>";

                if (error.dataPath)
                    errors += "<dd>Data path</dd><dt>" + error.dataPath + "</dt>";

                errors += "<dd>Message</dd><dt>" + error.message + "</dt>";
                errors += "<dd>Schema path</dd><dt>" + error.schemaPath + "</dt>";
                errors += "</dl>";
            }

            output.innerHTML = errors;
            output.className = "false";
            json.className = "false";
            json.parentNode.firstElementChild.innerHTML = "JSON: Found " + result.errors.length + " error(s)."
            json.parentNode.firstElementChild.className = "false";
        }
    }

    function clear() {
        json.className = "";
        json.parentNode.firstElementChild.innerHTML = "JSON:"
        json.parentNode.firstElementChild.className = "";
        output.className = "";
        output.innerHTML = "";
    }

    function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    $(function () {
        json.value = localStorage.json || "";

        if (localStorage.toggle === "false") {
            schema.style.display = "none";
            toggle.innerHTML = "Show schema";
        }

        if (location.hash === "")
            schema.style.display = "block";

        select.onchange = onSelectChange;
        schema.onkeyup = validate;
        json.onkeyup = validate;
        toggle.onclick = toggleSchema;
        window.onhashchange = loadSchema;
    });

    loadSelect();
})();