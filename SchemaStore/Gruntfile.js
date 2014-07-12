
module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({

        tv4: {
            catalog: {
                options: {
                    root: grunt.file.readJSON("schemas/json/schema-catalog.json")
                },
                src: ["api/json/catalog.json"]
            },

            schemas: {
                options: {
                    fresh: true,
                    root: grunt.file.readJSON("test/hyper-schema.json"),
                },
                src: ["schemas/json/*.json"]
            }
        }
    });

    // Dynamically load schema validation based on the files and folders in /test/
    var fs = require("fs");
    var dir = "test";
    var folders = fs.readdirSync(dir);

    folders.forEach(function (folder) {

        // If it's a file, ignore and continue. We only care about folders.
        if (folder.indexOf('.') > -1)
            return;

        var schema = grunt.file.readJSON("schemas/json/" + folder.replace("_", ".") + ".json");
        var files = fs.readdirSync(dir + "/" + folder).map(function (file) { return dir + "/" + folder + "/" + file });

        grunt.config.set("tv4." + folder, {
            options: {
                root: schema,
                schemas: {
                    "http://json-schema.org/draft-04/schema#": grunt.file.readJSON("test/hyper-schema.json"),
                    "http://schemastore.org/schemas/json/jshintrc.json": grunt.file.readJSON("schemas/json/jshintrc.json"),
                    "http://schemastore.org/schemas/json/grunt-task.json": grunt.file.readJSON("schemas/json/grunt-task.json")
                },
            },

            src: files
        });

        // Write the config to disk so it can be consumed by the browser based test infrastru
        fs.writeFile("test/tests.json", JSON.stringify(grunt.config.get("tv4")));
    });

    grunt.loadNpmTasks("grunt-tv4");

    grunt.registerTask("default", ["tv4"]);
};