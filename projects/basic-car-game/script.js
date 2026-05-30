// === CONFIG ===
const CARS = [
    {
        id: "kirmizi_civic", name: "Red Civic",
        folder: "arabalar/kirmizi_civic/", prefix: "Red_CIVIC_CLEAN_All_",
        spriteCount: 48, spriteSize: 100, scale: 1.5,
        zeroAngle: 0, direction: 1,
        desc: "Balanced speed & control.",
        stats: { speed: "\u2605\u2605\u2605", control: "\u2605\u2605\u2605", drift: "\u2605\u2605\u2605" }
    },
    {
        id: "beyaz_limo", name: "White Limo",
        folder: "arabalar/beyaz_limo/", prefix: "White_LIMO_CLEAN_All_",
        spriteCount: 48, spriteSize: 140, scale: 0.9, gameScale: 0.98,
        zeroAngle: 0, direction: 1,
        desc: "Heavy, long and slippery.",
        stats: { speed: "\u2605\u2605\u2605\u2605", control: "\u2605\u2605", drift: "\u2605\u2605\u2605\u2605" }
    },
    {
        id: "sari_jeep", name: "Yellow Jeep",
        folder: "arabalar/sari_jeep/", prefix: "Yellow_JEEP_CLEAN_All_",
        spriteCount: 48, spriteSize: 100, scale: 1.48,
        zeroAngle: 0, direction: 1,
        desc: "Great grip, tough ride.",
        stats: { speed: "\u2605\u2605", control: "\u2605\u2605\u2605\u2605", drift: "\u2605\u2605" }
    },
    {
        id: "yesil_super", name: "Green Super",
        folder: "arabalar/yesil_super/", prefix: "Green_SUPERCAR_CLEAN_All_",
        spriteCount: 48, spriteSize: 100, scale: 1.16, gameScale: 1.25,
        zeroAngle: 0, direction: 1,
        desc: "Fast super model with sharp drift.",
        stats: { speed: "\u2605\u2605\u2605\u2605\u2605", control: "\u2605\u2605\u2605", drift: "\u2605\u2605\u2605\u2605" }
    }
];

let selectedCarIndex = 0;
let selectionPreviewFrameId = null;
let selectionPreviewFrame = 0;
let selectionPreviewLastTime = 0;
const SELECTION_PREVIEW_FRAME_MS = 70;

// Physics
const MAX_SPEED = 20;
const OFF_TRACK_MAX_SPEED_MULTIPLIER = 0.4;
const NORMAL_TURN_SPEED = 0.08;
const DRIFT_TURN_SPEED = 0.015;

// === CITY MAP CONFIG ===
const ROAD_LINES = [-3200, -2400, -1600, -800, 0, 800, 1600, 2400, 3200];
const ROAD_HALF = 260;
const SIDEWALK = 24;
const MAP_BOUND = 3800;
const CENTER_CLEAR_HALF = 700;

// === GAME STATE ===
let canvas, ctx;
let lastTime = 0;
let gameRunning = false;
let animationFrameId;

let car = {
    pos: { x: 0, y: 100 },
    vel: { x: 0, y: 0 },
    facingAngle: -Math.PI / 2,
};

let keys = { w: false, a: false, s: false, d: false, space: false };
let touchInput = { x: 0, y: 0, drift: false, pointerId: null, driftPointerId: null };
let joystickElements = null;
const JOYSTICK_DEADZONE = 0.12;
let score = { total: 0, currentDrift: 0, time: 0 };
let skidmarks = [];
let spriteImages = [];
let loadedImages = 0;
let hasError = false;

// === INIT ===
window.onload = () => {
    initUI();
    renderCarSelection();
};

function initUI() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', resizeCanvas);
    }
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    document.getElementById('changeCarBtn').addEventListener('click', returnToCarSelection);
    initTouchControls();

    window.addEventListener('keydown', (e) => {
        let key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
            e.preventDefault();
        }
        if (key === 'w' || e.key === 'ArrowUp') keys.w = true;
        if (key === 'a' || e.key === 'ArrowLeft') keys.a = true;
        if (key === 's' || e.key === 'ArrowDown') keys.s = true;
        if (key === 'd' || e.key === 'ArrowRight') keys.d = true;
        if (key === ' ') { keys.space = true; e.preventDefault(); }
    });
    window.addEventListener('keyup', (e) => {
        let key = e.key.toLowerCase();
        if (key === 'w' || e.key === 'ArrowUp') keys.w = false;
        if (key === 'a' || e.key === 'ArrowLeft') keys.a = false;
        if (key === 's' || e.key === 'ArrowDown') keys.s = false;
        if (key === 'd' || e.key === 'ArrowRight') keys.d = false;
        if (key === ' ') keys.space = false;
    });
}

function initTouchControls() {
    const zone = document.getElementById('joystickZone');
    const thumb = document.getElementById('joystickThumb');
    const driftBtn = document.getElementById('driftTouchBtn');
    if (!zone || !thumb || !driftBtn || !window.PointerEvent) return;

    joystickElements = { zone, thumb, driftBtn };

    zone.addEventListener('pointerdown', handleJoystickStart);
    zone.addEventListener('pointermove', handleJoystickMove);
    zone.addEventListener('pointerup', handleJoystickEnd);
    zone.addEventListener('pointercancel', handleJoystickEnd);
    zone.addEventListener('lostpointercapture', handleJoystickEnd);

    driftBtn.addEventListener('pointerdown', handleDriftStart);
    driftBtn.addEventListener('pointerup', handleDriftEnd);
    driftBtn.addEventListener('pointercancel', handleDriftEnd);
    driftBtn.addEventListener('lostpointercapture', handleDriftEnd);
}

function handleJoystickStart(e) {
    if (touchInput.pointerId !== null) return;
    e.preventDefault();
    touchInput.pointerId = e.pointerId;
    joystickElements.zone.classList.add('active');
    joystickElements.zone.setPointerCapture(e.pointerId);
    updateJoystickFromPointer(e);
}

function handleJoystickMove(e) {
    if (e.pointerId !== touchInput.pointerId) return;
    e.preventDefault();
    updateJoystickFromPointer(e);
}

function handleJoystickEnd(e) {
    if (e.pointerId !== touchInput.pointerId) return;
    e.preventDefault();
    if (joystickElements.zone.hasPointerCapture(e.pointerId)) {
        joystickElements.zone.releasePointerCapture(e.pointerId);
    }
    touchInput.pointerId = null;
    touchInput.x = 0;
    touchInput.y = 0;
    joystickElements.zone.classList.remove('active');
    moveJoystickThumb(0, 0);
}

function updateJoystickFromPointer(e) {
    const rect = joystickElements.zone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDistance = Math.min(rect.width, rect.height) * 0.32;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const strength = Math.min(distance / maxDistance, 1);
    let x = distance > 0 ? (dx / distance) * strength : 0;
    let y = distance > 0 ? (dy / distance) * strength : 0;

    if (Math.hypot(x, y) < JOYSTICK_DEADZONE) {
        x = 0;
        y = 0;
    }

    touchInput.x = x;
    touchInput.y = y;
    moveJoystickThumb(x, y);
}

function moveJoystickThumb(x, y) {
    if (!joystickElements) return;
    const travel = Math.min(joystickElements.zone.offsetWidth, joystickElements.zone.offsetHeight) * 0.28;
    const thumbX = Math.round(x * travel);
    const thumbY = Math.round(y * travel);
    joystickElements.thumb.style.transform = `translate(-50%, -50%) translate(${thumbX}px, ${thumbY}px)`;
}

function handleDriftStart(e) {
    if (touchInput.driftPointerId !== null) return;
    e.preventDefault();
    touchInput.driftPointerId = e.pointerId;
    touchInput.drift = true;
    joystickElements.driftBtn.classList.add('active');
    joystickElements.driftBtn.setPointerCapture(e.pointerId);
}

function handleDriftEnd(e) {
    if (e.pointerId !== touchInput.driftPointerId) return;
    e.preventDefault();
    if (joystickElements.driftBtn.hasPointerCapture(e.pointerId)) {
        joystickElements.driftBtn.releasePointerCapture(e.pointerId);
    }
    touchInput.driftPointerId = null;
    touchInput.drift = false;
    joystickElements.driftBtn.classList.remove('active');
}

function resetInputState() {
    keys = { w: false, a: false, s: false, d: false, space: false };
    touchInput.x = 0;
    touchInput.y = 0;
    touchInput.drift = false;
    touchInput.pointerId = null;
    touchInput.driftPointerId = null;
    if (joystickElements) {
        joystickElements.zone.classList.remove('active');
        joystickElements.driftBtn.classList.remove('active');
        moveJoystickThumb(0, 0);
    }
}

function resizeCanvas() {
    const viewport = window.visualViewport || window;
    canvas.width = Math.floor(viewport.width || window.innerWidth);
    canvas.height = Math.floor(viewport.height || window.innerHeight);
    if (ctx) ctx.imageSmoothingEnabled = false;
}

function getCarPreviewSize(carConfig) {
    return Math.round(carConfig.spriteSize * carConfig.scale * 0.82);
}

function getCarGameSize(carConfig) {
    return carConfig.spriteSize * (carConfig.gameScale || carConfig.scale);
}

function renderCarSelection() {
    const container = document.getElementById('carContainer');
    container.innerHTML = '';
    CARS.forEach((c, index) => {
        let card = document.createElement('div');
        card.className = `car-card ${index === selectedCarIndex ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="car-preview-stage">
                <img class="car-preview" data-car-index="${index}" style="--preview-size:${getCarPreviewSize(c)}px" src="${c.folder}${c.prefix}000.png" alt="${c.name}">
            </div>
            <h3>${c.name}</h3>
            <p style="font-size:0.55rem;margin-bottom:12px;color:#ecf0f1;">${c.desc}</p>
            <div class="car-stats">
                <div><span>Speed:</span><span>${c.stats.speed}</span></div>
                <div><span>Control:</span><span>${c.stats.control}</span></div>
                <div><span>Drift:</span><span>${c.stats.drift}</span></div>
            </div>`;
        card.addEventListener('click', () => { selectedCarIndex = index; renderCarSelection(); });
        container.appendChild(card);
    });
    startSelectionPreview();
    loadSprites();
}

function startSelectionPreview() {
    stopSelectionPreview();
    selectionPreviewFrame = 0;
    selectionPreviewLastTime = 0;
    selectionPreviewFrameId = requestAnimationFrame(updateSelectionPreview);
}

function stopSelectionPreview() {
    if (selectionPreviewFrameId !== null) {
        cancelAnimationFrame(selectionPreviewFrameId);
        selectionPreviewFrameId = null;
    }
}

function updateSelectionPreview(timestamp) {
    const startScreen = document.getElementById('startScreen');
    if (startScreen.classList.contains('hidden')) {
        selectionPreviewFrameId = null;
        return;
    }

    if (!selectionPreviewLastTime || timestamp - selectionPreviewLastTime >= SELECTION_PREVIEW_FRAME_MS) {
        const carConfig = CARS[selectedCarIndex];
        const previewImg = document.querySelector('.car-card.selected .car-preview');
        if (previewImg && carConfig) {
            const frame = selectionPreviewFrame % carConfig.spriteCount;
            previewImg.src = `${carConfig.folder}${carConfig.prefix}${frame.toString().padStart(3, '0')}.png`;
            selectionPreviewFrame = (selectionPreviewFrame + 1) % carConfig.spriteCount;
        }
        selectionPreviewLastTime = timestamp;
    }

    selectionPreviewFrameId = requestAnimationFrame(updateSelectionPreview);
}

// === SPRITE LOADING ===
function loadSprites() {
    let sc = CARS[selectedCarIndex];
    spriteImages = []; loadedImages = 0; hasError = false;
    updateLoading();
    for (let i = 0; i < sc.spriteCount; i++) {
        let img = new Image();
        img.src = `${sc.folder}${sc.prefix}${i.toString().padStart(3,'0')}.png`;
        img.onload = () => { loadedImages++; updateLoading(); };
        img.onerror = () => { hasError = true; updateLoading(); };
        spriteImages.push(img);
    }
}

function updateLoading() {
    const status = document.getElementById('loadingStatus');
    const btn = document.getElementById('startBtn');
    let sc = CARS[selectedCarIndex];
    if (hasError) {
        status.innerText = "Error: Could not load sprites. Check file paths.";
        status.classList.remove('hidden'); status.style.color = "#e74c3c";
        btn.disabled = true; return;
    }
    if (loadedImages === sc.spriteCount && sc.spriteCount > 0) {
        status.classList.add('hidden'); btn.disabled = false; btn.innerText = "Start Game";
    } else {
        status.innerText = `Loading sprites... (${loadedImages}/${sc.spriteCount})`;
        status.classList.remove('hidden'); status.style.color = "#f1c40f"; btn.disabled = true;
    }
}

// === GAME LOOP CONTROLS ===
function startGame() {
    stopSelectionPreview();
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('uiLayer').classList.remove('hidden');
    document.getElementById('carNameDisplay').innerText = CARS[selectedCarIndex].name;
    resetGame(); gameRunning = true; lastTime = performance.now();
    animationFrameId = requestAnimationFrame(loop);
}

function returnToCarSelection() {
    gameRunning = false; cancelAnimationFrame(animationFrameId);
    resetInputState();
    document.getElementById('uiLayer').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    renderCarSelection();
}

function resetGame() {
    car.pos = { x: 0, y: 100 }; car.vel = { x: 0, y: 0 };
    car.facingAngle = -Math.PI / 2;
    score.total = 0; score.currentDrift = 0; score.time = 0;
    skidmarks = [];
    resetInputState();
}

function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000; lastTime = timestamp;
    if (dt > 0.1) dt = 0.1;
    update(dt); draw();
    if (gameRunning) animationFrameId = requestAnimationFrame(loop);
}

function getMovementInput() {
    let targetDir = { x: 0, y: 0 };
    if (keys.w) targetDir.y -= 1;
    if (keys.s) targetDir.y += 1;
    if (keys.a) targetDir.x -= 1;
    if (keys.d) targetDir.x += 1;

    targetDir.x += touchInput.x;
    targetDir.y += touchInput.y;

    let len = Math.hypot(targetDir.x, targetDir.y);
    if (len < 0.001) return { x: 0, y: 0 };

    const eightWayStep = Math.PI / 4;
    const snappedAngle = Math.round(Math.atan2(targetDir.y, targetDir.x) / eightWayStep) * eightWayStep;
    targetDir.x = Math.cos(snappedAngle);
    targetDir.y = Math.sin(snappedAngle);

    if (Math.abs(targetDir.x) < 0.001) targetDir.x = 0;
    if (Math.abs(targetDir.y) < 0.001) targetDir.y = 0;
    return targetDir;
}

// === PHYSICS UPDATE ===
function update(deltaTime) {
    if (!gameRunning) return;
    score.time += deltaTime;

    let targetDir = getMovementInput();

    if (targetDir.x !== 0 || targetDir.y !== 0) {
        car.facingAngle = Math.atan2(targetDir.y, targetDir.x);
    }

    let offTrack = isOffTrack(car.pos.x, car.pos.y);
    let currentMaxSpeed = offTrack ? MAX_SPEED * OFF_TRACK_MAX_SPEED_MULTIPLIER : MAX_SPEED;
    let targetVel = { x: targetDir.x * currentMaxSpeed, y: targetDir.y * currentMaxSpeed };

    let isDrifting = (keys.space || touchInput.drift) && !offTrack;
    let turnSpeed = isDrifting ? DRIFT_TURN_SPEED : NORMAL_TURN_SPEED;
    if (offTrack) turnSpeed = NORMAL_TURN_SPEED * 0.5;

    let dtScale = deltaTime * 60;
    car.vel.x += (targetVel.x - car.vel.x) * turnSpeed * dtScale;
    car.vel.y += (targetVel.y - car.vel.y) * turnSpeed * dtScale;

    if (targetDir.x === 0 && targetDir.y === 0) {
        let friction = Math.pow(0.95, dtScale);
        car.vel.x *= friction; car.vel.y *= friction;
    }

    // Calculate new position
    let newX = car.pos.x + car.vel.x * dtScale;
    let newY = car.pos.y + car.vel.y * dtScale;

    // Building & boundary collision
    let areaNew = getAreaType(newX, newY);
    if (areaNew === 'building' || areaNew === 'wall') {
        let areaX = getAreaType(newX, car.pos.y);
        let areaY = getAreaType(car.pos.x, newY);
        if (areaX !== 'building' && areaX !== 'wall') {
            car.pos.x = newX; car.vel.y *= -0.3;
        } else if (areaY !== 'building' && areaY !== 'wall') {
            car.pos.y = newY; car.vel.x *= -0.3;
        } else {
            car.vel.x *= -0.2; car.vel.y *= -0.2;
        }
    } else {
        car.pos.x = newX; car.pos.y = newY;
    }

    // Hard clamp to map boundaries
    car.pos.x = Math.max(-MAP_BOUND, Math.min(MAP_BOUND, car.pos.x));
    car.pos.y = Math.max(-MAP_BOUND, Math.min(MAP_BOUND, car.pos.y));

    handleDriftLogic(dtScale, isDrifting, offTrack);
    let speed = Math.sqrt(car.vel.x * car.vel.x + car.vel.y * car.vel.y);
    updateHUD(speed, targetDir);
}

function handleDriftLogic(dtScale, isDrifting, offTrack) {
    let speed = Math.sqrt(car.vel.x * car.vel.x + car.vel.y * car.vel.y);
    let velAngle = Math.atan2(car.vel.y, car.vel.x);
    let angleDiff = Math.abs(velAngle - car.facingAngle);
    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

    if (isDrifting && speed > 5 && angleDiff > 0.2) {
        let scoreMultiplier = offTrack ? 0 : 1;
        score.currentDrift += speed * angleDiff * 0.5 * scoreMultiplier * dtScale;
        let rearDist = 40, sideDist = 20;
        let rx = car.pos.x - Math.cos(car.facingAngle) * rearDist;
        let ry = car.pos.y - Math.sin(car.facingAngle) * rearDist;
        skidmarks.push({x: rx + Math.cos(car.facingAngle - Math.PI/2) * sideDist, y: ry + Math.sin(car.facingAngle - Math.PI/2) * sideDist, life: 1.0});
        skidmarks.push({x: rx + Math.cos(car.facingAngle + Math.PI/2) * sideDist, y: ry + Math.sin(car.facingAngle + Math.PI/2) * sideDist, life: 1.0});
    } else {
        if (score.currentDrift > 0) { score.total += Math.floor(score.currentDrift); score.currentDrift = 0; }
    }
    skidmarks.forEach(m => m.life -= 0.005 * dtScale);
    skidmarks = skidmarks.filter(m => m.life > 0);
}

// === DRAWING ===
function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    let camX = canvas.width / 2 - car.pos.x;
    let camY = canvas.height / 2 - car.pos.y;
    ctx.translate(camX, camY);

    drawTrack(ctx);

    skidmarks.forEach(mark => {
        ctx.fillStyle = `rgba(10,10,15,${mark.life * 0.6})`;
        ctx.fillRect(Math.floor(mark.x / 4) * 4, Math.floor(mark.y / 4) * 4, 6, 6);
    });

    let sc = CARS[selectedCarIndex];
    let sIndex = getSpriteIndex(car.facingAngle, sc);
    let carImg = spriteImages[sIndex];
    if (carImg) {
        let ds = getCarGameSize(sc);
        ctx.drawImage(carImg, car.pos.x - ds/2, car.pos.y - ds/2, ds, ds);
    }
    ctx.restore();
}

// === CITY MAP ===
let trackCanvas = null;
const TRACK_SIZE = 8000;
const TILE = 16;

function hash(a, b) {
    let h = a * 374761393 + b * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return Math.abs(h ^ (h >> 16));
}

const BLDG_COLORS = [
    {top:'#4a6fa5',shade:'#3a5580',win:'#6a9fd5'},
    {top:'#8b7355',shade:'#6b5335',win:'#bba385'},
    {top:'#a04040',shade:'#803030',win:'#d07070'},
    {top:'#6b5b8d',shade:'#4b3b6d',win:'#9b8bbd'},
    {top:'#3d7a6a',shade:'#2d5a4a',win:'#6daa9a'},
    {top:'#c4a43a',shade:'#a4842a',win:'#e4c45a'},
    {top:'#707a7a',shade:'#505a5a',win:'#a0aaba'},
    {top:'#b06030',shade:'#904020',win:'#d09060'},
];

function isInCenterClearing(x, y) {
    return Math.abs(x) < CENTER_CLEAR_HALF && Math.abs(y) < CENTER_CLEAR_HALF;
}

function overlapsCenterClearing(x1, y1, x2, y2, padding = 0) {
    return x1 < CENTER_CLEAR_HALF + padding &&
        x2 > -CENTER_CLEAR_HALF - padding &&
        y1 < CENTER_CLEAR_HALF + padding &&
        y2 > -CENTER_CLEAR_HALF - padding;
}

function getAreaType(x, y) {
    if (Math.abs(x) > MAP_BOUND || Math.abs(y) > MAP_BOUND) return 'wall';
    if (isInCenterClearing(x, y)) return 'plaza';
    for (let r of ROAD_LINES) {
        if (Math.abs(y - r) < ROAD_HALF || Math.abs(x - r) < ROAD_HALF) return 'road';
    }
    for (let r of ROAD_LINES) {
        if (Math.abs(y - r) < ROAD_HALF + SIDEWALK || Math.abs(x - r) < ROAD_HALF + SIDEWALK) return 'sidewalk';
    }
    return 'building';
}

function buildTrackCanvas() {
    if (trackCanvas) return;
    trackCanvas = document.createElement('canvas');
    trackCanvas.width = TRACK_SIZE;
    trackCanvas.height = TRACK_SIZE;
    let tc = trackCanvas.getContext('2d');
    tc.imageSmoothingEnabled = false;
    const half = TRACK_SIZE / 2;

    // Pass 1: Base tiles (road, sidewalk, building ground)
    for (let ty = 0; ty < TRACK_SIZE; ty += TILE) {
        for (let tx = 0; tx < TRACK_SIZE; tx += TILE) {
            let wx = tx - half, wy = ty - half;
            let type = getAreaType(wx, wy);
            let h = ((tx * 7 + ty * 13) >> 4) & 1;
            switch(type) {
                case 'road':
                    tc.fillStyle = h ? '#3d4f5f' : '#374856';
                    break;
                case 'plaza':
                    tc.fillStyle = h ? '#4a5e69' : '#435762';
                    break;
                case 'sidewalk':
                    tc.fillStyle = h ? '#9e9680' : '#8e8670';
                    break;
                case 'wall':
                    tc.fillStyle = '#1a1a2e';
                    break;
                default: // building area base
                    tc.fillStyle = h ? '#2a2a3e' : '#252538';
                    break;
            }
            tc.fillRect(tx, ty, TILE, TILE);
        }
    }

    // Pass 2: Dashed center road lines
    tc.fillStyle = '#f1c40f';
    for (let r of ROAD_LINES) {
        for (let x = -half; x < half; x += 48) {
            tc.fillRect(half + x, half + r - 2, 24, 4);
        }
        for (let y = -half; y < half; y += 48) {
            tc.fillRect(half + r - 2, half + y, 4, 24);
        }
    }

    // Pass 2b: Crosswalks at intersections
    tc.fillStyle = '#ccc';
    for (let rx of ROAD_LINES) {
        for (let ry of ROAD_LINES) {
            for (let s = -ROAD_HALF + 12; s < ROAD_HALF - 12; s += 20) {
                tc.fillRect(half + rx + s, half + ry - ROAD_HALF - SIDEWALK + 2, 10, 14);
                tc.fillRect(half + rx + s, half + ry + ROAD_HALF + 4, 10, 14);
            }
        }
    }

    // Pass 2c: Road edge white lines
    tc.fillStyle = '#888';
    for (let r of ROAD_LINES) {
        // Horizontal road edges
        for (let x = -MAP_BOUND; x < MAP_BOUND; x += TILE) {
            tc.fillRect(half + x, half + r - ROAD_HALF, TILE, 2);
            tc.fillRect(half + x, half + r + ROAD_HALF - 2, TILE, 2);
        }
        // Vertical road edges
        for (let y = -MAP_BOUND; y < MAP_BOUND; y += TILE) {
            tc.fillRect(half + r - ROAD_HALF, half + y, 2, TILE);
            tc.fillRect(half + r + ROAD_HALF - 2, half + y, 2, TILE);
        }
    }

    drawCenterClearing(tc, half);

    // Pass 3: Draw buildings in city blocks
    drawCityBuildings(tc, half);

    // Pass 4: Map boundary wall
    tc.strokeStyle = '#e94560';
    tc.lineWidth = 6;
    tc.strokeRect(half - MAP_BOUND, half - MAP_BOUND, MAP_BOUND * 2, MAP_BOUND * 2);
}

function drawCenterClearing(tc, half) {
    const x = half - CENTER_CLEAR_HALF;
    const y = half - CENTER_CLEAR_HALF;
    const size = CENTER_CLEAR_HALF * 2;

    tc.fillStyle = '#465f6a';
    tc.fillRect(x, y, size, size);

    for (let py = -CENTER_CLEAR_HALF; py < CENTER_CLEAR_HALF; py += TILE) {
        for (let px = -CENTER_CLEAR_HALF; px < CENTER_CLEAR_HALF; px += TILE) {
            let h = ((px * 5 + py * 11) >> 4) & 1;
            tc.fillStyle = h ? '#4f6a76' : '#435a65';
            tc.fillRect(half + px, half + py, TILE, TILE);
        }
    }

    tc.strokeStyle = '#b7c7c9';
    tc.lineWidth = 4;
    tc.strokeRect(x + 2, y + 2, size - 4, size - 4);
}

function drawCityBuildings(tc, half) {
    const firstRoad = ROAD_LINES[0];
    const lastRoad = ROAD_LINES[ROAD_LINES.length - 1];

    for (let i = 0; i < ROAD_LINES.length - 1; i++) {
        for (let j = 0; j < ROAD_LINES.length - 1; j++) {
            let x1 = ROAD_LINES[i] + ROAD_HALF + SIDEWALK;
            let y1 = ROAD_LINES[j] + ROAD_HALF + SIDEWALK;
            let x2 = ROAD_LINES[i + 1] - ROAD_HALF - SIDEWALK;
            let y2 = ROAD_LINES[j + 1] - ROAD_HALF - SIDEWALK;
            drawBlock(tc, half, x1, y1, x2, y2, i, j);
        }
    }
    // Outer edge blocks
    for (let i = 0; i < ROAD_LINES.length; i++) {
        let nx = (ROAD_LINES[i+1] !== undefined) ? ROAD_LINES[i+1] : MAP_BOUND;
        // Top
        drawBlock(tc, half, ROAD_LINES[i]+ROAD_HALF+SIDEWALK, -MAP_BOUND+4, nx-ROAD_HALF-SIDEWALK, firstRoad-ROAD_HALF-SIDEWALK, i, 10);
        // Bottom
        drawBlock(tc, half, ROAD_LINES[i]+ROAD_HALF+SIDEWALK, lastRoad+ROAD_HALF+SIDEWALK, nx-ROAD_HALF-SIDEWALK, MAP_BOUND-4, i, 11);
    }
    for (let j = 0; j < ROAD_LINES.length; j++) {
        let ny = (ROAD_LINES[j+1] !== undefined) ? ROAD_LINES[j+1] : MAP_BOUND;
        // Left
        drawBlock(tc, half, -MAP_BOUND+4, ROAD_LINES[j]+ROAD_HALF+SIDEWALK, firstRoad-ROAD_HALF-SIDEWALK, ny-ROAD_HALF-SIDEWALK, 10, j);
        // Right
        drawBlock(tc, half, lastRoad+ROAD_HALF+SIDEWALK, ROAD_LINES[j]+ROAD_HALF+SIDEWALK, MAP_BOUND-4, ny-ROAD_HALF-SIDEWALK, 11, j);
    }
}

function drawBlock(tc, half, x1, y1, x2, y2, bi, bj) {
    if (x2 <= x1 || y2 <= y1) return;
    let blockW = x2 - x1, blockH = y2 - y1;
    if (blockW < 32 || blockH < 32) return;

    let gap = 6;
    let cols = Math.max(1, Math.floor(blockW / 180));
    let rows = Math.max(1, Math.floor(blockH / 180));
            let bw = (blockW - gap * (cols + 1)) / cols;
    let bh = (blockH - gap * (rows + 1)) / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let bx = x1 + gap + c * (bw + gap);
            let by = y1 + gap + r * (bh + gap);
            if (overlapsCenterClearing(bx, by, bx + bw, by + bh, SIDEWALK)) continue;

            let bHash = hash(bi * 100 + c, bj * 100 + r);
            let pal = BLDG_COLORS[bHash % BLDG_COLORS.length];

            let sx = half + bx, sy = half + by;

            // Building rooftop
            tc.fillStyle = pal.top;
            tc.fillRect(sx, sy, bw, bh);

            // Shadow edges
            tc.fillStyle = pal.shade;
            tc.fillRect(sx + bw - 8, sy, 8, bh);
            tc.fillRect(sx, sy + bh - 8, bw, 8);

            // Windows
            tc.fillStyle = pal.win;
            for (let wy = sy + 14; wy < sy + bh - 16; wy += 18) {
                for (let wx = sx + 10; wx < sx + bw - 14; wx += 18) {
                    tc.fillRect(wx, wy, 8, 8);
                }
            }
        }
    }
}

function drawTrack(ctx) {
    buildTrackCanvas();
    let half = TRACK_SIZE / 2;
    ctx.drawImage(trackCanvas, -half, -half);
}

// === OFF-TRACK CHECK ===
function isOffTrack(x, y) {
    if (isInCenterClearing(x, y)) return false;
    for (let r of ROAD_LINES) {
        if (Math.abs(y - r) < ROAD_HALF) return false;
        if (Math.abs(x - r) < ROAD_HALF) return false;
    }
    return true;
}

// === SPRITE INDEX ===
function getSpriteIndex(angle, sc) {
    let na = angle - sc.zeroAngle;
    if (sc.direction === -1) na = -na;
    while (na < 0) na += Math.PI * 2;
    while (na >= Math.PI * 2) na -= Math.PI * 2;
    let idx = Math.round((na / (Math.PI * 2)) * sc.spriteCount);
    return idx % sc.spriteCount;
}

// === HUD UPDATE ===
function updateHUD(speed, targetDir) {
    document.getElementById('speedDisplay').innerText = Math.floor(speed * 8);
    document.getElementById('timeDisplay').innerText = Math.floor(score.time);
    document.getElementById('scoreDisplay').innerText = score.total;

    let driftElem = document.getElementById('driftScoreDisplay');
    let dv = Math.floor(score.currentDrift);
    driftElem.innerText = dv;

    if (dv > 0) {
        document.getElementById('driftScoreContainer').style.transform = 'scale(1.15)';
        document.getElementById('driftScoreContainer').style.color = '#e67e22';
    } else {
        document.getElementById('driftScoreContainer').style.transform = 'scale(1)';
        document.getElementById('driftScoreContainer').style.color = '#f1c40f';
    }

    let ak = [];
    if(keys.w) ak.push('W'); if(keys.a) ak.push('A');
    if(keys.s) ak.push('S'); if(keys.d) ak.push('D');
    if(keys.space) ak.push('SPACE');
    if(Math.abs(touchInput.x) > 0 || Math.abs(touchInput.y) > 0) ak.push('JOY');
    if(touchInput.drift) ak.push('DRIFT');
    document.getElementById('debugKeys').innerText = ak.join(', ') || '-';
    document.getElementById('debugTarget').innerText = `x:${targetDir.x.toFixed(2)} y:${targetDir.y.toFixed(2)}`;
    document.getElementById('debugVel').innerText = `x:${car.vel.x.toFixed(2)} y:${car.vel.y.toFixed(2)}`;
}
