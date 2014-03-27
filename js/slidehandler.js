/*
 navigational stuff
 */


/*
Moves to a certain slide that is specified by the user in a prompt.
 */
function gotoSlide() {
    "use strict";
    var index = window.prompt("Switch to the following slide:", "Available range: 1 to " + slides.length);

    if (index === null) {
        return;
    }

    if (isNaN(index)) {
        if (errorOnGoto === true) {
            window.alert("Please give a number.");
        }
        return;
    }

    if (index < 1 || index > slides.length) {
        if (errorOnGoto === true) {
            window.alert("Please give a number between 1 and " + slides.length + ".");
        }
        return;
    }

    if (dualMode == DUALMODE.DUAL && dualModeRole == DUALMODE_ROLE.PRESENTER) {
        presenterView(false);
    }

    if (currentState === PRESENTATION_MODE.THUMB) {
        currentState = PRESENTATION_MODE.SLIDE;
        slideView();
    } else {
        hideSlide(currentSlide);
    }

    currentSlide = index - 1;
    showSlide(currentSlide);
    hideAllOverlays(currentSlide);
    currentOverlay = -1;

    if (dualMode == DUALMODE.DUAL && dualModeRole == DUALMODE_ROLE.PRESENTER) {
        presenterView(true);
    }
}


/*
Switch to next overlay; if neccessary switch to next slide.
 */
function nextOverlay() {
    "use strict";

    if (overlays[currentSlide].length === 0 || currentOverlay >= overlays[currentSlide].length - 1) {
        nextSlide();
    } else {
        currentOverlay++;
        showOverlay(currentSlide, currentOverlay);
    }
}


/*
Switch to next slide.
 */
function nextSlide() {
    "use strict";
    var oldSlide = currentSlide;

    if (currentSlide === slides.length - 1) {
        if (allowCycling === true) {
            currentSlide = 0;
        } else {
            return;
        }
    } else {
        currentSlide++;
    }

    hideSlide(oldSlide);
    showSlide(currentSlide);
    hideAllOverlays(currentSlide);
    currentOverlay = -1;
}


/*
Move the frame highlighting the currently selected thumbnail in the specified direction. The supported values are {1,2,3,4} standing for {left,right,up,down}
*/
function moveThumbnailHighlightFrame(direction) {
    "use strict";
    var oldIndex, n = thumbnailGrid.x, m = thumbnailGrid.y, N = slides.length;

    oldIndex = currentSlideInThumbnailView;
    switch (direction) {        
        case 1: // left 
        currentSlideInThumbnailView--;
        if (currentSlideInThumbnailView < 0) {
            currentSlideInThumbnailView = N - 1;
        }
        break;       

        case 2: // right
        currentSlideInThumbnailView++;
        if (currentSlideInThumbnailView >= N) {
            currentSlideInThumbnailView = 0;
        }
        break;

        case 3: // up
        currentSlideInThumbnailView -= m;
        if (currentSlideInThumbnailView < 0) {
            currentSlideInThumbnailView = ((currentSlideInThumbnailView + m) % m) - 1 + (n-1) * m;
            if (currentSlideInThumbnailView < 0) {
                currentSlideInThumbnailView = N-1;
            } else if (currentSlideInThumbnailView >= N) {
                currentSlideInThumbnailView -= m;
            }
        }
        break;

        case 4: // down
        currentSlideInThumbnailView += m;
        if (currentSlideInThumbnailView >= N) {
            currentSlideInThumbnailView = currentSlideInThumbnailView % m + 1;
            if (currentSlideInThumbnailView === m) {
                currentSlideInThumbnailView = 0;
            }
        }
        break;
    }

    //slides[currentSlideInThumbnailView].style.boxShadow = "0 0 1em 1em #fc0";
    highlightThumbnail(oldIndex, currentSlideInThumbnailView);
}


/*
Set the frame highlighting the currently selected thumbnail to a specific one.
*/
function highlightThumbnail(currentIndex, newIndex) {
    "use strict";

    if (currentState === PRESENTATION_MODE.THUMB) {
        slides[currentIndex].style.boxShadow = "";
        slides[newIndex].style.boxShadow = "0 0 1em 1em #fc0";
        if (allowMouseInThumbnailView === true) {
            slides[currentIndex].setOnMouseMove(mouseMove);
            slides[newIndex].setOnMouseMove(undefined);
        }
    }
}


/*
Switch to previous overlay; if neccessary switch to previous slide.
 */
function previousOverlay() {
    "use strict";

    if (overlays[currentSlide].length === 0 || currentOverlay <= -1) {
        previousSlide();
    } else {
        currentOverlay--;
        hideOverlay(currentSlide, currentOverlay + 1);
        if (currentOverlay >= 0) {
            showOverlay(currentSlide, currentOverlay);
        }
    }
}


/*
Switch to previous slide.
 */
function previousSlide() {
    "use strict";
    var oldSlide = currentSlide;

    if (currentSlide === 0) {
        if (allowCycling === true) {
            currentSlide = slides.length - 1;
        } else {
            return;
        }
    } else {
        currentSlide--;
    }

    hideSlide(oldSlide);
    showSlide(currentSlide);
    showAllOverlays(currentSlide);
    currentOverlay = overlays[currentSlide].length - 1;
}


/* 
visibility stuff
 */


/*
Hide all overlays on the given slide.
 */
function hideAllOverlays(index) {
    "use strict";
    var overlayIndex;

    for (overlayIndex = 0; overlayIndex < overlays[index].length; overlayIndex++) {
        hideOverlay(index, overlayIndex);
    }
}


/*
Hide all slides in the presentation.
 */
function hideAllSlides() {
    "use strict";
    var index;

    for (index = 0; index < slides.length; index++) {		
        hideSlide(index);
        hideAllOverlays(index);
    }
}


/*
Hide a certain overlay on a certain slide.
 */
function hideOverlay(slideIndex, overlayIndex) {
    "use strict";
    var tagIndex;

    for (tagIndex = 0; tagIndex < overlays[slideIndex][overlayIndex].length; tagIndex++) {
        overlays[slideIndex][overlayIndex][tagIndex].style.opacity = overlayOpacity;
    }
}


/*
Hide a certain slide.
 */
function hideSlide(index) {
    "use strict";
    slides[index].hide();
}


/*
Show all overlays on a certain slide.
 */
function showAllOverlays(index) {
    "use strict";
    var overlayIndex;

    for (overlayIndex = 0; overlayIndex < overlays[index].length; overlayIndex++) {
        showOverlay(index, overlayIndex);
    }
}


/*
Show a certain overlay on a certain slide.
 */
function showOverlay(slideIndex, overlayIndex) {
    "use strict";
    var tagIndex;

    for (tagIndex = 0; tagIndex < overlays[slideIndex][overlayIndex].length; tagIndex++) {
        overlays[slideIndex][overlayIndex][tagIndex].style.opacity = 1.0;
    }
}


/*
Show a certain slide and all overlays on it with an index of at most a 
specified value.
 */
function showSlide(slideIndex, maxOverlayIndex) {
    "use strict";
    var overlayIndex;

    slides[slideIndex].show();

    // possibly show some overlays
    if (maxOverlayIndex !== undefined && maxOverlayIndex > -1) {
        for (overlayIndex = 0; overlayIndex < overlays[slideIndex].length; overlayIndex++) {
            if (overlayIndex <= maxOverlayIndex) {
                showOverlay(slideIndex, overlayIndex);
            } else {
                hideOverlay(slideIndex, overlayIndex);
            }
        }
    } else {
        hideAllOverlays(slideIndex);
    }
}


/*
  view mode stuff
 */


function presenterView(enable) {
    "use strict";
    
    var transformations;

    if (enable === undefined || enable == true) {
        transformations  = presenterViewTransformations();

        slides[currentSlide].style.MozTransform = transformations[0];
        slides[currentSlide].style.webkitTransform = transformations[0];
        slides[currentSlide].show();
        document.getElementById("comment").innerHTML = slides[currentSlide].comments;

        if (currentSlide < slides.length - 1) {
            slides[currentSlide+1].style.MozTransform = transformations[1];
            slides[currentSlide+1].style.webkitTransform = transformations[1];
            slides[currentSlide+1].show();
        }
    } else {
        slides[currentSlide].style.MozTransform = "";
        slides[currentSlide].style.webkitTransform = "";
        slides[currentSlide].hide();
        document.getElementById("comment").innerHTML = "";

        if (currentSlide < slides.length - 1) {
            slides[currentSlide+1].style.MozTransform = "";
            slides[currentSlide+1].style.webkitTransform = "";            
            slides[currentSlide+1].hide();
        }
    }
    
 }


function presenterViewMovement(direction) {
    "use strict";

    var transformations = presenterViewTransformations();
    
    slides[currentSlide].style.MozTransform = "";
    slides[currentSlide].style.webkitTransform = "";

    if (currentSlide < slides.length - 1) {
        slides[currentSlide+1].style.MozTransform = "";
        slides[currentSlide+1].style.webkitTransform = "";
        slides[currentSlide+1].hide();
    }

    if (direction == DIRECTION.FORWARD) {
        nextOverlay();
    } else {
        previousOverlay();
    }

    slides[currentSlide].style.MozTransform = transformations[0];
    slides[currentSlide].style.webkitTransform = transformations[0];
    document.getElementById("comment").innerHTML = slides[currentSlide].comments;

    if (currentSlide < slides.length - 1) {
        slides[currentSlide+1].style.MozTransform = transformations[1];
        slides[currentSlide+1].style.webkitTransform = transformations[1];
        slides[currentSlide+1].show();
        showAllOverlays(currentSlide+1);
    }
 }


 function presenterViewTransformations() {
    "use strict";

    var scaleBig, scaleSmall, transformations = [];

    scaleBig = dualModeAlpha * screenGeom.width / slideGeom.width;
    scaleSmall = dualModeBeta * screenGeom.width / slideGeom.width;

    transformations.push("translate(" + -screenGeom.width/2 + "px," + -screenGeom.height/2 + "px) scale(" + scaleBig + "," + scaleBig + ") translate(" + slideGeom.width/2 + "px," + slideGeom.height/2 + "px)");
    transformations.push("translate(" + -screenGeom.width/2 + "px," + -screenGeom.height/2 + "px) scale(" + scaleSmall + "," + scaleSmall + ") translate(" + (-0.5*slideGeom.width + screenGeom.width/scaleSmall) + "px," + slideGeom.height/2 + "px)");

    return transformations;
 }


/*
Switch to normal presentation mode. This means resetting all transformation
and hiding all but the current slide.
 */
function slideView(slideIndex, slideOverlay) {
    "use strict";
    var index;

    for (index = 0; index < slides.length; index++) {
        slides[index].style.MozTransform = "";
        slides[index].style.webkitTransform = "";
        hideSlide(index);
    }

    // no highlighting in slide mode
    //document.getElementById("hover").childNodes[0].data = "article:hover { box-shadow: none; }";
    slides[currentSlideInThumbnailView].style.boxShadow = "";

    currentState = PRESENTATION_MODE.SLIDE;
    currentSlide = slideIndex;
    currentOverlay = slideOverlay;
    showSlide(currentSlide, currentOverlay);
}


/*
Switch to thumbnail mode. This means activating transformations and
showing all slides.
 */
function thumbnailView() {
    "use strict";
    var index;

    currentSlideInThumbnailView = currentSlide;
    slides[currentSlideInThumbnailView].style.boxShadow = "0 0 1em 1em #fc0";

    for (index = 0; index < slides.length; index++) {
        showSlide(index);
        if (showOverlays === true) {
            showAllOverlays(index);
        } else {
            hideAllOverlays(index);
        }
		
        slides[index].style.MozTransform = thumbnailTransforms[index];
        slides[index].style.webkitTransform = thumbnailTransforms[index];

        if (allowMouseInThumbnailView === true && index !== currentSlideInThumbnailView) {
            slides[index].setOnMouseMove(mouseMove);
        }
    }
}
