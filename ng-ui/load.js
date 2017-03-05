/**
 * Created by vincent on 2017/3/4.
 */
// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'libs',
    paths: {
        "jquery": 'jquery/dist/jquery',
        "angular":'angular/angular',
        "angular-route":"angular/angular-route",
        "lodash":"lodash/dist/lodash",
        "transmission":"transmission",
        "init":"../initConfig"
    },shim:{
        "angular":{
            exports:"angular"
        },
        "angular-route":{
            deps: ["angular"],
            exports:"angular-route"
        }
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['init']);