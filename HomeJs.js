const canvas = document.querySelector('.waves');
const ctx = canvas.getContext('2d');

// --- knobs ---

const H_MIN = 0.14;         // horizon on the thinnest pages (fraction of the scene)
const H_MAX = 0.30;         // the limit on wide pages
const ASPECT_NARROW = 0.5;  // width / height at or below this uses H_MIN
const ASPECT_WIDE   = 1.8;  // width / height at or above this uses H_MAX

let skyPx = 0;              // visible sky height in px, used to size the name

const MIN_CONTENT = 420;   // narrowest the right-hand column may get, in px
const GAP         = 32;    // space between the name and the column

const NAME       = 'David Naray';
const NAME_COLOR = '#0d3b66';   // white is hard to read against the pale haze
const NAME_ROW   = 50;          // which row it stands in: lower = nearer and lower on screen, higher = farther and smaller
const SINK_DIST  = 0.5;         // scroll distance to fully sink, as a fraction of window height

const MIN_PX = 20;   // never pack columns tighter than this on screen
const CAM_H     = 3;      // camera height above the water
const ROWS      = 64;     // rows of vertices going into the distance
const DEPTH     = 22;     // far distance as a multiple of the near distance
const COL_PX    = 60;     // column spacing in pixels at the bottom of the screen
const AMP       = 0.4;    // wave height (world units)
const SPEED     = 1;
const SHOW_COLS = true;   // false = just wave lines, no cross lines
const CURVE = 0.05; 

const FOAM_START   = 0.95;   // 0-1: how far up a wave before foam begins (lower = more foam)
const FOAM_AMT     = 0.15;   // 1 = fully white at the tips
const FOAM_BREAKUP = 1.6;   // 0 = clean white caps, higher = patchy, frothy edges

const FOG_POW = 4.0;    // lower = haze starts closer to you, higher = clearer water for longer
const LIGHT   = 0.35;   // strength of slope shading (negative flips the light direction)
const LINES   = 0.12;   // opacity of the wave lines on top, 0 = none

const NEAR = [0, 52, 70];      // dark greenish turquoise, at the bottom of the screen
const FAR  = [70, 160, 225];   // light blue, just before the haze takes over
const HAZE = [170, 225, 270];   // must match the bottom of .sky (#a9dfe0)

const GRAD_POW = 0.8;           // <1 = light blue creeps in closer to you, >1 = stays dark longer
const SHADE    = 0.3;           // how much the waves lighten/darken the base colour

const mix = (a, b, t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const rgb = c => `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;

function setHorizon() {
    const aspect = innerWidth / innerHeight;
    let t = clamp((aspect - ASPECT_NARROW) / (ASPECT_WIDE - ASPECT_NARROW));
    t = t * t * (3 - 2 * t);                          // smoothstep, so it eases at both ends
    const hor = H_MIN + (H_MAX - H_MIN) * t;

    // the scene is inset -10% and 120% tall, so the on-screen horizon is offset
    skyPx = innerHeight * (1.2 * hor - 0.1);

    const root = document.documentElement.style;
    root.setProperty('--horizon', (hor * 100).toFixed(2) + '%');
    root.setProperty('--horizon-y', skyPx.toFixed(0) + 'px');   // for the content padding
}

let sink = 0, sinkTarget = 0;
function onScroll() { sinkTarget = clamp(window.scrollY / (innerHeight * SINK_DIST)); }
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

let w, h, f, zNear, dx, r;

const SWAY = 0.3;
const LIFT = 0.9;   // how far above the waterline it sits at rest, in letter heights
const NAME_X = 0.14;   // left margin as a fraction of screen width
const PAD       = 200;   // must equal --pad in the CSS
const SIZE_MULT = 2;     // 1 = the old size, 2 = double

function drawName(row) {
    const mid = row.pts[-row.i0];                 // the vertex at x = 0, the screen centre

    const { still, size } = nameMetrics();
    const waterY = still + (mid.sy - still) * SWAY;

    ctx.save();
    // clip to everything above this row's wavy edge
    ctx.beginPath();
    row.pts.forEach((p, k) => k ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy));
    ctx.lineTo(w + 200, -1000);
    ctx.lineTo(-200, -1000);
    ctx.closePath();
    ctx.clip();

    ctx.font = `900 ${size}px Impact, "Arial Black", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = NAME_COLOR;
    // ctx.fillText(NAME, w / 2, waterY + size * (sink * 1.2 - 0.05));
    // ctx.fillText(NAME, w / 2, waterY + size * (-LIFT + sink * (LIFT + 1.2) - 0.05));
    ctx.fillText(NAME, w * NAME_X, waterY + size * (-LIFT + sink * (LIFT + 1.5) - 0.05));
    ctx.restore();
}

function nameMetrics() {
    const zRow  = zNear * Math.pow(r, NAME_ROW);
    const still = CAM_H * f / zRow;
    const base  = (still - 8) / (LIFT + 0.85);
    const size  = Math.min(
        w * (1 - NAME_X * 2) / (NAME.length * 0.62),
        base * SIZE_MULT,
        (still + PAD - 8) / (LIFT + 0.85)
    );
    return { still, size };
}

function layoutContent() {
    const { still, size } = nameMetrics();
    ctx.font = `900 ${size}px Impact, "Arial Black", sans-serif`;
    const nameRight = w * NAME_X + ctx.measureText(NAME).width;
    const free = innerWidth - nameRight - GAP;
    const side = free >= MIN_CONTENT;

    const root = document.documentElement;
    root.classList.toggle('side', side);
    root.style.setProperty('--content-w', side ? free + 'px' : '100%');
    // document.documentElement.style.setProperty('--content-top',`${still + size * 1.5}px`);
    const contentTop = side
        ? 0 // wide layout: beside the name
        : still + size; // narrow layout: below the name
    root.style.setProperty('--content-top', `${contentTop}px`);
}

function resize() {
    setHorizon();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    // h = canvas.clientHeight;
    h = canvas.clientHeight - PAD;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    // ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, PAD * dpr);

    f = w * 0.8;                              // focal length
    zNear = CAM_H * f / (h * 1.15);           // nearest row sits just below the screen
    dx = COL_PX * zNear / f;                  // column spacing in world units
    r = Math.pow(DEPTH, 1 / (ROWS - 1));      // rows spaced geometrically: even on screen
    layoutContent();
    
    console.log({
        innerWidth,
        innerHeight,
        canvasWidth: canvas.clientWidth,
        canvasHeight: canvas.clientHeight
    });
}

// resize();

// the wave function: this is where you sculpt the ocean
function height(x, z, t, damp) {
    const a =
        Math.sin(x * 0.6 + t * 1.1 + Math.sin(z * 0.35 + t * 0.5) * 1.6)
        + Math.sin(z * 0.8 - t * 1.4 + x * 0.25) * 0.6
        + Math.sin(x * 1.5 + z * 1.1 + t * 0.9) * 0.25;
    return a * AMP * damp;
}

//draw farther lines first
function drawLines(list) {
    ctx.lineWidth = 1.5;
    for (const row of list) {
        ctx.strokeStyle = `rgba(255,255,255,${LINES * row.fade})`;
        ctx.beginPath();
        row.pts.forEach((p, k) => k ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy));
        ctx.stroke();
    }
}
function frame(ms) {
    const t = ms / 1000 * SPEED;
    sink += (sinkTarget - sink) * 0.25;
    
    // ctx.clearRect(0, 0, w, h);
    ctx.clearRect(0, -PAD, w, h + PAD);
    ctx.lineWidth = 1.5;

    // compute all vertices, row by row
    const rows = [];
    for (let j = 0; j < ROWS; j++) {
        const z = zNear * Math.pow(r, j);
        const s = f / z;
        // const halfW = (w / 2) / s + dx * 2;              // world half-width visible at this depth
        // const i0 = Math.floor(-halfW / dx);
        // const i1 = Math.ceil(halfW / dx);
        const dxr = Math.max(dx, MIN_PX / s);        // world spacing for this row
        const halfW = (w / 2) / s + dxr * 2;
        const i0 = Math.floor(-halfW / dxr);
        const i1 = Math.ceil(halfW / dxr);
        const damp = 1 / (1 + j * 0.05);                  // waves calm down with distance
        const far = j / (ROWS - 1);
        const fog = Math.pow(far, FOG_POW);

        const pts = [];
        for (let i = i0; i <= i1; i++) {
            // const x = i * dx;
            const x = i * dxr;                           // was i * dx
            const y = height(x, z, t, damp);
            const sz = (height(x, z + 0.05, t, damp) - y) / 0.05;   // slope along the view direction
            // pts.push({ i, sx: w / 2 + x * s, sy: (CAM_H - y) * s });

            const hN = clamp(0.5 + y / (AMP * 3));

            // 1. base colour from distance
            let c = mix(NEAR, FAR, Math.pow(far, GRAD_POW));

            // 2. wave shading: crests and faces tilted towards the light get lighter, others darker
            const shade = (hN - 0.5) * 1.0 - sz * LIGHT;
            c = mix(c, shade > 0 ? [255, 255, 255] : [0, 30, 50], clamp(Math.abs(shade)) * SHADE * (1 - fog * 0.7));

            // 3. froth on the crests
            const peak = y / (AMP * damp * 1.85);   // -1..1, relative to the tallest this depth can get
            const n = 0.5 + 0.5 * Math.sin(x * 3.1 + t * 1.3) * Math.sin(z * 2.7 - t * 0.9 + x * 0.8);
            let foam = clamp((peak - FOAM_START + (n - 0.5) * FOAM_BREAKUP) / (1 - FOAM_START));
            foam = foam * foam * (3 - 2 * foam);    // smoothstep, so edges are soft
            c = mix(c, [255, 255, 255], foam * FOAM_AMT * (1 - fog * 0.6));

            // 4. haze, only in the last stretch
            c = mix(c, HAZE, fog);

            const nx = (x * s) / (w / 2);                       // -1..1 across the screen
            const sag = CURVE * h * nx * nx * Math.pow(far, 1.5);
            pts.push({ i, sx: w / 2 + x * s, sy: (CAM_H - y) * s + sag,c });
        }
        // const fade = Math.pow(1 - j / (ROWS - 1), 1.6);   // fade towards the horizon
        // rows.push({ pts, fade });
        rows.push({ i0, i1, pts, fade: 1 - fog });
    }

    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    for (let j = ROWS - 2; j >= 0; j--) {
        const a = rows[j], b = rows[j + 1];
        const lo = Math.max(a.i0, b.i0), hi = Math.min(a.i1, b.i1);
        for (let i = lo; i < hi; i++) {
            const p0 = a.pts[i - a.i0], p1 = a.pts[i + 1 - a.i0];
            const q0 = b.pts[i - b.i0], q1 = b.pts[i + 1 - b.i0];
            const col = rgb([
                (p0.c[0]+p1.c[0]+q0.c[0]+q1.c[0]) / 4,
                (p0.c[1]+p1.c[1]+q0.c[1]+q1.c[1]) / 4,
                (p0.c[2]+p1.c[2]+q0.c[2]+q1.c[2]) / 4,
            ]);
            ctx.fillStyle = col;
            ctx.strokeStyle = col;     // same-colour stroke hides hairline seams between quads
            ctx.beginPath();
            ctx.moveTo(p0.sx, p0.sy);
            ctx.lineTo(p1.sx, p1.sy);
            ctx.lineTo(q1.sx, q1.sy);
            ctx.lineTo(q0.sx, q0.sy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    
        if (j === NAME_ROW) {
            if (LINES > 0) drawLines(rows.slice(NAME_ROW));   // far lines go under the name
            drawName(rows[NAME_ROW]);
        }
    }

    if (LINES > 0) drawLines(rows.slice(0, NAME_ROW));   // near lines go over everything nearer than the name

    requestAnimationFrame(frame);
}

// window.addEventListener('resize', resize);
// window.addEventListener('load', resize);

// document.fonts.ready.then(
//     resize
//     requestAnimationFrame(frame);
// );
// document.fonts.ready.then(() => {
//     resize();
//     requestAnimationFrame(frame);
// });

function start() {
    resize();
    requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);

window.addEventListener('load', async () => {
    await document.fonts.ready;
    start();
});