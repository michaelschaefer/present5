/*
Handle events triggered by a pressed keyboard button
 */
function keyDown(event) {    
    "use strict";
    var dir, keyCode = 0;    
    
    // IE hack
    if (!event) {
        event = window.event;
    }

    if (event.which) {
        keyCode = event.which;
    } else if (event.keyCode) {
        keyCode = event.keyCode;
    }    

    switch (keyCode) {		
    case 13: // select slide (in thumbnail view)
        if (currentState === PRESENTATION_MODE.THUMB) {
            slideView(currentSlideInThumbnailView, -1);
            if (dualMode === DUALMODE.DUAL && dualModeRole === DUALMODE_ROLE.PRESENTER) {
                presenterView();
            }
        }
        break;

    case 8:
    case 37:
    case 33: // backspace, left arrow, prior (presenter): slide backward
        if (currentState === PRESENTATION_MODE.SLIDE) {
            if (dualMode === DUALMODE.DUAL && dualModeRole === DUALMODE_ROLE.PRESENTER) {
                presenterViewMovement(DIRECTION.BACKWARD);
            } else {
                previousOverlay();
            }
        } else {
            if (keyCode === 37) { moveThumbnailHighlightFrame(1); }
        }
        break;

    case 38: // up arrow: row up (in thumbnail view)
        if (currentState === PRESENTATION_MODE.THUMB) {
            moveThumbnailHighlightFrame(3);
        }
        break;

	case 32:
	case 39:
    case 34: // spacebar, right arrow, next (presenter): slide forward    
	    if (currentState === PRESENTATION_MODE.SLIDE) {            
            if (dualMode === DUALMODE.DUAL && dualModeRole === DUALMODE_ROLE.PRESENTER) {
                presenterViewMovement(DIRECTION.FORWARD);
            } else {
                nextOverlay();
            }
        } else {
            if (keyCode === 39) { 
                moveThumbnailHighlightFrame(2); 
            }
        }
        break;

    case 40: // down arrow: row down (in thumbnail view)
        if (currentState === PRESENTATION_MODE.THUMB) {
            moveThumbnailHighlightFrame(4);
        }
        break;

    case 65: // a: toggle mathjax support
        toggleMathJax();
        break;

    case 67: // c: trigger 'LaTeX -> MathML' conversion
        triggerConversion();
        break;

    case 68: // d: trigger dual mode
        if (dualMode === DUALMODE.SINGLE) {
            triggerDualMode();
        } else {
            dualModeHandle.close();
            setTimeout(closeDualMode, 500);
        }        
        break;

    case 70: // f: freeze in dual mode
        if (dualMode === DUALMODE.DUAL && dualModeRole === DUALMODE_ROLE.PRESENTER) {
            toggleFreezeMode();
        }
        break;

	case 71: // g: show "goto slide" dialog	            
        gotoSlide();
        // dirty hack, since we can't forward a goto to the other window (yet?)
        if (dualMode === DUALMODE.DUAL && dualModeRole === DUALMODE_ROLE.PRESENTER) {                                    
            forwardSlideToChild();
            return;
        }
	    break;

	case 79: // o: toggle thumbnail overview
	    if (currentState === PRESENTATION_MODE.THUMB) {
	    	currentState = PRESENTATION_MODE.SLIDE;
	    	slideView(currentSlide, currentOverlay);
            if (dualMode === DUALMODE.DUAL && dualModeRole === DUALMODE_ROLE.PRESENTER) {
                presenterView(true);
            }
	    } else {
	    	currentState = PRESENTATION_MODE.THUMB;
	    	thumbnailView();
	    }
	    break;

    case 82: // r: reset timer
        if (timer !== null && timer.isRunning() === true) {
            timer.reset();
        }
        break;

    case 83: // s: start/stop timer 
        if (dualMode === DUALMODE.SINGLE || dualModeRole === DUALMODE_ROLE.PRESENTATION) {
            break;
        }

        if (timer === null) {
            timer = new Timer(presentationTime);
            timer.start();
            drawTimer();
        } else {
            if (timer.isRunning() === true) {
                timer.stop();
            } else {
                timer.start();
            }            
        }
        break;

	case 116: // f5
        if (dualMode === DUALMODE.SINGLE) {
            if (recoverSlideAndOverlay === true) {
                window.name = String(currentSlide+":"+currentOverlay);
            } else {
                window.name = "";
            }
        } else {
            if (event.preventDefault) { 
                event.preventDefault(); 
            } else {
                event.returnValue = false;
                event.keyCode = 0;
            }

        }
        break;

    case 115: // f4
        refresh();
        if (dualMode === DUALMODE.DUAL && dualModeRole === DUALMODE_ROLE.PRESENTER) {
            presenterView(true);
        }
        break;
    }    


    if (dualMode == DUALMODE.DUAL && freezeMode === false) {
        triggerDualMode(keyCode);
    }
}


function closeDualMode() {
    dualMode = DUALMODE.SINGLE;
    slideView(currentSlide, currentOverlay);
    refresh();
    freezeMode = false;
    document.getElementById("freeze").innerHTML = "";
    document.getElementById("comment").innerHTML = "";
    document.getElementById("timer").innerHTML = "";
}


function drawTimer() {
    "use strict";

    if (timer !== null && dualMode === DUALMODE.DUAL && dualModeRole === DUALMODE_ROLE.PRESENTER) {
        document.getElementById("timer").innerHTML = timer.toString();
    }

    setTimeout(drawTimer, 500);
}


function forwardSlideToChild() {
    "use strict";

    var old = freezeMode;
    freezeMode = true;
    toggleFreezeMode();
    freezeMode = old;
}


/*
Handle events triggered by pressed mouse buttons
 */
function mouseDown(event) {
    "use strict";
    var button = -1, index;

    /* IE hack */
    if (!event) {
        event = window.event;
    }

    if (event.which) {
        button = event.which;
    } else if (event.button) {
        button = event.button;
    }

    switch (button) {
	case 1: // left
	    if (currentState === PRESENTATION_MODE.THUMB) {	    	
            sendKeyCode(13);
	    } else {	    	
            sendKeyCode(39);
	    }
	    break;

	case 3: // right
	    if (currentState === PRESENTATION_MODE.SLIDE) {
	    	sendKeyCode(37);
	    }
	    break;
    }
}


function mouseMove(event) {
    "use strict";
    var diff, index, pointer;

    if (currentState === PRESENTATION_MODE.SLIDE) {
        return;
    }    

    /* IE hack */
    if (!event) {
        event = window.event;
    }

    pointer = new Vector(event.clientX, event.clientY);
    index = getIndexFromMousePosition(pointer);
    if (index == currentSlideInThumbnailView) {
        return;
    }

    if (0 <= index && index < slides.length) {
        diff = index - currentSlideInThumbnailView;
        if (diff > 0) {
            for (var i = 0; i < diff; i++) {
                sendKeyCode(39);
            }            
        } else {
            for (var i = 0; i < -diff; i++) {
                sendKeyCode(37);            
            }
        }
                
        currentSlideInThumbnailView = index;
    }
}


/*
Handle events triggered by mouse wheel
 */
function mouseWheel(event) {
    "use strict";
    var delta;

    // mouse wheel is used only in presentation mode
    if (currentState === PRESENTATION_MODE.THUMB) {
        return;
    }

    /* IE hack */
    if (!event) {
        event = window.event;
    }

    if (event.wheelDelta) {
        delta = event.wheelDelta;
    } else if (event.detail) {
        delta = -event.detail; // Mozilla case
    }

    if (delta > 0) {
        sendKeyCode(39);
    } else if (delta < 0) {
        sendKeyCode(37);
    }
}


/*
Calculate the slide index the mouse cursor is currently lying on.
 */
function getIndexFromMousePosition(pointer) {
    "use strict";
    var index;

    for (index = 0; index < slides.length; index++) {
        if (thumbnailAreas[index].isInside(pointer)) {
            return index;
        }
    }

    return -1;
}


function sendKeyCode(keyCode) {
    "use strict";

    var keyEvent = document.createEvent("KeyboardEvent");
    if (keyEvent.initKeyEvent) {        
        keyEvent.initKeyEvent("keydown", true, true, window, 0, 0, 0, 0, keyCode, 0);        
    } else if (keyEvent.initKeyboardEvent) {
        keyEvent.initKeyboardEvent("keydown", true, true, window, 0, 0, 0, 0, keyCode, 0);
    }

    keyDown(keyEvent);
}


function toggleFreezeMode() {
    "use strict";

    var dir;

    if (currentState === PRESENTATION_MODE.THUMB) {
        return;
    }

    if (freezeMode === false) {
        freezeMode = true;
        document.getElementById("freeze").innerHTML = "freeze mode on";
    } else {
        freezeMode = false;

        document.getElementById("freeze").innerHTML = "";

        dir = undefined;
        if (currentSlide > dualModeHandle.currentSlide) {
            dir = 39;
        } else if (currentSlide === dualModeHandle.currentSlide) {
            if (currentOverlay > dualModeHandle.currentOverlay) {
                dir = 39;
            } else if (currentOverlay < dualModeHandle.currentOverlay) {
                dir = 37;
            }
        } else {
            dir = 37;
        }

        if (dir === undefined) {
            return;
        }

        while (currentSlide != dualModeHandle.currentSlide || currentOverlay != dualModeHandle.currentOverlay) {
            dualModeHandle.sendKeyCode(dir);
        }            
    }
}


function triggerDualMode(keyCode) {
    "use strict";    

    if (dualMode === DUALMODE.SINGLE) {
        dualModeHandle = window.open(document.URL, "_blank");        
        setTimeout(initDualMode, 500);
    } else {
        if (dualModeRole == DUALMODE_ROLE.PRESENTER) {
            dualModeHandle.sendKeyCode(keyCode);
        }
    }
}


/*
Initialized the dual presentation mode. This function is called after the presentation window loaded completely. It is called inside the presenter mode file.
*/
function initDualMode() {    
    dualMode = DUALMODE.DUAL;    
    dualModeRole = DUALMODE_ROLE.PRESENTER;
    document.title += " [presenter mode]";
    
    dualModeHandle.dualMode = DUALMODE.DUAL;
    dualModeHandle.dualModeRole = DUALMODE_ROLE.PRESENTATION;
    dualModeHandle.document.title += " [presentation mode]";
    
    sendKeyCode(115);
    presenterView();
}

