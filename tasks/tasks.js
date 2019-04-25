/**
 *  © 2019, slashlib.org.
 *  Licensed under the MIT license.
 */
"use strict"

const BUILDDIR        = "build";
const DISTDIR         = "dist";
const ANGULARJSON     = "angular.json";
const ANGULARJSONSRC  = "config/angular/" + ANGULARJSON;
const ANGULARLIBJSON  = "config/angular/angular.lib.json";
const NODEREGEX       = /[\/\\]?([^\/\\]*)[\/\\]?/g;
// all library sources are provided in directories looking like lib-<something>/...
const LIBRARYPATTERN  = "lib-*";

// default configuration in case none is profided
const GRUNTEXTENSIONCONFIG = { config: {}, log: false };

function updateAngularFragment( grunt, libdir, fragment ) {
  if ( ! fragment.architect ) { grunt.fail.warn( `invalid angular.json fragment for library '${ libdir }'` ); }
  if (( fragment.architect.build ) && ( fragment.architect.build.options )) {
        if ( fragment.architect.build.options.tsConfig ) {
             fragment.architect.build.options.tsConfig   = path.posix.join( libdir, fragment.architect.build.options.tsConfig );
        }
        if ( fragment.architect.build.options.project ) {
             fragment.architect.build.options.project    = path.posix.join( libdir, fragment.architect.build.options.project );
        }
  }
  if (( fragment.architect.test ) && ( fragment.architect.test.options )) {
        if ( fragment.architect.test.options.main ) {
             fragment.architect.test.options.main        = path.posix.join( libdir, fragment.architect.test.options.main );
        }
        if ( fragment.architect.test.options.tsConfig ) {
             fragment.architect.test.options.tsConfig    = path.posix.join( libdir, fragment.architect.test.options.tsConfig );
        }
        if ( fragment.architect.test.options.karmaConfig ) {
             fragment.architect.test.options.karmaConfig = path.posix.join( libdir, fragment.architect.test.options.karmaConfig );
        }
  }
  if (( fragment.architect.lint ) && ( fragment.architect.lint.options )) {
        if ( fragment.architect.lint.options.tsConfig ) {
             let newvalues = [];
             for ( let i in fragment.architect.lint.options.tsConfig ) {
                   newvalues.push( path.posix.join( libdir, fragment.architect.lint.options.tsConfig[ i ]));
             }
             fragment.architect.lint.options.tsConfig = newvalues;
        }
  }
}

module.exports = function( grunt ) {

  grunt.registerTask( "angularjson", "Append projects to angular.json", function() {


    let config = grunt.config();

    if ( ! config.angular ) { config.angular = GRUNTEXTENSIONCONFIG; }

    // read and parse angular.json (angulars build file)
    let angularconfigfile = config.angular.config.main || ANGULARJSONSRC;
    let angularconfigjson = grunt.file.readJSON( angularconfigfile );

    // make sure angular.json provides a member "projects"
    if ( ! angularconfigjson.projects ) { angularconfigjson.projects = {}; }

    // read in library root paths
    let librarypattern  = config.angular.lib || LIBRARYPATTERN;

    // build a set of libraries which later will be iterated
    let libdirectories = grunt.file.expand({ filter: function( src ) { return grunt.file.isDir( src ); }}, librarypattern );
    let libconfigjson  = config.angular.config.lib || ANGULARLIBJSON;

    // iterate libraries and read in angular.lib.config => append to angular.json
    for ( let index in libdirectories ) {
          let libdirectory    = libdirectories[ index ];
          let jsonfragment    = grunt.file.readJSON( path.join( libdirectory, libconfigjson ));

          // append library fragment to angular.json
          angularconfigjson.projects[ jsonfragment.root ] = jsonfragment;

          // update library fragment paths
          updateAngularFragment( grunt, jsonfragment.root, jsonfragment );
    }

    let builddir = config.angular.build || BUILDDIR;
    // save angular.json to build directory
    grunt.file.write( path.posix.join( builddir, ANGULARJSON ), JSON.stringify( angularconfigjson, null, 2 ), { encoding: "UTF-8" });


  });
};
