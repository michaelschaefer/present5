/*
Triggers the source code refactoring, i.e. all content between <pre>...</pre>
is reformated to look like a code listing (including automated line numbering).
 */
function refactorSourcecode() {
    "use strict";
    var index, pre;
    
    // reformat all <pre> tags
    pre = document.getElementsByTagName("pre");	
    for (index = 0; index < pre.length; index++) {
        pre[index].innerHTML = formatCode(pre[index].innerHTML);		
    }
}


/*
Does the actual code reformatting and adds line numbers. The prefix corresponds
to the indention of the first code line and is stripped from each line to make
the listing appear aligned left.
 */
function formatCode(code) {
    "use strict";
    var currentLine, index, lines, lineNumber, nTotalDigits, prefix, str;
    
    code = replaceCharacters(code);
    code = trimEnd(code);
    lines = code.split("\n");	
    nTotalDigits = lines.length.toString.length;
    prefix = getPrefix(lines[0]);
    str = "";
    
    for (index = 0; index < lines.length; index++) {
        lineNumber = (index + 1).toString();
        while (lineNumber.length < nTotalDigits) {
            lineNumber = " " + lineNumber;
        }
        
        currentLine = removePrefix(lines[index], prefix);
        currentLine = replaceTabs(currentLine, sourcecode_tabReplacement);
        str = str + lineNumber + sourcecode_spacer + currentLine + "\n";
    }
    
    return str;
}


/*
Calculate a line's prefix, i.e. the substring from the beginning up to the
first character that is not " " or \t.
 */
function getPrefix(str) {
    "use strict";
    var currentChar, index;
    
    index = 0;
    currentChar = str.charAt(index);
    while (currentChar === "\t" || currentChar === " ") {
        index++;
        currentChar = str.charAt(index);
        
        if (currentChar === str.length) {
            return "";
        }
    }
    
    return str.substr(0, index);
}


/*
Remove a given prefix from a string. If the given string does not start with
the prefix, the string is returned unchanged.
 */
function removePrefix(str, prefix) {
    "use strict";
    
    if (str.indexOf(prefix) !== -1) {
        return str.substr(prefix.length);
    }
    
    return str;
}


/*
Replace the critial character <,>," with their HTML representations.
 */
function replaceCharacters(str) {
    "use strict";
    
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/"/g, "&quot;");
    
    return str;
}


/*
Replace tabs with a specified string (e.g. some spaces).
 */
function replaceTabs(str, repl) {
    "use strict";
    
    if (repl === undefined) {
        return str;
    }
    
    return str.replace(/\t/g, repl);
}


/*
Remove newlines and tabs from the end of a string.
 */
function trimEnd(str) {
    "use strict";
    var lastChar;
    
    lastChar = str.charAt(str.length - 1);
    while(lastChar === "\t" || lastChar === "\n") {
        str = str.substr(0, str.length - 1);
        lastChar = str.charAt(str.length - 1);
    }
    
    return str;
}