/// <vs BeforeBuild='default' />
/*global module */
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

    grunt.loadNpmTasks("grunt-tv4");

    grunt.registerTask("default", ["tv4"]);
};