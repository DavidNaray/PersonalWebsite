var txtInput;
var txtoutput;

var token=false;
var stopw=false;
// var lemme=false;
var nhand=false;
var mstrip=false;
var place=false;
var aicomp=false;

const STOPWORDS = new Set([
    "i","me","myself","we","our","ours","ourselves","you",
    "your","yours","yourself","yourselves","he","him","his",
    "himself","she","her","hers","herself","it","its","itself",
    "they","them","their","theirs","themselves","what","which",
    "who","whom","this","that","these","those","am","is","are",
    "was","were","be","been","being","have","has","had","having",
    "do","does","doing","a","an","the","and","but","if","or","because",
    "as","until","while","of","at","by","for","with","about","against",
    "between","into","through","during","before","after","above","below",
    "to","from","up","down","in","out","on","off","over","under",
    "again","further","then","once","here","there","when","where",
    "why","how","all","any","both","each","few","more","most","other",
    "some","such","no","nor","not","only","own","same","so","than","too",
    "very","s","t","can","will","just","don","should","now"
]);


function addKnobs(parent){
    var stopwInput;
    var tokenInput;
    // var lemmeInput;
    var nhandInput;
    var MarkupsInput;
    var replaceInput;
    var aicompInput;

    function changeup(target,val){
        token=false;
        stopw=false;
        // lemme=false;
        nhand=false;
        mstrip=false;
        place=false;
        aicomp=false;

        tokenInput.checked=false;
        // lemmeInput.checked=false;
        stopwInput.checked=false;
        nhandInput.checked=false;
        MarkupsInput.checked=false;
        replaceInput.checked=false;
        aicompInput.checked=false;

        switch(target){
            case "token":
                tokenInput.checked=val;
                token=val;
                break;
            case "stopw":
                stopwInput.checked=val;
                stopw=val;
                break;
            // case "lemme":
            //     lemmeInput.checked=val;
            //     lemme=val;
            //     break;
            case "nhand":
                nhandInput.checked=val;
                nhand=val;
                break;
            case "markups":
                MarkupsInput.checked=val;
                mstrip=val;
                break;
            case "replace":
                replaceInput.checked=val;
                place=val;
                break;
            case "aicomp":
                aicompInput.checked=val;
                aicomp=val;
                break;
            default:
                break;
        }
    }

    //------------------
    //token
    const tokendiv = document.createElement("div");
    const tokenLabel = document.createElement("label");
    tokenLabel.for="tokenInput"
    tokenLabel.innerHTML="Tokenise"
    tokendiv.appendChild(tokenLabel);

    tokenInput = document.createElement("input");
    tokenInput.style.width="100%"
    tokenInput.id="tokenInput"
    tokenInput.type="checkbox"
    tokenInput.checked=token
    tokendiv.appendChild(tokenInput);
    parent.appendChild(tokendiv);

    tokenInput.addEventListener(
        'change',
        function(e) { 
            changeup("token",e.target.checked );
            Apply();
        }
    )

    //-----------------------------------------------------------------
    //stopwords
    const stopwdiv = document.createElement("div");
    const stopwLabel = document.createElement("label");
    stopwLabel.for="stopwInput"
    stopwLabel.innerHTML="Remove StopWords"
    stopwdiv.appendChild(stopwLabel);

    stopwInput = document.createElement("input");
    stopwInput.style.width="100%"
    stopwInput.id="stopwInput"
    stopwInput.type="checkbox"
    stopwInput.checked=stopw
    stopwdiv.appendChild(stopwInput);
    parent.appendChild(stopwdiv);

    stopwInput.addEventListener(
        'change',
        function(e) { 
            changeup("stopw",e.target.checked );
            Apply(); 
        }
    )

    //-----------------------------------------------------------------
    //lemmetise
    // const lemmediv = document.createElement("div");
    // const lemmeLabel = document.createElement("label");
    // lemmeLabel.for="lemmeInput"
    // lemmeLabel.innerHTML="Lemmetization"
    // lemmediv.appendChild(lemmeLabel);

    // lemmeInput = document.createElement("input");
    // lemmeInput.style.width="100%"
    // lemmeInput.id="lemmeInput"
    // lemmeInput.type="checkbox"
    // lemmeInput.checked=lemme
    // lemmediv.appendChild(lemmeInput);
    // parent.appendChild(lemmediv);

    // lemmeInput.addEventListener(
    //     'change',
    //     function(e) { 
    //         changeup("lemme",e.target.checked );
    //         Apply();
    //     }
    // )

    //-----------------------------------------------------------------
    //Number handling
    const nhanddiv = document.createElement("div");
    const nhandLabel = document.createElement("label");
    nhandLabel.for="nhandInput"
    nhandLabel.innerHTML="Number Handling"
    nhanddiv.appendChild(nhandLabel);

    nhandInput = document.createElement("input");
    nhandInput.style.width="100%"
    nhandInput.id="nhandInput"
    nhandInput.type="checkbox"
    nhandInput.checked=nhand
    nhanddiv.appendChild(nhandInput);
    parent.appendChild(nhanddiv);

    nhandInput.addEventListener(
        'change',
        function(e) { 
            changeup("nhand",e.target.checked );
            Apply();
        }
    )

    //-----------------------------------------------------------------
    //Markup stripping
    const Markupsdiv = document.createElement("div");
    const markupsLabel = document.createElement("label");
    markupsLabel.for="MarkupsInput"
    markupsLabel.innerHTML="Markup Stripping"
    Markupsdiv.appendChild(markupsLabel);

    MarkupsInput = document.createElement("input");
    MarkupsInput.style.width="100%"
    MarkupsInput.id="MarkupsInput"
    MarkupsInput.type="checkbox"
    MarkupsInput.checked=nhand
    Markupsdiv.appendChild(MarkupsInput);
    parent.appendChild(Markupsdiv);

    MarkupsInput.addEventListener(
        'change',
        function(e) { 
            changeup("markups",e.target.checked );
            Apply();
        }
    )

    //-----------------------------------------------------------------
    //Placeholders for URLs, emails, @mentions and #hashtags
    const replacediv = document.createElement("div");
    const replaceLabel = document.createElement("label");
    replaceLabel.for="replaceInput"
    replaceLabel.innerHTML= "URL, email, @mentions, #hashtags placeholders"
    replacediv.appendChild(replaceLabel);

    replaceInput = document.createElement("input");
    replaceInput.style.width="100%"
    replaceInput.id="replaceInput"
    replaceInput.type="checkbox"
    replaceInput.checked=nhand
    replacediv.appendChild(replaceInput);
    parent.appendChild(replacediv);

    replaceInput.addEventListener(
        'change',
        function(e) { 
            changeup("replace",e.target.checked );
            Apply();
        }
    )

    //-
    const aicompdiv = document.createElement("div");
    const aiLabel = document.createElement("label");
    aiLabel.for="aicompInput"
    aiLabel.innerHTML="comprehensive Tokenisation (not BPE)"
    aicompdiv.appendChild(aiLabel);

    aicompInput = document.createElement("input");
    aicompInput.style.width="100%"
    aicompInput.id="aicompInput"
    aicompInput.type="checkbox"
    aicompInput.checked=aicomp
    aicompdiv.appendChild(aicompInput);
    parent.appendChild(aicompdiv);

    aicompInput.addEventListener(
        'change',
        function(e) { 
            changeup("aicomp",e.target.checked );
            Apply();
        }
    )


    //Unicode normalisation and accent stripping
    //Whitespace normalisation
    //Emoji
    //Contraction expansion
    //Spelling correction
}

export function TriggertxtPrcss(){
    const parent=document.getElementById("ProjectHere");

    const titlediv = document.createElement("div");
    titlediv.style.fontSize="max(3vw,3vh)"
    const title="Text Processing: Techniques"
    const titlenode=document.createTextNode(title);
    titlediv.appendChild(titlenode);

    const txtdiv = document.createElement("div");
    txtdiv.style.fontSize="max(1.5vw,1.5vh)"
    const txt=`Different Processing methods are put on display here:`
    const txtnode=document.createTextNode(txt);
    txtdiv.appendChild(txtnode);
    
    const Introductionparent = document.createElement("div");
    IntroductionparentStyle(Introductionparent);    
    Introductionparent.appendChild(titlediv);
    Introductionparent.appendChild(txtdiv);

    parent.appendChild(Introductionparent);

    const inLabel = document.createElement("div");
    inLabel.style.fontSize="max(2vw,2vh)"
    inLabel.innerHTML="Input"
    inLabel.style.display="block"
    parent.appendChild(inLabel);

    txtInput=document.createElement("textarea");
    txtInputDisplayStyle(txtInput);
    parent.appendChild(txtInput);


    const outLabel = document.createElement("div");
    outLabel.style.fontSize="max(2vw,2vh)"
    outLabel.innerHTML="Output"
    outLabel.style.display="block"
    parent.appendChild(outLabel);

    txtoutput=document.createElement("textarea");
    txtInputDisplayStyle(txtoutput);
    txtoutput.readOnly=true
    parent.appendChild(txtoutput);


    const knobsparent=document.createElement("div");
    knobsparentStyle(knobsparent);
    parent.appendChild(knobsparent);
    
    const Knobs=document.createElement("div");
    Knobs.style.width="100%";
    Knobs.style.display="grid";
    Knobs.style.gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 150px), 250px))";
    Knobs.style.gap="8px";
    Knobs.style.marginBottom="8px";
    Knobs.style.justifyContent="center";
    knobsparent.appendChild(Knobs)


    addKnobs(Knobs)
}

function IntroductionparentStyle(div){
    div.style.width  ="100%"
    div.style.display  ="grid"
    div.style.gridTemplateRows  ="auto auto"
    div.style.marginBottom  ="1vw"
}

function txtInputDisplayStyle(div){
    div.style.width="100%";
    div.style.aspectRatio="4/1";
    div.style.marginBottom  ="1vw"
    div.style.border="rgb(136, 184, 218) solid 3px"
    div.style.boxSizing = "border-box";   
    
    div.style.boxSizing = "border-box";
    div.style.resize = "none";        // optional: stops the drag handle
    div.style.overflowY = "auto";
    div.style.overflowWrap = "break-word";
    div.style.textAlign = "left";
}

function knobsparentStyle(div){
    div.style.width="100%";
    // div.style.aspectRatio="3/1";
    div.style.border="rgb(136, 184, 218) solid 3px"
    div.style.marginBottom  ="1vw"
    div.style.display="flex";
    div.style.flexDirection="column";
}

//----------------------------------------------------------
//update output textarea
function updateOutput(arr){
    txtoutput.value=arr.join(" "); 
}

function Apply(){
    if(token){Tokenise()}

    if(stopw){removeStopWords();}

    if(lemme){}

    if(nhand){NumberHandle("placeholder");}

    if(mstrip){stripMarkup();}

    if(place){placeholders();}

    if(aicomp){AItokeniser()}
}

//----------------------------------------------------------
function Tokenise(keepWhitespace=false){
    // \ is an escape character so you need to do \\p{..} for it to read as \p{..}
    //\p{L} is any language
    //\p{N} is any number or digit
    //\p{L}+ one or more letter
    //* means 0 or more of the previous item ie group appears 0 or more times
    
    //?: creates a group... ['’]\\p{L}+ ... is to say a group of letters or '’
    //its saying this group needs one of ['’] and then any number of letters after to capure say " he's "


    // letters/digits, optionally with an apostrophe inside
    const WORD= "[\\p{L}\\p{N}]+(?:['’]\\p{L}+)*"; 
    // a run of anything that isn't letter, digit or space
    const PUNCTUATION= "[^\\p{L}\\p{N}\\s]+";              
    // a run of spaces, tabs, newlines
    const WHITESPACE = "\\s+";     

    const TOKEN_PATTERN = new RegExp(`${WORD}|${PUNCTUATION}|${WHITESPACE}`, "gu");
    const tokens = txtInput.value.match(TOKEN_PATTERN) || [];


    if(keepWhitespace){
        updateOutput(tokens);
        return tokens;
    }

    //if the whole token is whitespace, remove it
    //^ and $ form a boundary
    //$ is a check to say it must end on something, in this case whitespace
    //^ has two meanings, when not in square brackets it matches position
        //hotdog is false with ^dog since dog isnt at the start, dogwhistle would be true though
        //when in square brackets (a set) it negates the set [^abc] is to say a character not a,b or c
    const WRemoval = new RegExp(`^${WHITESPACE}$`);
    const filtered=tokens.filter(t =>!WRemoval.test(t));//! because detects whitespace

    updateOutput(filtered);
    return filtered;
}

function lemmetization(){
}

function removeStopWords(){
    const tkns=Tokenise();

    const lemmd=tkns.filter(t => {
        const word = t.toLowerCase();//otherwise you need a lot of stopword variations
        return !STOPWORDS.has(word);
    })
    updateOutput(lemmd)
}

function NumberHandle(mode){
    //replace numbers with the <num> tag with exceptions
    // \d+ means digit 1+ times
    // then you got the group so like, the * says you can have multiple of that group
        //mind you each group can have different text
        
    const numberFormat = new RegExp("\\b\\d+(?:[.,]\\d+)*\\b", "g");
    // `\b\d+[?:[.,]\d+]*\b`
    var toReturn=[];
    
    if (mode === "remove"){
        toReturn=txtInput.value.replace(numberFormat, "");
    }

    if (mode === "placeholder"){
        toReturn=txtInput.value.replace(numberFormat, "<NUM>");
    }
    // console.log("hmmm",toReturn)
    updateOutput(toReturn);
    return toReturn;
}

function stripMarkup(){
    // DOMParser builds an inert document
    const doc = new DOMParser().parseFromString(txtInput.value, "text/html");
    doc.querySelectorAll("script, style").forEach(el => el.remove());
    updateOutput([doc.body.textContent]);
    return doc.body.textContent;      // tags gone, entities decoded (&amp; becomes &)
}

function placeholders(txt=null){
    var hmm=false;
    if(txt==null){
        txt=txtInput.value
        hmm=true
    }

    // const urlformat = new RegExp("/!?\[([^\]]*)\]\([^)]*\)", "g");
    const urlformat = new RegExp(
        "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{2,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
        "g"
    );
    
    //[a-zA-Z0-9._%+-]+ for the first part of an email, then mandatory @ followed by letters min 2 long
    const emailformat = new RegExp("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", "g");

    //nothing before the # proceeded by any character 1+
    const hashtagformat=new RegExp("(?<![\\w#])#\\w+", "g");
    
    //nothing before the @ proceeded by any character 1+
    const mentionformat=new RegExp("(?<![\\w@])@\\w+", "g");

    const urlstripped=txt.replace(urlformat,"<url>");
    const emailStripped=urlstripped.replace(emailformat,"<email>");
    const hastagstripped=emailStripped.replace(hashtagformat,"<hashtag>");
    const MentionStripped=hastagstripped.replace(mentionformat,"<mention>");

    if(hmm){updateOutput([MentionStripped]);}
    
    return MentionStripped;
}

function AItokeniser(){
    const htmlStrippedText=stripMarkup();

    //replaces markdown links
    const cleanText = htmlStrippedText.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
    
    const extrastripped=placeholders(cleanText);
    // console.log(cleanText)

    const PLACEHOLDER = "<(?:url|email|hashtag|mention)>";
    const WORD= "[\\p{L}\\p{N}]+(?:['’]\\p{L}+)*"; 
    const PUNCTUATION= "[^\\p{L}\\p{N}\\s]+";              
    const WHITESPACE = "\\s+";     

    const TOKEN_PATTERN = new RegExp(`${PLACEHOLDER}|${WORD}|${PUNCTUATION}|${WHITESPACE}`, "gu");
    const tokens = extrastripped.match(TOKEN_PATTERN) || [];

    const WRemoval = new RegExp(`^${WHITESPACE}$`);
    const filtered = tokens.filter(t => !WRemoval.test(t));

    updateOutput(filtered);
}