/*
Adds a new tag (with given class attribute and content) to a node
 */
function addTag(parentNode, tagName, className, content) {
    "use strict";
    var newNode;

    if (content === undefined) {
        content = "";
    }
    
    newNode = document.createElement(tagName);
    parentNode.appendChild(newNode);
    
    if (className !== null) {
        newNode.setAttribute("class", className);		
    }
    
    newNode.innerHTML = content;
    return newNode;
}


/*
Builds the actual presentation by manipulating the DOM tree. Especially meta
data (or to be precise the header and footer) for each slide are added.
 */
function generatePresentation() {
    "use strict";
    var body, index, metaData, sections;
    
    // load meta data and js configuration from corresponding <header> tags
    metaData = new MetaData(document.getElementById("meta-data"));
    loadJSConfiguration();    
    
    // set body's data-language for automated background choice
    body = document.getElementsByTagName("body")[0];
    body.setAttribute("data-language", (metaData.language || "en"));	
    
    // generate slides
    sections = document.getElementsByTagName("section");
    for (index = 0; index < sections.length; index++) {
        generateSlide(sections[index], metaData);
    }
    
}


/*
Loads user-defined values for configuration variables (cf. config.js). For each
variable there has to be a <div> tag with attributes data-key and data-value 
nested in a <header> tag with id "js-config".
 */
function loadJSConfiguration() {
    "use strict";
    var config, dataset, index, key, nodeList, value;
    
    config = document.getElementById("js-config");
    if (config === undefined || config === null) {
        return;
    }
    
    nodeList = config.getElementsByTagName("div");
    if (nodeList === undefined || nodeList === null) {
        return;
    }
    
    for (index = 0; index < nodeList.length; index++) {
        dataset = nodeList[index].dataset;
        if (dataset === undefined || dataset === null) {
            continue;
        }
        
        key = dataset.variable;
        value = dataset.value;
        
        if (key === undefined || value === undefined) {
            continue;
        }        
        
        switch (key) {
            case "allowCycling":		
            allowCycling = (value === "true");
            break;

            case "allowMouseInThumbnailView":
            allowMouseInThumbnailView = (value === "true");
            break;
            
            case "allowNavigationByMouse":
            allowNavigationByMouse = (value === "true");
            break;

            case "aspectRatio":
            aspectRatio = value;
            break;

            case "mathjaxPath":
            mathjaxPath = value;

            case "presentationTime":
            presentationTime = parseInt(value) * 60000;
            break;
            
            default:
            break;
        }
    }
}