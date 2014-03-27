/*
Does the actual conversion, i.e. loops over all LaTeX code blocks and replaces them with the corresponding MathML result.
*/
function convert() {
	"use strict";
	var body, end, i, latex, replacement, sourceString, start;
		
	// prepare html	
	body = originalBody;

	// get all latex parts
	latex = MathJax.Hub.getAllJax();

	// do conversion
	for (i = 0; i < latex.length; i++) {		
		end = 0;
		start = 0;
		replacement = toMathML(latex[i]);

		if (latex[i].root.display === "block") { // i.e. outline formula
			start = body.indexOf("\\[");
			end = body.indexOf("\\]", start);
		} else { // i.e. inline formula
			start = body.indexOf("\\(");
			end = body.indexOf("\\)", start);
		}

		body = body.substring(0, start).concat(replacement.concat(body.substr(end+2)));
	}

	// show converted document in new tab
	saveDocument(originalHead.concat(body));
}


/*
Generates an octet stream with the given HTML code as content and tries to start a download request
*/
function saveDocument(htmlCode) {
	"use strict";
	var bodyTag, content, fileName, tag, uri;

	// prepare data stream
	content = "<!DOCTYPE html>\n<html>\n" + htmlCode + "\n</html>";	
	uri = "data:application/octet-stream," + encodeURIComponent(content);
	
	// generate file name guess
	fileName = window.location.href;
	fileName = fileName.substr(fileName.lastIndexOf("/") + 1) + ".converted";

	// prepare <a> tag to trigger download
	tag = document.createElement("a");	
	tag.download = fileName;
	tag.href = uri;	
	tag.target = "_blank";

	// add, click, remove anchor
	bodyTag = document.getElementsByTagName("body")[0];
	bodyTag.appendChild(tag);
	tag.click();
	bodyTag.removeChild(tag);
}


/*
Uses toMathML() of the given jax object to convert it to MathML. An exception may be thrown in the error case.
*/
function toMathML(jaxObject) {
	"use strict";
	var mmlCode;

	try {
		mmlCode = jaxObject.root.toMathML("");
	} catch (err) {
		if (!err.restart) {
			throw err;
		}
		mmlCode = null;
	}

	return mmlCode;
}


/*
Activates MathJax by adding a new script tag into the presentations head section and calling MathJax' onload() function.
*/
function toggleMathJax(doConvert) {
	"use strict";
	var head, script;

	head = document.getElementsByTagName("head")[0];
	script = document.getElementById("mathjax_converter");
	if (script === null) {
		script = document.createElement("script");
		script.id = "mathjax_converter";
		script.type = "text/javascript";
		script.src = mathjaxPath;		

		if (doConvert === undefined || doConvert === false) {
			script.text = "MathJax.Hub.Startup.onload();";
		} else {
			script.text = "MathJax.Hub.Startup.onload(); MathJax.Hub.Queue(function() { convert(); });";
		}

		head.appendChild(script);    
	} else {
		head.removeChild(script);
		window.location.reload();		
	}
}


function triggerConversion() {
	"use strict";

	if (document.getElementById("mathjax_converter") === null) {
		toggleMathJax(true);
	} else {
		convert();
	}
}
