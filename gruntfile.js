/**
 *  © 2019, slashlib.org.
 *  Licensed under the MIT license.
 */
"use strict";

const path        = require( "path" );

const BUILD       = "build";
const PACKAGEJSON = "package.json";

module.exports = function( grunt ) {
  // set grunt options
  grunt.option( "pkgjson",  grunt.file.readJSON( PACKAGEJSON ));

  grunt.initConfig({

    angularjson: {
      template:     "test/config/angular/angular.json", // file relative to gruntfile.js
      build:        BUILD,  // build directory - relative to gruntfile.js
      fragments:    [ // pattern used to look for fragment in library directories
                      "config/angular/angular.lib.json", // relative to library directory
                      "**/angular.lib.json"
                    ],
      libs:         [ // directory pattern(s) for libraries
                      "test/lib-*",
                      "test/otherlib",
                      "!test/lib-dont-include-this-one"
                    ]
    },

    copy: {
      dist_latest: {
        expand: true,
        src:    "grunt-angularjson-append-projects-*.tgz",
        dest:   ".",
        rename: function( dest /*, src */ ) {
          return path.join( dest, "grunt-angularjson-append-projects-latest.tgz" );
        }
      },
    },

    jshint: {
      all: [
        "gruntfile.js",
        "tasks/*.js"
      ],
      options: {
        jshintrc: ".jshintrc"
      }
    },

    // deployment
    shell: {
      npm_pack: {
        command: "npm pack"
      }
    }
  }); // end of grunt.initConfig({ ... })

  // load this plugin's task(s) to run (test) them
  grunt.loadTasks( "tasks" );

  grunt.loadNpmTasks( "grunt-contrib-copy"     );
  grunt.loadNpmTasks( "grunt-contrib-jshint"   );
  grunt.loadNpmTasks( "grunt-contrib-nodeunit" );
  grunt.loadNpmTasks( "grunt-shell"            );

  // run lint and all tests by default
  grunt.registerTask( "default", [ "jshint", "angularjson", "shell:npm_pack", "copy:dist_latest" ]);
};
