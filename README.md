# grunt-angularjson-append-projects
use grunt to append projects to an angular.json file

## story ##
angular 6 introduced creating angular libraries by using the angular cli.
* create a project: <code>ng new angular-library-container</code>
* create a subproject (library): <code>ng generate library example-angular-lib --prefix=pfx</code>

If you are not yet familiar to this, I recommend reading:  
https://blog.angularindepth.com/creating-a-library-in-angular-6-87799552e7e5  
https://blog.angularindepth.com/angular-workspace-no-application-for-you-4b451afcc2ba

... which works perfectly, if you did not release libraries before the time of angular 6. If you did - well, you have to glue things together. Which is why I created grunt-angularjson-append-projects.

## getting started ##

This guide assumes, that you are familiar with the use of grunt.  
After having installed grunt@>=1.0.4, you may install this plugin by the following command:

<code>npm install grunt-angularjson-append-projects --save-dev</code>

Once the plugin has been installed, it may be loaded from within your gruntfile:

<code>grunt.loadNpmTasks( "angularjson" );</code>

The task can be run now:

<code>grunt angularjson</code>

## usage ##


```javascript
const BUILD = "build";

angularjson: {
  template:     "config/angular/angular.json", // file relative to gruntfile.js
  build:        BUILD,  // build directory - relative to gruntfile.js
  libs:         [ // directory pattern(s) for including libraries, relative to gruntfile.js
                  "lib-*",
                  "otherlib",
                  "!lib-dont-include-this-one"
                ],
  fragments:    [ // pattern(s) used to search for (one!) fragment in each library directory (see: libs)
                  "config/angular/angular.lib.json", // relative to library directory
                  "**/angular.lib.json"
                ]
},

```
