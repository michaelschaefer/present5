/*
Does the refactoring of one slide. In his own source code, the user provides 
only the content of a slide in a <section> tag. This one becomes nested in an 
<article> tag; furthermore, <header> and <footer> tags containing meta 
information (cf. MetaData in datastructures.js) are added.
*/
function generateSlide(sectionNode, metaData) {
	"use strict";
	var article, footer, header, headlineNode, parent, section, type;

	// get type of slide
	type = (sectionNode.getAttribute("class")) || "no-subject";	


	article = document.createElement("article");
	header = document.createElement("header");
	footer = document.createElement("footer");
	section = sectionNode;

	parent = sectionNode.parentNode;
	parent.replaceChild(article, sectionNode);
	article.appendChild(header);
	article.appendChild(section);
	article.appendChild(footer);

	article.setAttribute("class", type);	
	sectionNode.removeAttribute("class");	

	switch (type) {
		case "title":
		// header contains title and subtitle box
		addTag(header, "h1", null, metaData.title);
		if (metaData.subtitle !== undefined) {
			addTag(header, "h2", null, metaData.subtitle);
		}

		// section contains authors			
		var divNode = addTag(section, "div", "tableRow");		
		addTag(divNode, "div", "authors", metaData.authors);
		divNode = addTag(section, "div", "tableRow");
		addTag(divNode, "div", "date", metaData.date);		
		break;

		case "subject":
		headlineNode = sectionNode.getElementsByTagName("h1")[0];
		header.appendChild(sectionNode.removeChild(headlineNode));
		//addTag(footer, "div", "slide-number", "");
		break;

		case "no-subject":		
		//addTag(footer, "div", "slide-number", "");
		break;
	}
	
}