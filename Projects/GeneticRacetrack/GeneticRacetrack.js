let RoadWidth = 0.05;
let path = [];        // bevelled track, in fractions
let pixelPath=[]      //pixel version of the path
let cars = [];

let canvas;


let population=10;
let mutationrate=0.1;
let mutationAggression=0.1;
var ELITES = 2;//how many of best cars cross over into the next gen
var ALLOW_REVERSE = false;//permit - throttle output or clamp it
let generationCap=200;
var ACCEL = 0.18;           // forward push per tick at full throttle
var DRAG  = 0.025;          // fraction of speed lost per tick
var TURN  = 0.07;           // radians per tick at full steer



//inputs are speed and 5 distance sensors
//outputs are left/right (-1,1) and throttle (-1,1)
var GRIPSPEED = 0.35;      // fraction of top speed needed for full steering
const STALLLIMIT = 400; //how long can a car not make progress before death
let generation=1;
var time=0;
const INPUTS = 6, HIDDEN = 8, OUTPUTS = 2;
const GENOME_SIZE = INPUTS*HIDDEN + HIDDEN + HIDDEN*OUTPUTS + OUTPUTS;   // 74
const RAY_ANGLES = [-0.9, -0.45, 0, 0.45, 0.9];   // radians, relative to the car's heading
let simSpeed = 3;        // sim-speed knob
var timeLimit=3000;

var TOPSPEED = ACCEL / DRAG;

function addKnobs(parent){

    const popDiv = document.createElement("div");
    const popLabel = document.createElement("label");
    popLabel.for="popInput"
    popLabel.innerHTML="Population"
    popDiv.appendChild(popLabel);

    const popInput = document.createElement("input");
    popInput.style.width="100%"
    popInput.id="popInput"
    popInput.type="number"
    popInput.value=population
    popDiv.appendChild(popInput);
    parent.appendChild(popDiv);
    
    popInput.addEventListener(
        'change',
        function(e) { population=e.target.value }
    )

    //Mutation Rate-----------------------------------------------------------
    const mutRDiv = document.createElement("div");
    const mutRLabel = document.createElement("label");
    mutRLabel.for="mutRInput"
    mutRLabel.innerHTML="Mutation Rate"
    mutRDiv.appendChild(mutRLabel);

    const mutRInput = document.createElement("input");
    mutRInput.style.width="100%"
    mutRInput.id="mutRInput"
    mutRInput.type="number"
    mutRInput.value=mutationrate
    mutRDiv.appendChild(mutRInput);
    parent.appendChild(mutRDiv);

    mutRInput.addEventListener(
        'change',
        function(e) { mutationrate=e.target.value }
    )
    //Mutation Scale-----------------------------------------------------------
    const mutDiv = document.createElement("div");
    const mutLabel = document.createElement("label");
    mutLabel.for="mutInput"
    mutLabel.innerHTML="Mutation Scale"
    mutDiv.appendChild(mutLabel);

    const mutInput = document.createElement("input");
    mutInput.style.width="100%"
    mutInput.id="mutInput"
    mutInput.type="number"
    mutInput.value=mutationAggression
    mutDiv.appendChild(mutInput);
    parent.appendChild(mutDiv);

    mutInput.addEventListener(
        'change',
        function(e) { mutationAggression=e.target.value }
    )

    //elites-----------------------------------------------------------
    const elDiv = document.createElement("div");
    const elLabel = document.createElement("label");
    elLabel.for="elInput"
    elLabel.innerHTML="Survivors"
    elDiv.appendChild(elLabel);

    const elInput = document.createElement("input");
    elInput.style.width="100%"
    elInput.id="elInput"
    elInput.type="number"
    elInput.value=ELITES
    elDiv.appendChild(elInput);
    parent.appendChild(elDiv);

    mutInput.addEventListener(
        'change',
        function(e) { ELITES=e.target.value }
    )

    //reversing-----------------------------------------------------------
    const revDiv = document.createElement("div");
    const revLabel = document.createElement("label");
    revLabel.for="revInput"
    revLabel.innerHTML="Allow Reverse"
    revDiv.appendChild(revLabel);

    const revInput = document.createElement("input");
    revInput.style.width="100%"
    revInput.id="revInput"
    revInput.type="checkbox"
    revInput.checked=ALLOW_REVERSE
    revDiv.appendChild(revInput);
    parent.appendChild(revDiv);

    revInput.addEventListener(
        'change',
        function(e) { ALLOW_REVERSE=e.target.checked }
    )

    //gencap-----------------------------------------------------------
    const gencapDiv = document.createElement("div");
    const gencapLabel = document.createElement("label");
    gencapLabel.for="gencapInput"
    gencapLabel.innerHTML="Generation limit"
    gencapDiv.appendChild(gencapLabel);

    const gencapInput = document.createElement("input");
    gencapInput.style.width="100%"
    gencapInput.id="gencapInput"
    gencapInput.type="number"
    gencapInput.value=generationCap
    gencapDiv.appendChild(gencapInput);
    parent.appendChild(gencapDiv);

    gencapInput.addEventListener(
        'change',
        function(e) { generationCap=e.target.value }
    )
    //acceleration-----------------------------------------------------------
    const accelDiv = document.createElement("div");
    const accelLabel = document.createElement("label");
    accelLabel.for="gencapInput"
    accelLabel.innerHTML="Acceleration"
    accelDiv.appendChild(accelLabel);

    const accelInput = document.createElement("input");
    accelInput.style.width="100%"
    accelInput.id="accelInput"
    accelInput.type="number"
    accelInput.value=ACCEL
    accelDiv.appendChild(accelInput);
    parent.appendChild(accelDiv);

    accelInput.addEventListener(
        'change',
        function(e) { ACCEL=e.target.value }
    )

    //DRAG-----------------------------------------------------------
    const DRAGDiv = document.createElement("div");
    const DRAGDivLabel = document.createElement("label");
    DRAGDivLabel.for="DRAGInput"
    DRAGDivLabel.innerHTML="Drag"
    DRAGDiv.appendChild(DRAGDivLabel);

    const DRAGInput = document.createElement("input");
    DRAGInput.style.width="100%"
    DRAGInput.id="DRAGInput"
    DRAGInput.type="number"
    DRAGInput.value=DRAG
    DRAGDiv.appendChild(DRAGInput);
    parent.appendChild(DRAGDiv);

    DRAGInput.addEventListener(
        'change',
        function(e) { DRAG=e.target.value }
    )
    //turn-----------------------------------------------------------
    const turnDiv = document.createElement("div");
    const turnLabel = document.createElement("label");
    turnLabel.for="turnInput"
    turnLabel.innerHTML="Radian turn"
    turnDiv.appendChild(turnLabel);

    const turnInput = document.createElement("input");
    turnInput.style.width="100%"
    turnInput.id="turnInput"
    turnInput.type="number"
    turnInput.value=TURN
    turnDiv.appendChild(turnInput);
    parent.appendChild(turnDiv);

    turnInput.addEventListener(
        'change',
        function(e) { TURN=e.target.value }
    )

    //turn-----------------------------------------------------------
    const restartDiv = document.createElement("div");
    const restartLabel = document.createElement("label");
    restartLabel.for="restartInput"
    restartLabel.style.display="block"
    restartLabel.innerHTML="Restart Simulation"
    restartDiv.appendChild(restartLabel);

    const restartInput = document.createElement("button");
    restartInput.style.width="30%"
    restartInput.textContent="\u00A0";
    restartInput.style.marginLeft="35%"
    restartDiv.appendChild(restartInput);
    parent.appendChild(restartDiv);

    restartInput.addEventListener(
        'click',
        function(e) { simulationSetup(); }
    )
}
var gentxt;
export function TriggerRaceTrack(){
    const parent=document.getElementById("ProjectHere");

    const titlediv = document.createElement("div");
    titlediv.style.fontSize="max(3vw,3vh)"
    const title="Genetic Racecars"
    const titlenode=document.createTextNode(title);
    titlediv.appendChild(titlenode);

    const txtdiv = document.createElement("div");
    txtdiv.style.fontSize="max(1.5vw,1.5vh)"
    const txt=`Alter the shape of the racetrack and watch the cars adapt`
    const txtnode=document.createTextNode(txt);
    txtdiv.appendChild(txtnode);
    
    const Introductionparent = document.createElement("div");
    IntroductionparentStyle(Introductionparent);    
    Introductionparent.appendChild(titlediv);
    Introductionparent.appendChild(txtdiv);

    parent.appendChild(Introductionparent);

    const racetrackparent=document.createElement("canvas");
    racetrackparentStyle(racetrackparent);
    Racetrack(racetrackparent);
    parent.appendChild(racetrackparent);

    const knobsparent=document.createElement("div");
    knobsparentStyle(knobsparent);
    parent.appendChild(knobsparent);

    gentxt=document.createTextNode(`Generation: ${generation}`);
    const genDisplay=document.createElement("div");
    genDisplay.style.width="calc(100% - 16px)";
    genDisplay.style.marginLeft="8px";
    genDisplay.style.marginRight="8px";
    genDisplay.appendChild(gentxt);
    knobsparent.appendChild(genDisplay);

    const Knobs=document.createElement("div");
    // Knobs.style.fontSize="1.5vw"
    Knobs.style.width="100%";
    // Knobs.style.backgroundColor="red";
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

function racetrackparentStyle(div){
    div.style.width="100%";
    // div.style.height="100%";
    div.style.aspectRatio="2/1";
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


function Racetrack(canv){
    const ctx = canv.getContext('2d');
    canvas=canv
    //the drag points
    const pts = [[0.2,0.5],[0.5,0.2],[0.8,0.5],[0.5,0.8]];
    let dragging = -1; //-1 for no points interacted with
    let started = false;

    function fit(){
        if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return;

        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // path = bevelPath(pts, canvas.width, canvas.height);
        
        rebuild();
        if (cars.length === 0){simulationSetup();}
        else{respawn();}//restart the generation
        draw();

        if (!started){ 
            started = true; 
            loop(); 
        }
    }

    function drawCar(car){
        const len = canvas.width * 0.02;        // size as a fraction of canvas width
        ctx.save();
        ctx.globalAlpha = car.alive ? 1 : 0.25; // crashed cars fade out
        ctx.translate(car.x, car.y);            // origin moves to the car
        ctx.rotate(car.angle);                  // "right" is now the car's heading
        ctx.beginPath();
        ctx.moveTo(len, 0);                     // nose
        ctx.lineTo(-len * 0.7, -len * 0.5);     // rear left
        ctx.lineTo(-len * 0.7,  len * 0.5);     // rear right
        ctx.closePath();
        ctx.fillStyle = `hsl(${car.colour}, 85%, 50%)`;
        ctx.fill();
        ctx.restore();                          // undo translate and rotate
    }

    function rebuild(){
        path = bevelPath(pts, canvas.width, canvas.height);
        buildMask();
    }

    function draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        
        // drawDebugLines(path,ctx);

        

        MakeTrack(path,ctx,RoadWidth);        
        drawStartLine(path,ctx,RoadWidth);
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p[0] * canvas.width, p[1] * canvas.height, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        });
        
        cars.forEach(drawCar);

    }

    function loop(){
        for (let k = 0; k < simSpeed; k++){simulationTick()};
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
        rebuild();
        respawn();
        draw();
    });

    new ResizeObserver(fit).observe(canvas);

    // simulationSetup();
    // loop(); //only run the loop once
}

function drawDebugLines(pts,ctx){
    ctx.beginPath();
    pts.forEach((p, i) => {
        const x = p[0] * canvas.width, y = p[1] * canvas.height;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();            // joins the last point back to the first
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function bevelPath(pts, w, h, bevel = 0.35){
    pixelPath = [];
    //convert to pixel locations to get "real space"
    const P = pts.map(p => [p[0] * w, p[1] * h]);
    const n = P.length
    const out = [];

    for (let i = 0; i < n; i++){
        //%n since first and last can be out of bounds
        const A = P[(i - 1 + n) % n]
        const B = P[i] 
        const C = P[(i + 1) % n];
         
        const e1 = [B[0] - A[0], B[1] - A[1]];   // incoming direction
        const e2 = [C[0] - B[0], C[1] - B[1]];   // outgoing direction

        // turning angle: 0 = straight on, PI = 180
        const cross = e1[0] * e2[1] - e1[1] * e2[0];
        const dot   = e1[0] * e2[0] + e1[1] * e2[1];
        const turn  = Math.abs(Math.atan2(cross, dot));

        //2 is minimum turn steps, 12 is the maximum turn steps
        const steps = Math.round(2 + 10 * Math.min(1, turn / Math.PI));

        const s = [B[0] - e1[0] * bevel, B[1] - e1[1] * bevel];  // curve start
        const f = [B[0] + e2[0] * bevel, B[1] + e2[1] * bevel];  // curve end

        for (let k = 0; k <= steps; k++){
            const t = k / steps, u = 1 - t;
            out.push([
                (u*u*s[0] + 2*u*t*B[0] + t*t*f[0]) / w,
                (u*u*s[1] + 2*u*t*B[1] + t*t*f[1]) / h
            ]);
            pixelPath.push([
                (u*u*s[0] + 2*u*t*B[0] + t*t*f[0]),
                (u*u*s[1] + 2*u*t*B[1] + t*t*f[1])
            ]);
        }
    }
    return out;   // a flat list of [x, y] pixel points around the track
}

function MakeTrack(pts,ctx,width){
    const wd = width * canvas.width;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    pts.forEach((p, i) => {
        const x = p[0] * canvas.width, y = p[1] * canvas.height;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();

    // road border
    ctx.strokeStyle = 'white';        
    ctx.lineWidth = wd + 6;
    ctx.stroke();

    // road itself
    ctx.strokeStyle = '#3a3b3e';      
    ctx.lineWidth = wd;
    ctx.stroke();

    // dashed centre line
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';   
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 14]);
    ctx.stroke();
    ctx.setLineDash([]);              // reset, or later strokes stay dashed
}

function drawStartLine(path, ctx,width){
    const wd = width * canvas.width;
    const n=path.length;
    // convert to pixels BEFORE doing direction maths (the 2:1 issue again)
    const a = [path[0][0] * canvas.width, path[0][1] * canvas.height];
    const b = [path[1][0] * canvas.width, path[1][1] * canvas.height];

    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;     // unit vector at 90° to the direction

    ctx.beginPath();
    ctx.moveTo(a[0] - nx * wd / 2, a[1] - ny * wd / 2);   // one side of the road
    ctx.lineTo(a[0] + nx * wd / 2, a[1] + ny * wd / 2);   // the other side
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.stroke();
}

//-------------------------------------------------
let mask = null;      // 1 = road, 0 = grass

function MakeTrackHidden(pts,canv,ctx,width){
    const wd = width * canv.width;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    pts.forEach((p, i) => {
        const x = p[0] * canv.width, y = p[1] * canv.height;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();

    // road itself
    ctx.strokeStyle = 'white';      
    ctx.lineWidth = wd;
    ctx.stroke();
}

function buildMask(){
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;

    const g = off.getContext('2d', { willReadFrequently: true });
    MakeTrackHidden(path,off,g,RoadWidth)

    const d = g.getImageData(0, 0, off.width, off.height).data;  // RGBA, 4 numbers per pixel
    mask = new Uint8Array(off.width * off.height);
    for (let i = 0; i < mask.length; i++){
        mask[i] = d[i * 4 + 3] > 128 ? 1 : 0;  // alpha channel
    }
}

function onRoad(x, y){
    //chop off decimals
    x |= 0; 
    y |= 0;    

    const inbounds=x >= 0 && y >= 0 && x < canvas.width && y < canvas.height
    const onRoad=mask[y * canvas.width + x] === 1
    return  inbounds && onRoad;
}

//-------------------------------------------------


function randomGenome(){
    // each weight in -1..1
    return Array.from({length: GENOME_SIZE}, () => Math.random() * 2 - 1);   
}

function createCar(genome){
    //put it on the start line
    const a = [path[0][0] * canvas.width, path[0][1] * canvas.height];
    const b = [path[1][0] * canvas.width, path[1][1] * canvas.height];
    return {
        genome,
        index:0,//what part of the track its reach to (index of path)
        progress:0,//0 is the start and goal so need to measure movement
        Bestprogress:0,//since car can go back and rewind the best it got
        stallTimer:0,
        x: a[0], 
        y: a[1],
        angle: Math.atan2(b[1] - a[1], b[0] - a[0]),
        speed: 0,
        alive: true,
        finished:false,
        time:0,//track its time alive
        colour: 0
    };
}

function simulationSetup(){
    cars=[]
    generation=1;
    time = 0;
    gentxt.nodeValue =`Generation: ${generation}`
    for(let i=0;i<population;i++){
        //create car
        const genome=randomGenome();
        const car=createCar(genome)
        car.colour = i * 360 / population; 
        cars.push(car);
    }
}

function respawn(){
    cars = cars.map(c => {
        const fresh = createCar(c.genome);   
        fresh.colour = c.colour;
        return fresh;
    });
    time = 0;
}

function simulationTick(){
    for (const c of cars){
        //if the car died, or has finished the lap, go to the next car
        if (!c.alive || c.finished){continue;}

        const { steer, throttle } = GetOuput(c);
        DriveCar(c, steer, throttle);
        if (c.alive){ 
            updateProgress(c); 
            c.time++; 
        }
    }
    time++;
    //so if the time limit has passed
    //or if every car is dead or has made it
    const condition = (car) => !car.alive || car.finished;
    // if(time>=timeLimit){console.log("specifically time limit")}
    if(time>=timeLimit ||   cars.every(condition)){
        // console.log("everyone died or timelimit")
        nextGeneration();
    }
}

function DriveCar(car, steer, throttle){
    car.speed += throttle * ACCEL - car.speed * DRAG;
    const grip = Math.min(1, car.speed / (GRIPSPEED * TOPSPEED));
    car.angle += steer * TURN * grip;

    const pixels = car.speed * canvas.width / 1000;   // the only place scale appears
    car.x += Math.cos(car.angle) * pixels;
    car.y += Math.sin(car.angle) * pixels;
    if (!onRoad(car.x, car.y)) car.alive = false;
}

function castRay(car, offset){
    const maxLen = canvas.width * 0.16;
    const stepLen = maxLen / 40;
    for (let d = stepLen; d <= maxLen; d += stepLen){
        const x = car.x + Math.cos(car.angle + offset) * d;
        const y = car.y + Math.sin(car.angle + offset) * d;
        if (!onRoad(x, y)) return d / maxLen;     // hit grass: 0..1
    }
    return 1;                                     // clear all the way
}

function sense(car){
    // return an array of 5 numbers, distance to collision for the rays
    return RAY_ANGLES.map(a => castRay(car, a));  
}

function GetOuput(car){
    const g = car.genome;

    const normalisedInputSpeed=car.speed / TOPSPEED;
    
    const inputs = [...sense(car), normalisedInputSpeed];   // 6 numbers

    // hidden layer: 
    const hidden = [];
    for (let j = 0; j < HIDDEN; j++){
        let sum = g[INPUTS * HIDDEN + j];                  // bias held on the target node
        for (let i = 0; i < INPUTS; i++){
            // multiply inputs by weight held on the connection
            sum += inputs[i] * g[j * INPUTS + i];          
        }
        hidden.push(Math.tanh(sum));                       // squash into -1..1
    }

    // output layer:
    const wStart = INPUTS * HIDDEN + HIDDEN;
    const bStart = wStart + HIDDEN * OUTPUTS;
    const out = [];
    for (let k = 0; k < OUTPUTS; k++){
        let sum = g[bStart + k];
        for (let j = 0; j < HIDDEN; j++){
            sum += hidden[j] * g[wStart + k * HIDDEN + j];
        }
        out.push(Math.tanh(sum));
    }

    return {
        steer: out[0],
        throttle: ALLOW_REVERSE ? out[1] : (out[1] + 1) / 2
    };
}

function updateProgress(car){
    //while drivecar kills the car if goes off the road
    //here it determines how well it is going around the track

    //if it was determined by crossing the finish line, cars would just go backward
    //meaning cars success must be determined by how well they cross each point in the path
    //so check the points in front and behind the one the car is last closest to

    const n = pixelPath.length;
    const halfN=n / 2;

    let best = car.index
    let bestDist = Infinity;
    let checknodes=2;

    for (let o = -checknodes; o <= checknodes; o++){
        const i = (car.index + o + n) % n;
        //just the distance formula square root of squared sums
        const d = Math.hypot(pixelPath[i][0] - car.x, pixelPath[i][1] - car.y);
        if (d < bestDist){ 
            bestDist = d; 
            best = i; 
        }
    }

    var diff= best - car.index;
    //say it goes from 0 to the final node of the path, it must be determined if it went forward
    //or back, a change like that it can only be reasonable that it went backward

    //so if car index was 0 and the best is 180 then thats a 180 path step jump
    //if half is 90 then diff is >90, so the car must have gone backwards so -=n
    //similarly if the index is 180 and its now 0 then it must have wrapped around hence +=n
    if(diff<-halfN){
        diff+=n;
    }
    if(diff>halfN){
        diff-=n;
    }

    car.progress += diff;
    car.index = best;

    if(car.progress > car.Bestprogress){
        car.Bestprogress=car.progress;
        car.stallTimer=0
    }
    else{car.stallTimer+=1;}

    if (car.stallTimer > STALLLIMIT){car.alive = false;}
    if (car.progress >= n){car.finished = true;}

}

//------------------------
function fitness(car){
    //so car progress is input to fitness
    var fitness=car.Bestprogress
    //actually finishing the lap is the big whoop
    if(car.finished){fitness+=1000 + timeLimit - car.time}

    return fitness;
}

function pickParent(SArray){
    //random car from the better half of the sorted array
    const max=Math.round(SArray.length/2);
    const n=Math.floor(Math.random() * max);

    return SArray[n].genome;
}

function nextGeneration(){
    if (generation >= generationCap){return;}
   
    //get the order of cars that are the best
    const condition = (a, b) => fitness(b) - fitness(a);
    const sorted = [...cars].sort(condition);
    
    const nextGenomes = [];
    var survivors=ELITES> population ? population : ELITES; 
    for (let i = 0; i < survivors; i++){
        if (!sorted[i]){continue;}
        //copy over the genome of the car
        nextGenomes.push(sorted[i].genome.slice());
    }

    while (nextGenomes.length < population){
        const a = pickParent(sorted);
        const b = pickParent(sorted);
        const child = a.map((geneA, i) => {
            // gene inherited from 1 or the other parent on a coin toss
            let gene = Math.random() < 0.5 ? geneA : b[i];        
            if (Math.random() < mutationrate){
                // nudge gene by -1,1 range * aggression
                gene += (Math.random() * 2 - 1) * mutationAggression;   
            }
            return gene;
        });
        nextGenomes.push(child);
    }    
    
    time = 0;
    generation++;
    gentxt.nodeValue =`Generation: ${generation}`
    cars = nextGenomes.map((genome, i) => {
        const car = createCar(genome);
        car.colour = i * 360 / population;
        return car;
    });
}