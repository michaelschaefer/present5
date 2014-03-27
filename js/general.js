window.onload = initialize;

function initialize() {
    "use strict";
    var aspectParts, div, style;

    originalHead = document.getElementsByTagName("head")[0].outerHTML;
    originalBody = document.getElementsByTagName("body")[0].outerHTML;


    /*
	initialize the presentation
     */     

    // generate presentation by DOM tree refactoring (cf. generator.js)
    generatePresentation();    

    // convert aspectRatio to a real number
    if (typeof aspectRatio === "string") {
        aspectParts = aspectRatio.split(":");
        aspectRatio = aspectParts[0] / aspectParts[1];
    }

    /* 
    activate event handling; onmouseover is handled only in thumbnail view, cf. slidehandler.js and inputhandler.js
    */

    if (allowNavigationByMouse === true) {
        document.onmousewheel = mouseWheel;
        if (window.addEventListener) {
            window.addEventListener('DOMMouseScroll', mouseWheel, false);
        }   
        document.onmousedown = mouseDown;
    }

    document.oncontextmenu = function () {        
        return false;
    };    

    document.onkeydown = keyDown;    

    // set up overlays and show the first slide
    determineSlideInformation();
    hideAllSlides();
    showSlide(currentSlide, currentOverlay);

    // create comment div
    addPresenterViewDivs();    

    refresh();

    // add article:hover style sheet
    style = document.createElement("style");
    style.setAttribute("id", "hover");
    style.setAttribute("type", "text/css");
    if (style.styleSheet) {
        style.styleSheet.cssText = "";
    } else {
        style.appendChild(document.createTextNode(""));
    }
    document.getElementsByTagName("head")[0].appendChild(style);

    // refactor source code in <pre> tags (cf. sourcecode.js)
    refactorSourcecode();    
}


function addPresenterViewDivs() {
    "use strict";
    var div;

    // comment div
    div = document.createElement("div");
    div.setAttribute("id", "comment");
    document.getElementsByTagName("body")[0].appendChild(div);

    // freeze mode div
    div = document.createElement("div");
    div.setAttribute("style", "position: absolute; bottom: 1em; left: 1em; margin: auto; color: red; font-weight: bold; padding: 0em; display: block;");
    div.setAttribute("id", "freeze");
    document.getElementsByTagName("body")[0].appendChild(div);    

    // timer div
    div = document.createElement("div");
    div.setAttribute("style", "position: absolute; bottom: 3em; left: 1em; margin: auto; color: white; font-weight: bold; padding: 0em; display: block;");
    div.setAttribute("id", "timer");
    document.getElementsByTagName("body")[0].appendChild(div);    
}


/*
Collects all slides in a global array, generates the overlays and recovers
currentSlide and currentOverlay data if possible.
 */
function determineSlideInformation() {
    "use strict";
    var allTags = [], classAttr, currentTag, dataset, index, overlayIndex, pos, sections, tagIndex;

    // get all slides aka. section tags
    sections = document.getElementsByTagName("section");
    for (index = 0; index < sections.length; index++) {
        slides.push(new Slide(sections.item(index)));
    }


    // for each slide store all overlay tags in an array
    for (index = 0; index < slides.length; index++) {
        allTags = slides[index].section.getElementsByTagName("*");
        overlays[index] = [];

        for (tagIndex = 0; tagIndex < allTags.length; tagIndex++) {
            currentTag = allTags[tagIndex];
            dataset = currentTag.dataset;
            if (dataset === undefined) { 
                continue; 
            }
            classAttr = dataset.overlay;            

            // check if current tag has an attribute data-overlay
            if (classAttr !== undefined) {
                pos = Number(classAttr);
                if (!isNaN(pos) && pos > 0) {
                    if (overlays[index][pos-1] === undefined) {
                        overlays[index][pos-1] = [];
                    }
                    overlays[index][pos-1].push(currentTag);
                }
            }
        }

        // replace missing overlay layers with empty arrays
        for (overlayIndex = 0; overlayIndex < overlays[index].length; overlayIndex++) {
            if (overlays[index][overlayIndex] === undefined) {
                overlays[index][overlayIndex] = [];
            }
        }
    }

    // possibly recover slide and overlay information
    if (recoverSlideAndOverlay === true) {
        getSlideAndOverlay();
        currentSlide = Math.min(currentSlide, slides.length - 1);
        currentOverlay = Math.min(currentOverlay, overlays[currentSlide].length - 1);
    }
}


function refresh() {
    "use strict";

    var body, fontSize, scale;

    body = document.getElementsByTagName("body")[0];    
    screenGeom = new Rectangle(new Vector(), new Vector(body.offsetWidth, body.offsetHeight)); 

    // resize slides according to the screen size and their aspect ratio    
    resize(screenGeom.width / screenGeom.height);

    // re-position comment div
    scale = dualModeBeta * screenGeom.width / slideGeom.width;
    document.getElementById("comment").setAttribute("style", "font-size: 0.5em; position: absolute; top: " + (scale * slideGeom.height) + "px; left: " + ((1-dualModeBeta) * screenGeom.width) + "px; color: red; padding-top: 0.5em;")

    // calculate the optimal thumbnail size
    determineThumbnailInformation();

    // correct font size
    fontSize = baseFontSize * slideGeom.height / baseYRes;    
    body.style.fontSize = fontSize + "pt";        
}


/*
Calculates new slide geometry from the browser window's current size and the 
given aspect ration.
 */
function resize(aspectScreen) {
    "use strict";
    var height = 100, index, left = 0, origin, size, top = 0, width = 100;

    if (aspectScreen >= aspectRatio) {
        width = 100 * aspectRatio / aspectScreen;
        left = 0.5 * (100 - width);
    } else {
        height = 100 * aspectScreen / aspectRatio;
        top = 0.5 * (100 - height);
    }

    for (index = 0; index < slides.length; index++) {
        slides[index].resize(top, left, width, height);
    }

    size = slides[0].size;
    origin = screenGeom.size.plus(size.times(-1)).times(0.5);
    slideGeom = new Rectangle(origin, size);
}


/*
Determines the optimal size (n times m) of the thumbnail grid.
The size is calculated in such a way that all slides fit onto 
the screen without scroll bars and appear as little scaled down 
as possible.
 */
function determineThumbnailInformation() {
    "use strict";
    var k, m, n, ratioH, ratioW, z, zn;

    k = slides.length;
    ratioH = screenGeom.height / slideGeom.height;
    ratioW = screenGeom.width / slideGeom.width;
    for (n = 1; n <= k; n++) {
        m = Math.ceil(k / n);
        zn = Math.min(ratioW / m, ratioH / n);
        if (n === 1 || zn > z) {
            z = zn;
            thumbnailGrid = new Vector(n, m);
        }
    }

    // retrieve transformations for the optimal grid
    getThumbnailTransforms(z);
}


/*
Generate 2D transformations for each slide to make it appear 
translated and shrinked to the right position in the slide
overview.
 */
function getThumbnailTransforms(zoomFactor) {
    "use strict";
    var fromOrigin, index, left, shift, shrink, space, toOrigin, top, tr1, tr2, z, m, n;
	
    tr1 = screenGeom.size.times(-0.5);
    tr2 = slideGeom.size.times(0.5);
    z = zoomFactor * shrinkFactor;

    toOrigin = "translate(" + tr1.x + "px, " + tr1.y + "px)";
    shrink = "scale(" + z + ", " + z + ")";
    fromOrigin = "translate(" + tr2.x + "px, " + tr2.y + "px)";

    m = thumbnailGrid.y;
    n = thumbnailGrid.x;
    space = new Vector();
    space.x = (screenGeom.width - slideGeom.width * m * z) / ((m + 1) * z);
    space.y = (screenGeom.height - slideGeom.height * n * z) / ((n + 1) * z);
    left = space.x;
    top = space.y;
	
    for (index = 0; index < slides.length; index++) {
        shift = "translate(" + left + "px, " + top + "px)";
        thumbnailTransforms[index] = toOrigin + shrink + fromOrigin + shift;
        thumbnailAreas[index] = new Rectangle(new Vector(left*z, top*z), slideGeom.size.times(z));

        if ((index + 1) % m === 0) {
            left = space.x;
            top += slideGeom.height + space.y;
        } else {
            left += slideGeom.width + space.x;
        }
    }
}
