/**
 *  © 2019, slashlib.org.
 *  Licensed under the MIT license.
 */
"use strict";

var path = require( "path" );

const ANGULAR         = "angular";
const BUILDDIR        = "build";
const CONFIG          = "config";
const JSONSUFFIX      = "json";
const LIB             = "lib";
const UTF8            = "UTF-8";

const OPTIONS = {
  // just for the beauty if it ...
  // assume posix, as most path directives in node use posix style
  path: path.posix,
};

const ANGULARJSON     = `${ ANGULAR }.${ JSONSUFFIX }`;
const ANGULARJSONSRC  = OPTIONS.path.join( CONFIG, ANGULAR, ANGULARJSON );
const ANGULARLIBJSON  = OPTIONS.path.join( CONFIG, ANGULAR, `${ ANGULAR }.${ LIB }.${ JSONSUFFIX }` );
const TASKNAME        = `${ ANGULAR }${ JSONSUFFIX }`;
const TASKDESCRIPTION = `Append projects to ${ ANGULARJSON }`;

// all library sources are provided in directories looking like lib-<something>/...
const LIBRARYPATTERN  = `${LIB}-*`;

// default configuration in case none is profided
const GRUNTEXTENSIONCONFIG = { config: {}, log: false };

function isString( value ) {
  return ( typeof value === 'string' ) || ( value instanceof String );
}

/**
 *  Update contents of angular.json fragment
 *  Fragments specify directories relative to their own subproject,
 *  which is invalid, in repect to an enclosing project, which will
 *  build the subproject.
 *  ... so prepend the subprojects path to all path values
 */
function updateAngularFragment( grunt, options, libdir, fragment ) {
  let anode = fragment.architect;
  if ( ! anode ) { grunt.fail.warn( `invalid ${ ANGULARJSON } fragment for library '${ libdir }'` ); }

  if (( anode.build ) && ( anode.build.options )) {
        if ( anode.build.options.tsConfig ) {
             anode.build.options.tsConfig   = options.path.join( libdir, anode.build.options.tsConfig );
        }
        if ( anode.build.options.project ) {
             anode.build.options.project    = options.path.join( libdir, anode.build.options.project );
        }
  }
  if (( anode.test ) && ( anode.test.options )) {
        if ( anode.test.options.main ) {
             anode.test.options.main        = options.path.join( libdir, anode.test.options.main );
        }
        if ( anode.test.options.tsConfig ) {
             anode.test.options.tsConfig    = options.path.join( libdir, anode.test.options.tsConfig );
        }
        if ( anode.test.options.karmaConfig ) {
             anode.test.options.karmaConfig = options.path.join( libdir, anode.test.options.karmaConfig );
        }
  }
  if (( anode.lint ) && ( anode.lint.options )) {
        if ( anode.lint.options.tsConfig ) {
             let newvalues = [];
             for ( let i in anode.lint.options.tsConfig ) {
                   newvalues.push( options.path.join( libdir, anode.lint.options.tsConfig[ i ]));
             }
             anode.lint.options.tsConfig = newvalues;
        }
  }
}

module.exports = function( grunt ) {
  /**
   *  This is no multi task.
   *  Generating the angular.json is run only once, by reading in the
   *  main template and then iterating the child projects, looking for
   *  fragments like angular.lib.json.
   *  The fragments are supplemented and appended to the main template,
   *  the resulting object is stringified and written to angular.json
   *
   *  You may:
   *    - hold the main template in a directory with a name of your
   *      choice. e.g.: <project>/config/angular/template.json
   *        - angular.template = "/config/angular/template.json"
   *
   *    - hold the fragments in their own project subdirectories,
   *      like:<project>/<subproject>/config/angular/fragment.json
   *        - angular.fragments = "/config/angular/fragment.json"
   *        or
   *        - angular.fragments = pattern
   *        or
   *        - angular.fragments = [ pattern1, !pattern2, ... ]
   *        but make sure, the patterns matche only one file per
   *        subproject!
   *        pattern can contain directory (**) and file (*) wildcards.
   *
   *    - specify the (sub)projects/libraries that should become part
   *      of the angular.json (and later be built).
   *        - angular.libs = [ pattern1, !pattern2, ... ]
   *      note: only (sub)projects matching one of the patterns will
   *            be searched for their angular.fragment
   *
   *  The resulting angular.json will be written to the build directory.
   */
  grunt.registerTask( TASKNAME, TASKDESCRIPTION, function() {
    // provide default options
    let options    = OPTIONS;
    // provide default configuration
    let angularcfg = grunt.config().angularjson || GRUNTEXTENSIONCONFIG;

    // read and parse angular.json (angulars build file)
    // note: template holds a path/filename. it's not a pattern!
    //       (there can be only one! :-)
    let angularconfigfile = angularcfg.template || ANGULARJSONSRC;
    let angularconfigjson = grunt.file.readJSON( angularconfigfile );

    // make sure angular.json provides a member "projects" (if not, create it)
    if ( ! angularconfigjson.projects ) { angularconfigjson.projects = {}; }

    // read in library root paths
    let librarypattern  = angularcfg.libs || LIBRARYPATTERN;

    // build a set of libraries (must be directories) which later will be iterated
    let libdirectories = grunt.file.expand({ filter: function( src ) { return grunt.file.isDir( src ); }}, librarypattern );

    // get the fragment pattern and convert it to an array
    let libfragmentpattern  = angularcfg.fragments || ANGULARLIBJSON;
    if ( isString( libfragmentpattern )) { libfragmentpattern = [ libfragmentpattern ]; }

    // predefine a reusable filter function
    let filter = function( src ) { return grunt.file.isFile( src ); };

    let cwd = process.cwd();

    // iterate libraries and read in angular.lib.config => append to angular.json
    for ( let index in libdirectories ) {
          let libdirectory = libdirectories[ index ];

          // descend into library/subproject directory
          grunt.file.setBase( cwd, libdirectory);

          // resolve the fragment pattern to (hopefully) one file
          let fragments    = grunt.file.expand({ filter: filter }, libfragmentpattern );
          if ( fragments.length < 1 ) { grunt.fail.warn( `no ${ ANGULARJSON } fragment found for library '${ libdirectory }'` ); }
          if ( fragments.length > 1 ) { grunt.fail.warn( `too many ${ ANGULARJSON } fragments found for library '${ libdirectory }': ${ JSON.stringify( fragments )}` ); }

          // read and parse fragment
          let jsonfragment = grunt.file.readJSON( fragments[0] );

          // append library fragment to angular.json
          angularconfigjson.projects[ jsonfragment.root ] = jsonfragment;

          // update library fragment paths
          updateAngularFragment( grunt, options, jsonfragment.root, jsonfragment );
    }

    // return to cwd
    grunt.file.setBase( cwd );

    let builddir = angularcfg.build || BUILDDIR;
    // save angular.json to build directory
    grunt.file.write( options.path.join( builddir, ANGULARJSON ), JSON.stringify( angularconfigjson, null, 2 ), { encoding: UTF8 });
  });
};
