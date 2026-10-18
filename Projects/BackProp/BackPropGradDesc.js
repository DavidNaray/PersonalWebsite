var canvas;

var learningRate=0.1;
var simSpeed=3;
var hiddenLayers=1;
var hiddenWidth=8;


var Network=[];//outlines the shape
var weights=[];
var biases= [];

export function TriggerBPGD(){
    const parent=document.getElementById("ProjectHere");

    const titlediv = document.createElement("div");
    titlediv.style.fontSize="max(3vw,3vh)"
    const title="AI: Backpropogation & Gradient Descent"
    const titlenode=document.createTextNode(title);
    titlediv.appendChild(titlenode);

    const txtdiv = document.createElement("div");
    txtdiv.style.fontSize="max(1.5vw,1.5vh)"
    const txt=`Loss is the difference between output and goal. \n
    Backpropogation is the process of calculating the loss change 
    if you were to nudge the weight at a node in the network (a gradient), each node has its own such value. \n
    Gradient Descent is the process of taking the gradients and nudging the weights in the direction that lowers loss.`
    const txtnode=document.createTextNode(txt);
    txtdiv.appendChild(txtnode);
    
    const Introductionparent = document.createElement("div");
    IntroductionparentStyle(Introductionparent);    
    Introductionparent.appendChild(titlediv);
    Introductionparent.appendChild(txtdiv);

    parent.appendChild(Introductionparent);


    canvas=document.createElement("canvas");
    KernelDisplayStyle();
    parent.appendChild(canvas);
    dots();

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
    
    // addKnobs(Knobs);
}

function IntroductionparentStyle(div){
    div.style.width  ="100%"
    div.style.display  ="grid"
    div.style.gridTemplateRows  ="auto auto"
    div.style.marginBottom  ="1vw"
}

function KernelDisplayStyle(){
    canvas.style.width="100%";
    // div.style.height="100%";
    canvas.style.aspectRatio="2/1";
    canvas.style.marginBottom  ="1vw"
    canvas.style.border="rgb(136, 184, 218) solid 3px"
}

function knobsparentStyle(div){
    div.style.width="100%";
    // div.style.aspectRatio="3/1";
    div.style.border="rgb(136, 184, 218) solid 3px"
    div.style.marginBottom  ="1vw"
    div.style.display="flex";
    div.style.flexDirection="column";
}

//-------------------------------

function innitNet(){
    weights=[];
    biases= [];
    //1 input, 1 output and 8 subarrays between that are hiddenWidth length
    Network=[1,...Array(hiddenLayers).fill(hiddenWidth), 1]
    //need biases for each node and the weights of the connections

    for (let l = 1; l < Network.length; l++){
        //how many are coming in from the start
        const inward=Network[l-1];
        const layerWeights = [];
        const layerBiases = [];

        for (let j = 0; j < Network[l]; j++){
            //the number of weights will be inward * Network[l] length
            const neuronWeights = [];
            for (let i = 0; i < inward; i++){
                const randomWeight = Math.random() * 2 - 1;
                neuronWeights.push(randomWeight);
            }
            layerWeights.push(neuronWeights);
            //biases are unknown just set to 0
            layerBiases.push(0);
        }

        weights.push(layerWeights)
        biases.push(layerBiases);
    }
}

function innitZerod(){
    const gW = structuredClone(weights);
    const gB = structuredClone(biases);

    for (let l = 0; l < gW.length; l++){
        for (let j = 0; j < gW[l].length; j++){
            gB[l][j] = 0;
            for (let i = 0; i < gW[l][j].length; i++){
                gW[l][j][i] = 0;
    }   }   }

    return { gW, gB };
}

function dots(){
    const ctx = canvas.getContext('2d');

    const pts = [[0.2,0.5],[0.5,0.2],[0.8,0.6],[0.4,0.8]];
    let dragging = -1; //-1 for no points interacted with
    let started = false;

    function fit(){
        if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return;

        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        draw();

        if (!started){ 
            innitNet();
            started = true; 
            loop(); 
        }
    }

    function Tick(){
        //so each point gets its own desired differences, add them up into Tgw, Tgb
        const { gW: TgW, gB: TgB } = innitZerod();

        pts.forEach(p => {
            const inputX=p[0]
            const expectedY=p[1]

            const NetworkOutput=NetworkOuputs(inputX);
            
            const { gW, gB } =BackProp(NetworkOutput,expectedY)

            //add gradients to the total discontent
            for (let l = 0; l < weights.length; l++){//go through layers
                for (let j = 0; j < weights[l].length; j++){//go through neurons in layer
                    TgB[l][j] += gB[l][j];
                    for (let i = 0; i < weights[l][j].length; i++){//connections to neuron in layer
                        TgW[l][j][i] += gW[l][j][i];
                    }
                }
            }
        });

        GradientDescent(TgW,TgB,pts.length);
    }

    function draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        for (let px = 0; px <= canvas.width; px += 2){
            const x = px / canvas.width;                        // pixel -> 0..1 fraction
            const out = NetworkOuputs(x);
            const y = out[out.length - 1][0];                   // last layer, its one neuron
            const py = y * canvas.height;                       // fraction -> pixel

            if (px === 0){ctx.moveTo(px, py);}//start on 0
            else{ctx.lineTo(px, py);}//keep drawing the line
        }
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();

        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p[0] * canvas.width, p[1] * canvas.height, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        });
    }

    function loop(){
        for (let k = 0; k < simSpeed; k++){Tick()};
        draw();
        requestAnimationFrame(loop);
    }

    function mouseFrac(e){
        const r = canvas.getBoundingClientRect();
        return [
            (e.clientX - r.left - canvas.clientLeft) / canvas.clientWidth,
            (e.clientY - r.top  - canvas.clientTop)  / canvas.clientHeight
        ];
    }

    canvas.addEventListener('pointerup', () => dragging = -1);
    canvas.addEventListener('pointerdown', e => {
        const [mx, my] = mouseFrac(e);
        const pixelGrabradius=16;
        dragging = pts.findIndex(
            p =>Math.hypot(
                (p[0]-mx) * canvas.width, 
                (p[1]-my) * canvas.height) < pixelGrabradius
        );
        if (dragging >= 0) canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', e => {
        if (dragging < 0) return;
        const [mx, my] = mouseFrac(e);
        pts[dragging] = [
            Math.min(
                1, 
                Math.max(0, mx)), 
                Math.min(1, Math.max(0, my)
            )
        ];
        draw();
    });

    new ResizeObserver(fit).observe(canvas);

}

function NetworkOuputs(x){
    //x is 0-1 value ratio of the canvas, -1,1 allows center to be on 0, good for tanh

    const a = [
        [2 * x - 1]// input rescaled from 0..1 to -1..1, so first index is x rescaled
    ];               
    
    for (let l = 0; l < weights.length; l++){//go through each layer
        const layerOutput = [];
        const isOutput = (l === weights.length - 1);
        
        for(let i = 0; i < weights[l].length; i++){//go through each neuron in layer
            let sum=biases[l][i]//sum begins with the bias

            for (let k = 0; k < weights[l][i].length; k++){//each connection to node
                //activation of previous node * connection to current
                sum+=a[l][k] * weights[l][i][k]
            }

            if(isOutput){layerOutput.push(sum)/* final node, final output, no normalise*/}
            else{layerOutput.push(Math.tanh(sum));/*collate the sum for each node*/}
        }
        a.push(layerOutput);

    }
    return a;
}


function BackProp(out,expected){
    const { gW, gB } = innitZerod();//arrays of weights and biases shape, but zerod
    const final=out[out.length -1][0]//0 since 1 output, to get teh number
    const diff=final - expected

    const Loss=diff **2
    var LossSlope=[2*diff];//2* because derivation of diff**2 is 2*diff

    //so each node needs to be assessed from the output, backward
    
    for(let l = weights.length - 1; l >= 0; l--){//each layer
        for (let j = 0; j < weights[l].length; j++){//each node in layers
            
            gB[l][j] = LossSlope[j];                      // bias gradient = the blame itself

            for (let i = 0; i < weights[l][j].length; i++){
                gW[l][j][i] = LossSlope[j] * out[l][i];     // weight gradient = blame x the input it saw
            }
            
            //each node contains the connections to it, so the first layer is purely input hence
            if(l>0){
                //only one output node on this so [j] is just [0] on the first loop
                //each node has its own loss so need to replace LossSlope with a new array of losses
                const backLosses = [];

                //each neuron contributed to the current error, so go through them
                for (let i = 0; i < out[l].length; i++){
                    //the sum is calculating the net change in the output if the neurons output would change
                    //weight * how much i care
                    let sum = 0;
                    for (let j = 0; j < weights[l].length; j++){
                        // each neuron blames the ones that fed it
                        sum += weights[l][j][i] * LossSlope[j];   
                    }
                    const tanhSlope= 1 - (out[l][i] ** 2)
                    backLosses.push(sum * tanhSlope);
                }
                LossSlope = backLosses;
            }
        }

    }

    return {gW, gB}
}

function GradientDescent(gW, gB, count){
    //need to include count since the gw and gb are a total discontent, so /count is average

    for (let l = 0; l < weights.length; l++){
        for (let j = 0; j < weights[l].length; j++){
            biases[l][j] -= learningRate * gB[l][j] / count;
            for (let i = 0; i < weights[l][j].length; i++){
                weights[l][j][i] -= learningRate * gW[l][j][i] / count;   // / count averages over the points
            }
        }
    }
}