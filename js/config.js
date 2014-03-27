/*
enums
*/

var DIRECTION = {
    FORWARD : 0,
    BACKWARD : 1
}

var PRESENTATION_MODE = {
    SLIDE : 1,
    THUMB : 0
};

var DUALMODE = {
    SINGLE : 0,
    DUAL : 1
};

var DUALMODE_ROLE = {
    PRESENTER : 0,
    PRESENTATION : 1
}


/* 
global variables 
 */

// save html code for export
var originalHead;
var originalBody;

// the reference font size is 32pt for a vertical resolution of 768 px
var baseFontSize = 32;
var baseYRes = 768;

// js config variables with default values
var allowCycling = false;
var allowMouseInThumbnailView = false;
var allowNavigationByMouse = false;
var aspectRatio = "16:9";
var mathjaxPath = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
var presentationTime = null;

// dual mode
var dualModeAlpha = 0.6;
var dualModeBeta = 0.375;
var dualMode = DUALMODE.SINGLE;
var dualModeHandle = null;
var dualModeRole = null;
var timer = null;

// navigation
var currentOverlay = -1;
var currentSlide = 0;
var currentSlideInThumbnailView = 0;
var currentState = 1; // 1 = presentation, 0 = thumbnails
var freezeMode = false;
var overlays = [];
var recoverSlideAndOverlay = true;
var slides = [];

// overlay settings
var overlayOpacity = 0.1;

// geometry
var screenGeom;
var slideGeom;

// thumbnails
var thumbnailTransforms = [];
var thumbnailAreas = [];
var thumbnailGrid;
var shrinkFactor = 0.9;
var showOverlays = true;

// source code
var sourcecode_spacer = "  ";
var sourcecode_tabReplacement = "    ";

// verbosity
var errorOnGoto = true;


/*
recovers previous slide and overlay information. These information
can survive a page reload (i.e. via F5) by a small hack: The 
window.name property is used to store them.
 */
function getSlideAndOverlay() {
    "use strict";
    var num, splits;

    splits = window.name.split(":");
    if (splits.length !== 2) {
        currentSlide = 0;
        currentOverlay = -1;
    } else {
        num = Number(splits[0]);
        if (isNaN(num)) {
            currentSlide = 0;
        } else {
            currentSlide = num;
        }

        num = Number(splits[1]);
        if (isNaN(num)) {
            currentOverlay = -1;
        } else {
            currentOverlay = num;
        }
    }
}
