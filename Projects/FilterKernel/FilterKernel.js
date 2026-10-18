var KernelDisplay;
var img;

var KernelSize=3;
// var edgeAggression=0;
var sigma=1
var factor=3;

var blur=false;
var edge=false;
var sharp=false;
function addKnobs(parent){

    const KernelSizeDiv = document.createElement("div");
    const popLabel = document.createElement("label");
    popLabel.for="KernelSizeInput"
    popLabel.innerHTML="Kernel Size"
    KernelSizeDiv.appendChild(popLabel);

    const KernelSizeInput = document.createElement("input");
    KernelSizeInput.style.width="100%"
    KernelSizeInput.id="KernelSizeInput"
    KernelSizeInput.type="number"
    KernelSizeInput.value=KernelSize
    KernelSizeDiv.appendChild(KernelSizeInput);
    parent.appendChild(KernelSizeDiv);
    
    KernelSizeInput.addEventListener(
        'change',
        function(e) { KernelSize=e.target.value }
    )

    //-----------
    const restartDiv = document.createElement("div");
    const restartLabel = document.createElement("label");
    restartLabel.for="restartInput"
    restartLabel.style.display="block"
    restartLabel.innerHTML="Apply Filter"
    restartDiv.appendChild(restartLabel);

    const restartInput = document.createElement("button");
    restartInput.style.width="30%"
    restartInput.textContent="\u00A0";
    restartInput.style.marginLeft="35%"
    restartDiv.appendChild(restartInput);
    parent.appendChild(restartDiv);

    restartInput.addEventListener(
        'click',
        function(e) { ApplyFilter(); }
    )


    //----------
    const EdgeAggroDiv = document.createElement("div");
    const EdgeAggroLabel = document.createElement("label");
    EdgeAggroLabel.for="KernelSizeInput"
    EdgeAggroLabel.innerHTML="Edge Factor"
    EdgeAggroDiv.appendChild(EdgeAggroLabel);

    const EdgeAggroInput = document.createElement("input");
    EdgeAggroInput.style.width="100%"
    EdgeAggroInput.id="EdgeAggroInput"
    EdgeAggroInput.type="number"
    EdgeAggroInput.value=factor
    EdgeAggroDiv.appendChild(EdgeAggroInput);
    parent.appendChild(EdgeAggroDiv);
    
    EdgeAggroInput.addEventListener(
        'change',
        function(e) { factor=e.target.value }
    )

    //-----------------------
    const sigmaDiv = document.createElement("div");
    const sigmaLabel = document.createElement("label");
    sigmaLabel.for="KernelSizeInput"
    sigmaLabel.innerHTML="Blur Sigma"
    sigmaDiv.appendChild(sigmaLabel);

    const sigmaInput = document.createElement("input");
    sigmaInput.style.width="100%"
    sigmaInput.id="sigmaInput"
    sigmaInput.type="number"
    sigmaInput.value=sigma
    sigmaDiv.appendChild(sigmaInput);
    parent.appendChild(sigmaDiv);
    
    sigmaInput.addEventListener(
        'change',
        function(e) { sigma=e.target.value }
    )
    //-----------
    var blurInput;
    var edgeInput;
    var sharpInput;
    //-----------
    const BlurDiv = document.createElement("div");
    const blurLabel = document.createElement("label");
    blurLabel.for="blurInput"
    blurLabel.innerHTML="Blur Image"
    BlurDiv.appendChild(blurLabel);

    blurInput = document.createElement("input");
    blurInput.style.width="100%"
    blurInput.id="blurInput"
    blurInput.type="checkbox"
    blurInput.checked=blur
    BlurDiv.appendChild(blurInput);
    parent.appendChild(BlurDiv);

    blurInput.addEventListener(
        'change',
        function(e) { 
            blur=e.target.checked

            edge=false;
            edgeInput.checked=false;

            sharp=false;
            sharpInput.checked=false;
        }
    )

    //------------------
    const EdgeDiv = document.createElement("div");
    const edgeLabel = document.createElement("label");
    edgeLabel.for="edgeInput"
    edgeLabel.innerHTML="Edge Detection"
    EdgeDiv.appendChild(edgeLabel);

    edgeInput = document.createElement("input");
    edgeInput.style.width="100%"
    edgeInput.id="edgeInput"
    edgeInput.type="checkbox"
    edgeInput.checked=edge
    EdgeDiv.appendChild(edgeInput);
    parent.appendChild(EdgeDiv);

    edgeInput.addEventListener(
        'change',
        function(e) { 
            edge=e.target.checked;
            
            blur=false
            blurInput.checked=false;
            
            sharp=false;
            sharpInput.checked=false;
        }
    )

    //
    const sharpDiv = document.createElement("div");
    const sharpLabel = document.createElement("label");
    sharpLabel.for="sharpInput"
    sharpLabel.innerHTML="Sharpen"
    sharpDiv.appendChild(sharpLabel);

    sharpInput = document.createElement("input");
    sharpInput.style.width="100%"
    sharpInput.id="sharpInput"
    sharpInput.type="checkbox"
    sharpInput.checked=sharp
    sharpDiv.appendChild(sharpInput);
    parent.appendChild(sharpDiv);

    sharpInput.addEventListener(
        'change',
        function(e) { 
            sharp=e.target.checked;
            
            blur=false
            blurInput.checked=false;

            edge=false
            edgeInput.checked=false;
            
        }
    )
}

export function TriggerFilterKernel(){
    const parent=document.getElementById("ProjectHere");

    const titlediv = document.createElement("div");
    titlediv.style.fontSize="max(3vw,3vh)"
    const title="Filters: Kernel"
    const titlenode=document.createTextNode(title);
    titlediv.appendChild(titlenode);

    const txtdiv = document.createElement("div");
    txtdiv.style.fontSize="max(1.5vw,1.5vh)"
    const txt=`Three options are implemented, edge detection, blur and sharpness. \n
    Each uses a kernel to evaluate each pixel relative to those around it. 
    Sharpness measures the difference between the blurred and the original value to add that difference to the original.
    Edge detection essentially distills that difference ie, original - blur`
    const txtnode=document.createTextNode(txt);
    txtdiv.appendChild(txtnode);
    
    const Introductionparent = document.createElement("div");
    IntroductionparentStyle(Introductionparent);    
    Introductionparent.appendChild(titlediv);
    Introductionparent.appendChild(txtdiv);

    parent.appendChild(Introductionparent);


    KernelDisplay=document.createElement("canvas");
    KernelDisplayStyle(KernelDisplay);
    parent.appendChild(KernelDisplay);


    const knobsparent=document.createElement("div");
    knobsparentStyle(knobsparent);
    parent.appendChild(knobsparent);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';              // the picker only offers images
    input.style.width="calc(100% - 16px)";
    input.style.marginLeft="8px";
    input.style.marginRight="8px";
    knobsparent.appendChild(input);

    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        img = new Image();
        img.onload = () => {
            drawFitted(img);
            URL.revokeObjectURL(url);
        };
        img.src = url;
    });
    
    const Knobs=document.createElement("div");
    Knobs.style.width="100%";
    Knobs.style.display="grid";
    Knobs.style.gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 150px), 250px))";
    Knobs.style.gap="8px";
    Knobs.style.marginBottom="8px";
    Knobs.style.justifyContent="center";
    knobsparent.appendChild(Knobs)
    
    addKnobs(Knobs);
}

function IntroductionparentStyle(div){
    div.style.width  ="100%"
    div.style.display  ="grid"
    div.style.gridTemplateRows  ="auto auto"
    div.style.marginBottom  ="1vw"
}

function KernelDisplayStyle(div){
    div.style.width="100%";
    div.style.minHeight="1vw"
    div.style.marginBottom  ="1vw"
    div.style.border="rgb(136, 184, 218) solid 3px"
}

function knobsparentStyle(div){
    div.style.width="100%";
    // div.style.aspectRatio="3/1";
    div.style.border="rgb(136, 184, 218) solid 3px"
    div.style.marginBottom  ="1vw"
    div.style.display="flex";
    div.style.flexDirection="column";
}

function drawFitted(img){
    KernelDisplay.width  = img.naturalWidth;      // drawing size = the image's real pixels
    KernelDisplay.height = img.naturalHeight;
    const ctx = KernelDisplay.getContext('2d');
    ctx.willReadFrequently=true
    ctx.drawImage(img, 0, 0);
}

//-----------------------------

function ApplyFilter(){
    drawFitted(img); //reset it

    if(blur){applyBlurFilter()}

    if(edge){applyEdgeDetection()}

    if(sharp){applySharpenning()}
}

function getGaussian(){
    //return an array that is KernelSize x KernelSize
    //all the weights add up to 1, scaling by distance from the center
    
    const centerX=Math.floor(KernelSize/2)
    const centerY=Math.floor(KernelSize/2)
    
    var kernel=[] //row, column form [[],[],[]...]
    let total = 0;

    for(let y=0;y<KernelSize;y++){
        const row = [];
        
        for(let x=0;x<KernelSize;x++){
            const dx=x - centerX
            const dy=y - centerY

            const weight = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
            row.push(weight);
            total += weight;
        } 
        kernel.push(row);
    }

    //normalise the weights now
    for (let y = 0; y < KernelSize; y++) {
        for (let x = 0; x < KernelSize; x++) {
            kernel[y][x] /= total;
    }   }

    return kernel
}

//apply a guassian blur (strong closer to center, weaker out)
function applyBlurFilter(){
    //KernelDisplay is the canvas
    const ctx = KernelDisplay.getContext('2d');
    ctx.willReadFrequently= true
    const src = ctx.getImageData(0, 0, KernelDisplay.width, KernelDisplay.height);
    //dont want to modify original until its all over
    const out = ctx.createImageData(KernelDisplay.width, KernelDisplay.height);

    const weights=getGaussian()
    
    const centerX=Math.floor(KernelSize/2)
    const centerY=Math.floor(KernelSize/2)

    for (let y = 0; y < KernelDisplay.height; y++) {
        for (let x = 0; x < KernelDisplay.width; x++) {
            let r = 0, g = 0, b = 0;

            //we perform gaussian blur on the (x,y) pixel
            for (let ky = 0; ky < weights.length; ky++){
                // which image row this kernel row lands on, clamped at the edges
                const imgRow = Math.min(
                    KernelDisplay.height - 1, 
                    Math.max(0, y + ky - centerY)
                );

                for (let kx = 0; kx < weights[ky].length; kx++){
                    const imgCol = Math.min(
                        KernelDisplay.width - 1, 
                        Math.max(0, x + kx - centerX)
                    );
                    const weight = weights[ky][kx];

                    const i = (imgRow * KernelDisplay.width + imgCol) * 4;   // 4 numbers per pixel: r, g, b, alpha
                    r += src.data[i]     * weight;
                    g += src.data[i + 1] * weight;
                    b += src.data[i + 2] * weight;
                }
            }

            const o = (y * KernelDisplay.width + x) * 4;//since rgba
            out.data[o]     = r;
            out.data[o + 1] = g;
            out.data[o + 2] = b;
            out.data[o + 3] = src.data[o + 3];     // keep the original alpha
    }   }
    ctx.putImageData(out, 0, 0);
}

function applySharpenning(){
    //KernelDisplay is the canvas
    const ctx = KernelDisplay.getContext('2d',{ willReadFrequently: true });

    const src = ctx.getImageData(0, 0, KernelDisplay.width, KernelDisplay.height);
    //dont want to modify original until its all over
    const out = ctx.createImageData(KernelDisplay.width, KernelDisplay.height);

    const weights=getGaussian()
    
    const centerX=Math.floor(KernelSize/2)
    const centerY=Math.floor(KernelSize/2)

    for (let y = 0; y < KernelDisplay.height; y++) {
        for (let x = 0; x < KernelDisplay.width; x++) {
            let r = 0, g = 0, b = 0;

            //we perform gaussian blur on the (x,y) pixel
            for (let ky = 0; ky < weights.length; ky++){
                // which image row this kernel row lands on, clamped at the edges
                const imgRow = Math.min(
                    KernelDisplay.height - 1, 
                    Math.max(0, y + ky - centerY)
                );

                for (let kx = 0; kx < weights[ky].length; kx++){
                    const imgCol = Math.min(
                        KernelDisplay.width - 1, 
                        Math.max(0, x + kx - centerX)
                    );
                    const weight = weights[ky][kx];

                    const i = (imgRow * KernelDisplay.width + imgCol) * 4;   // 4 numbers per pixel: r, g, b, alpha
                    r += src.data[i]     * weight;
                    g += src.data[i + 1] * weight;
                    b += src.data[i + 2] * weight;
                }
            }

            const o = (y * KernelDisplay.width + x) * 4;//since rgba
            //rgb is the blurred values so apply the sharpness formula
            // sharpened = original + amount * (original - blurred)

            out.data[o]     = src.data[o] +factor*( src.data[o] - r)//r;
            out.data[o + 1] = src.data[o+1] +factor*( src.data[o+1] - g)//g;
            out.data[o + 2] = src.data[o+2] +factor*( src.data[o+2] - b)//b;
            out.data[o + 3] = src.data[o + 3];     // keep the original alpha
    }   }
    ctx.putImageData(out, 0, 0);
}

function applyEdgeDetection(){
    //KernelDisplay is the canvas
    const ctx = KernelDisplay.getContext('2d',{ willReadFrequently: true });

    const src = ctx.getImageData(0, 0, KernelDisplay.width, KernelDisplay.height);
    //dont want to modify original until its all over
    const out = ctx.createImageData(KernelDisplay.width, KernelDisplay.height);

    const weights=getGaussian()
    
    const centerX=Math.floor(KernelSize/2)
    const centerY=Math.floor(KernelSize/2)

    for (let y = 0; y < KernelDisplay.height; y++) {
        for (let x = 0; x < KernelDisplay.width; x++) {
            let r = 0, g = 0, b = 0;

            //we perform gaussian blur on the (x,y) pixel
            for (let ky = 0; ky < weights.length; ky++){
                // which image row this kernel row lands on, clamped at the edges
                const imgRow = Math.min(
                    KernelDisplay.height - 1, 
                    Math.max(0, y + ky - centerY)
                );

                for (let kx = 0; kx < weights[ky].length; kx++){
                    const imgCol = Math.min(
                        KernelDisplay.width - 1, 
                        Math.max(0, x + kx - centerX)
                    );
                    const weight = weights[ky][kx];

                    const i = (imgRow * KernelDisplay.width + imgCol) * 4;   // 4 numbers per pixel: r, g, b, alpha
                    r += src.data[i]     * weight;
                    g += src.data[i + 1] * weight;
                    b += src.data[i + 2] * weight;
                }
            }

            const o = (y * KernelDisplay.width + x) * 4;//since rgba
            //rgb is the blurred values so apply the sharpness formula
            // sharpened = original + amount * (original - blurred)

            out.data[o]     = src.data[o] - r//r;
            out.data[o + 1] = src.data[o+1] - g//g;
            out.data[o + 2] = src.data[o+2] - b//b;
            out.data[o + 3] = src.data[o + 3];     // keep the original alpha
    }   }
    ctx.putImageData(out, 0, 0);
}