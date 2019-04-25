/**
 *  © 2019, slashlib.org.
 *  Licensed under the MIT license.
 */
"use strict";

const PACKAGEJSON = "package.json";

module.exports = function( grunt ) {
  // set grunt options
  grunt.option( "pkgjson",  grunt.file.readJSON( PACKAGEJSON ));

  grunt.initConfig({

    jshint: {
      all: [
        "gruntfile.js",
        "tasks/*.js",
        "<%= nodeunit.tests %>"
      ],
      options: {
        jshintrc: ".jshintrc"
      }
    },

    // unit tests.
    nodeunit: {
      tests: [ "test/*_test.js" ]
    }
  }); // end of grunt.initConfig({ ... })

  // load this plugin's task(s) to run (test) them
  grunt.loadTasks( "tasks" );

  grunt.loadNpmTasks( "grunt-contrib-jshint"   );
  grunt.loadNpmTasks( "grunt-contrib-nodeunit" );

  // run tests
  grunt.registerTask( "test",    [ ]);

  // run lint and all tests by default
  grunt.registerTask( "default", [ "jshint", "test" ]);
};
