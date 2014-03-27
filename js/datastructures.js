/*
Class representing a simple 2D vector and provides some simple arithmetics
 */
function Vector(x, y) {
    "use strict";

    // allow standard vector
    if (x === undefined) { x = 0; }
    if (y === undefined) { y = 0; }

    // parameters
    this.x = x;
    this.y = y;


    /*
      member functions
     */

    // return this + v, leave this unchanged
    this.plus = function (v) {
        if (v instanceof Vector) {
            return (new Vector(v.x + this.x, v.y + this.y));
        }

        // return zero if v is no vector
        return (new Vector());
    };

    // return this * r, leave this unchanged
    this.times = function (r) {
        if (typeof r === "number") {
            return (new Vector(r * this.x, r * this.y));
        }

        // return zero if r is no number
        return (new Vector());
    };

    // convert this to a string representation
    this.toString = function () {
        return ("(" + this.x + "," + this.y + ")");
    };

}


/*
represents a 2D rectangle and provides and isInside function
(which is called with a Vector, cf. above).
 */
function Rectangle(origin, size) {
    "use strict";

    // allow standard rectangle
    if (!(origin instanceof Vector)) {
        origin = new Vector();
    }

    if (!(size instanceof Vector)) {
        size = new Vector();
    }

    // parameters
    this.origin = origin;
    this.height = size.y;
    this.width = size.x;
    this.size = size;
    this.end = origin.plus(size);


    /*
      member functions
     */

    // check whether given vector is inside the rectangle
    this.isInside = function (v) {
        if (this.origin.x > v.x || this.end.x < v.x) {
            return false;
        }

        return !(this.origin.y > v.y || this.end.y < v.y);
    };

    // convert this to a string representation
    this.toString = function () {
        return (this.origin + " - " + this.end);
    };
}


/*
Creates a datastructure containing the meta information of the presentation.
 */
function MetaData(headerNode) {
    "use strict";
    var dataset, index, node, nodeList;

    if (headerNode !== undefined) {
        nodeList = headerNode.getElementsByTagName("div");
        for (index = 0; index < nodeList.length; index++) {
            node = nodeList[index];
            dataset = node.dataset;
            if (dataset !== undefined) {
                switch (dataset.type) {
                    case "authors":
                        this.authors = node.innerHTML;
                        break;

                    case "date":
                        this.date = node.innerHTML;
                        break;

                    case "language":
                        this.language = node.innerHTML;
                        break;

                    case "subtitle":
                        this.subtitle = node.innerHTML;
                        break;

                    case "title":
                        this.title = node.innerHTML;
                        break;	

                    case "titleOnSlides":
                        this.titleOnSlides = node.innerHTML;
                        break;
                }
            }
        }

        if (this.titleOnSlides === undefined) {
            this.titleOnSlides = this.title;
        }

        this.toString = function() {
            var str;

            str = "authors: " + this.authors + "\n";
            str = str + "date: " + this.date + "\n";
            str = str + "language: " + this.language + "\n";
            str = str + "subtitle: " + this.subtitle + "\n";
            str = str + "title: " + this.title + "\n";
            str = str + "titleOnSlides: " + this.titleOnSlides + "\n";

            return str;
        };		
    }
}


/*
Creates a datastructure that encapsulated a single slide. In stores references
to the DOM nodes to e.g. easily handle display issues, cf. hide(), show()
or resize().
 */
function Slide(sectionNode) {
    "use strict";
    var attributes, index, index2, childNode, nodes;

    if (sectionNode !== undefined && sectionNode.nodeName === "SECTION") {
        this.section = sectionNode;
        this.parentNode = this.section.parentNode;
        for (index = 0; index < this.parentNode.childNodes.length; index++) {
            childNode = this.parentNode.childNodes.item(index);		
            if (childNode.nodeType === 1) {
                switch (childNode.nodeName) {
                    case "HEADER":				
                        this.header = childNode;
                        break;

                    case "FOOTER":
                        this.footer = childNode;
                        break;
                }
            }
        }

        // find slide number node if available
        nodes = this.header.getElementsByTagName("div");
        for (index = 0; index < nodes.length; index++) {
            childNode = nodes[index];
            attributes = childNode.attributes;			
            for (index2 = 0; index2 < attributes.length; index2++) {
                if (attributes[index2].nodeName === "class" && attributes[index2].value === "slide-number") {
                    this.slideNumber = childNode;
                }
            }
        }

        // find comments
        this.comments = "";
        for (index = 0; index < this.section.childNodes.length; index++) {
            var currNode = this.section.childNodes[index];
            if (currNode.nodeName === "#comment" || currNode.nodeType === 8) {
                this.comments += currNode.nodeValue;
            }
        }

        this.style = this.parentNode.style;
        this.size = new Vector(this.parentNode.offsetWidth, this.parentNode.offsetHeight);
    }

    this.hide = function() {
        this.parentNode.style.visibility = "hidden";
        this.header.style.visibility = "hidden";
        this.section.style.display = "none";
        this.footer.style.visibility = "hidden";
    };

    this.resize = function(top, left, width, height) {
        var style;

        if (this.parentNode !== undefined) {
            style = this.parentNode.style;
            style.top = top + "%";
            style.left = left + "%";
            style.width = width + "%";
            style.height = height + "%";
        }

        this.size = new Vector(this.parentNode.offsetWidth, this.parentNode.offsetHeight);
    };

    this.setOnMouseMove = function(func_ptr) {
        this.footer.onmousemove = func_ptr;
        this.header.onmousemove = func_ptr;
        this.section.onmousemove = func_ptr;
    };

    this.show = function() {
        this.parentNode.style.visibility = "visible";
        this.header.style.visibility = "visible";
        this.section.style.display = "table";
        this.footer.style.visibility = "visible";
    };
}


function Timer(time) {
    "use strict";

    this.running = false;
    this.isCountDownTimer = false;
    this.timerValue = 0;
    if (time !== undefined && time !== null) {
        this.isCountDownTimer = true;
        this.timerValue = time;
    }
    this.initialTimerValue = this.timerValue; 

    this.getCurrentTime = function() {
        var delta;

        if (this.running === false) {
            return this.timerValue;
        } else {
            delta = new Date().getTime() - this.timerStartValue;
            if (this.isCountDownTimer) {
                return this.timerValue - delta;
            } else {
                return this.timerValue + delta;
            }
        }
    }; 

    this.isRunning = function() {
        return this.running;
    };

    this.reset = function() {
        this.stop();
        this.timerValue = this.initialTimerValue;
        this.start();
    }

    this.start = function() {
        if (this.running === false) {
            this.timerStartValue = new Date().getTime();
            this.running = true;
        }
    };

    this.stop = function() {
        var delta;

        if (this.running === true) {
            this.running = false;
            delta = new Date().getTime() - this.timerStartValue;

            if (this.isCountDownTimer === false) {
                this.timerValue += delta;
            } else {
                this.timerValue -= delta;
                if (this.timerValue < 0) {
                    this.timerValue = 0;
                }
            }
        }
    }

    this.toString = function() {
        var hours, minutes, reminder, seconds;

        reminder = this.getCurrentTime();
        if (reminder % 1000 !== 0) {
            if (this.isCountDownTimer === true) {
                reminder += 1000;
            }
            reminder -= (reminder % 1000);
        }
        reminder = reminder / 1000;
        seconds = reminder % 60; 
        reminder = (reminder - seconds) / 60;
        minutes = reminder % 60;
        reminder = (reminder - minutes) / 60;
        hours = reminder;

        return ((hours < 10) ? "0" : "") + hours + ":" + ((minutes < 10) ? "0" : "") + minutes + ":" + ((seconds < 10) ? "0" : "") + seconds;
    }
}
