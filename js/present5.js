/*
Add <script> tag for JavaScript file to DOM tree
 */
function include(filename) {
    "use strict"; 
    var script;
    
    script = document.createElement("script");
    script.src = filename;
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
}


/*
script imports
 */

include("./present5/js/config.js");
include("./present5/js/datastructures.js");
include("./present5/js/general.js");
include("./present5/js/generator.js");
include("./present5/js/slidehandler.js");
include("./present5/js/inputhandler.js");
include("./present5/js/sourcecode.js");
include("./present5/js/convert.js");
