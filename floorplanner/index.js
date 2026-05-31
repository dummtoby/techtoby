// ===================== CONSTANTS =====================
const GRID = 50;            // 50 x 50 cells
const CELL = 40;            // px per cell at zoom = 1
const SUBDIV = 4;           // 4x4 furniture sub-grid per cell
const SUB = 1 / SUBDIV;     // sub-cell size in cell units (0.25)
const WALL_W = 8;           // wall thickness in world px (zoom 1)
const MIN_ZOOM = 0.12, MAX_ZOOM = 4;
const FLOORS = [-1, 0, 1, 2, 3, 4, 5];   // basement .. 5 floors up
const PAPER = '#f6f7fb';
const FLOOR_TEXTURE_SCALE = 0.5;   // <1 makes floor pattern tiles render smaller / denser

const FURNITURE_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b'];
const ROOF_COLORS = ['#f59e0b', '#ef4444', '#6366f1', '#64748b', '#10b981'];
const FLOOR_COLORS = ['#a16207', '#b45309', '#0e7490', '#4d7c0f', '#6366f1', '#9333ea', '#64748b', '#1f2937'];
const MARK_COLORS = ['#1f2937', '#ef4444', '#f59e0b', '#22c55e', '#0ea5e9', '#6366f1', '#ec4899', '#ffffff'];

// ===================== PARKING LOT =====================
// Stalls are 2 cells wide; their length varies by type. Cars enter from the open
// (aisle) end. Lots store an ordered list of stalls that flow into rows — re-ordering
// a stall re-flows all the others (see flowParking / reorderParkingSpot).
const PARKING_SPOTS = {
    small: { name: 'Small', len: 3, color: '#0ea5e9' },   // 2×3 — e.g. Roat 500
    regular: { name: 'Regular', len: 4, color: '#22c55e' },   // 2×4 — most cars
    large: { name: 'Large', len: 5, color: '#f59e0b' },   // 2×5 — e.g. Sterling Sunliner
    xl: { name: 'XL', len: 6, color: '#ef4444' },   // 2×6 — trucks & limos
};
const PARK_STALL_W = 2;     // stall width in cells
const PARK_AISLE = 2;       // drive-aisle width between rows, in cells
const PARK_TYPES = ['small', 'regular', 'large', 'xl'];
// Optional per-stall label icons (Material Symbol ligatures). A stall carries a text
// label OR an icon, never both.
const PARK_LABEL_ICONS = [
    { icon: 'accessible', name: 'Accessible' },
    { icon: 'local_taxi', name: 'Taxi' },
    { icon: 'airport_shuttle', name: 'Limousine' },
    { icon: 'electric_car', name: 'EV charging' },
    { icon: 'local_shipping', name: 'Truck' },
    { icon: 'two_wheeler', name: 'Motorcycle' },
    { icon: 'pregnant_woman', name: 'Expectant' },
    { icon: 'directions_bus', name: 'Bus' },
];

// ===================== MARKING LIBRARY =====================
// Material Symbol ligatures rendered straight onto the canvas. "Text" is a separate
// free-text mark handled by mtype:'text'.
const MARK_LIBRARY = [
    { id: 'arrow_up', name: 'Arrow Up', icon: 'arrow_upward' },
    { id: 'arrow_down', name: 'Arrow Down', icon: 'arrow_downward' },
    { id: 'arrow_left', name: 'Arrow Left', icon: 'arrow_back' },
    { id: 'arrow_right', name: 'Arrow Right', icon: 'arrow_forward' },
    { id: 'fire_exit', name: 'Fire Exit', icon: 'directions_run' },
    { id: 'exit', name: 'Exit', icon: 'meeting_room' },
    { id: 'fire', name: 'Fire', icon: 'local_fire_department' },
    { id: 'extinguisher', name: 'Fire Extinguisher', icon: 'fire_extinguisher' },
    { id: 'no_entry', name: 'No Entry', icon: 'block' },
    { id: 'warning', name: 'Warning', icon: 'warning' },
    { id: 'info', name: 'Information', icon: 'info' },
    { id: 'camera', name: 'Security Camera', icon: 'videocam' },
    { id: 'security', name: 'Security', icon: 'security' },
    { id: 'first_aid', name: 'First Aid', icon: 'medical_services' },
    { id: 'stairs', name: 'Stairs', icon: 'stairs' },
    { id: 'elevator', name: 'Elevator', icon: 'elevator' },
    { id: 'wc', name: 'Restroom', icon: 'wc' },
    { id: 'star', name: 'Point of Interest', icon: 'star' },
];

// ===================== FURNITURE LIBRARY =====================
// Built-in objects. Authored top-down; "@C" is replaced with the chosen colour.
// viewBox is sized w*100 x h*100 so the artwork keeps its aspect ratio.
function fxSvg(w, h, body) {
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w * 100} ${h * 100}'>` +
        `<g fill='@C' fill-opacity='0.16' stroke='@C' stroke-width='5' stroke-linejoin='round' stroke-linecap='round'>${body}</g></svg>`;
}
const FURNITURE_LIBRARY = [
    // Living Room
    { id: 'sofa', name: 'Sofa', category: 'Living Room', w: 3, h: 1.25, svg: fxSvg(3, 1.25, "<rect x='8' y='14' width='284' height='111' rx='18'/><rect x='8' y='14' width='284' height='34' rx='14'/><rect x='8' y='44' width='52' height='81' rx='12'/><rect x='240' y='44' width='52' height='81' rx='12'/><line x1='150' y1='52' x2='150' y2='118'/>") },
    { id: 'armchair', name: 'Armchair', category: 'Living Room', w: 1.25, h: 1.25, svg: fxSvg(1.25, 1.25, "<rect x='10' y='14' width='105' height='111' rx='16'/><rect x='10' y='14' width='105' height='30' rx='12'/><rect x='10' y='40' width='26' height='85' rx='9'/><rect x='89' y='40' width='26' height='85' rx='9'/>") },
    { id: 'coffee_table', name: 'Coffee Table', category: 'Living Room', w: 1.5, h: 1, svg: fxSvg(1.5, 1, "<rect x='14' y='14' width='122' height='72' rx='12'/>") },
    { id: 'tv', name: 'TV Unit', category: 'Living Room', w: 2, h: 0.5, svg: fxSvg(2, 0.5, "<rect x='10' y='12' width='180' height='26' rx='5'/><line x1='40' y1='12' x2='40' y2='38'/><line x1='150' y1='12' x2='150' y2='38'/>") },
    { id: 'rug', name: 'Rug', category: 'Living Room', w: 3, h: 2, svg: fxSvg(3, 2, "<rect x='10' y='10' width='280' height='180' rx='8'/><rect x='30' y='30' width='240' height='140' rx='6' fill-opacity='0.05'/>") },
    { id: 'plant', name: 'Plant', category: 'Living Room', w: 0.75, h: 0.75, svg: fxSvg(0.75, 0.75, "<circle cx='37' cy='37' r='30'/><circle cx='37' cy='37' r='12' fill-opacity='0.05'/>") },
    // Kitchen & Dining
    { id: 'stove', name: 'Stove', category: 'Kitchen & Dining', w: 1, h: 1, svg: fxSvg(1, 1, "<rect x='10' y='10' width='80' height='80' rx='8'/><circle cx='34' cy='34' r='12'/><circle cx='66' cy='34' r='12'/><circle cx='34' cy='66' r='12'/><circle cx='66' cy='66' r='12'/>") },
    { id: 'fridge', name: 'Fridge', category: 'Kitchen & Dining', w: 1, h: 1, svg: fxSvg(1, 1, "<rect x='12' y='10' width='76' height='80' rx='8'/><line x1='12' y1='40' x2='88' y2='40'/><line x1='74' y1='18' x2='74' y2='32'/><line x1='74' y1='52' x2='74' y2='78'/>") },
    { id: 'sink', name: 'Sink', category: 'Kitchen & Dining', w: 1, h: 1, svg: fxSvg(1, 1, "<rect x='10' y='10' width='80' height='80' rx='8'/><rect x='22' y='28' width='56' height='44' rx='8' fill-opacity='0.05'/><circle cx='50' cy='20' r='4'/>") },
    { id: 'counter', name: 'Counter', category: 'Kitchen & Dining', w: 2, h: 1, svg: fxSvg(2, 1, "<rect x='8' y='12' width='184' height='76' rx='8'/>") },
    { id: 'dining_table', name: 'Dining Table', category: 'Kitchen & Dining', w: 2, h: 3, svg: fxSvg(2, 3, "<rect x='28' y='20' width='144' height='260' rx='16'/>") },
    { id: 'chair', name: 'Chair', category: 'Kitchen & Dining', w: 0.5, h: 0.5, svg: fxSvg(0.5, 0.5, "<rect x='8' y='8' width='34' height='34' rx='7'/><line x1='8' y1='18' x2='42' y2='18'/>") },
    // Bathroom
    { id: 'toilet', name: 'Toilet', category: 'Bathroom', w: 0.75, h: 1, svg: fxSvg(0.75, 1, "<rect x='16' y='8' width='43' height='24' rx='6'/><ellipse cx='37' cy='62' rx='28' ry='32'/>") },
    { id: 'bathtub', name: 'Bathtub', category: 'Bathroom', w: 2, h: 1, svg: fxSvg(2, 1, "<rect x='10' y='10' width='180' height='80' rx='22'/><rect x='28' y='26' width='144' height='48' rx='16' fill-opacity='0.05'/><circle cx='176' cy='50' r='4'/>") },
    { id: 'shower', name: 'Shower', category: 'Bathroom', w: 1, h: 1, svg: fxSvg(1, 1, "<rect x='10' y='10' width='80' height='80' rx='8'/><circle cx='50' cy='50' r='6'/><line x1='30' y1='30' x2='32' y2='32'/><line x1='70' y1='30' x2='68' y2='32'/><line x1='30' y1='70' x2='32' y2='68'/><line x1='70' y1='70' x2='68' y2='68'/>") },
    { id: 'bath_sink', name: 'Sink', category: 'Bathroom', w: 0.75, h: 0.75, svg: fxSvg(0.75, 0.75, "<rect x='8' y='8' width='59' height='59' rx='12'/><ellipse cx='37' cy='40' rx='20' ry='16' fill-opacity='0.05'/><circle cx='37' cy='16' r='3'/>") },
    { id: 'washer', name: 'Washer', category: 'Bathroom', w: 1, h: 1, svg: fxSvg(1, 1, "<rect x='10' y='10' width='80' height='80' rx='8'/><circle cx='50' cy='54' r='24'/><circle cx='50' cy='54' r='10' fill-opacity='0.05'/>") },
    // Bedroom
    { id: 'bed_single', name: 'Single Bed', category: 'Bedroom', w: 1.5, h: 2.5, svg: fxSvg(1.5, 2.5, "<rect x='10' y='10' width='130' height='230' rx='12'/><rect x='20' y='20' width='110' height='52' rx='10'/>") },
    { id: 'bed_double', name: 'Double Bed', category: 'Bedroom', w: 2.5, h: 2.5, svg: fxSvg(2.5, 2.5, "<rect x='10' y='10' width='230' height='230' rx='12'/><rect x='24' y='22' width='90' height='52' rx='10'/><rect x='136' y='22' width='90' height='52' rx='10'/>") },
    { id: 'wardrobe', name: 'Wardrobe', category: 'Bedroom', w: 2, h: 0.75, svg: fxSvg(2, 0.75, "<rect x='10' y='8' width='180' height='59' rx='6'/><line x1='100' y1='8' x2='100' y2='67'/>") },
    { id: 'nightstand', name: 'Nightstand', category: 'Bedroom', w: 0.75, h: 0.75, svg: fxSvg(0.75, 0.75, "<rect x='8' y='8' width='59' height='59' rx='8'/><line x1='8' y1='37' x2='67' y2='37'/>") },
    { id: 'dresser', name: 'Dresser', category: 'Bedroom', w: 1.5, h: 0.75, svg: fxSvg(1.5, 0.75, "<rect x='10' y='8' width='130' height='59' rx='6'/><line x1='75' y1='8' x2='75' y2='67'/><line x1='10' y1='37' x2='140' y2='37'/>") },
    // Office
    { id: 'desk', name: 'Desk', category: 'Office', w: 2, h: 1, svg: fxSvg(2, 1, "<rect x='10' y='12' width='180' height='76' rx='8'/><rect x='140' y='20' width='42' height='60' rx='6' fill-opacity='0.05'/>") },
    { id: 'office_chair', name: 'Office Chair', category: 'Office', w: 0.75, h: 0.75, svg: fxSvg(0.75, 0.75, "<circle cx='37' cy='40' r='26'/><rect x='14' y='8' width='46' height='16' rx='8'/>") },
    { id: 'bookshelf', name: 'Bookshelf', category: 'Office', w: 1.5, h: 0.5, svg: fxSvg(1.5, 0.5, "<rect x='10' y='10' width='130' height='30' rx='5'/><line x1='43' y1='10' x2='43' y2='40'/><line x1='75' y1='10' x2='75' y2='40'/><line x1='107' y1='10' x2='107' y2='40'/>") },
    { id: 'filing_cabinet', name: 'Cabinet', category: 'Office', w: 0.75, h: 0.75, svg: fxSvg(0.75, 0.75, "<rect x='10' y='8' width='55' height='59' rx='6'/><line x1='10' y1='30' x2='65' y2='30'/><line x1='10' y1='48' x2='65' y2='48'/>") },
    // Other
    { id: 'staircase', name: 'Staircase', category: 'Other', w: 1, h: 3, svg: fxSvg(1, 3, "<rect x='12' y='10' width='76' height='280' rx='6'/><line x1='12' y1='50' x2='88' y2='50'/><line x1='12' y1='90' x2='88' y2='90'/><line x1='12' y1='130' x2='88' y2='130'/><line x1='12' y1='170' x2='88' y2='170'/><line x1='12' y1='210' x2='88' y2='210'/><line x1='12' y1='250' x2='88' y2='250'/>") },
    { id: 'piano', name: 'Piano', category: 'Other', w: 2, h: 1.5, svg: fxSvg(2, 1.5, "<path d='M14 14 H186 V96 Q186 140 130 140 H14 Z'/><rect x='14' y='14' width='172' height='26'/>") },
    { id: 'pool', name: 'Pool', category: 'Other', w: 4, h: 3, svg: fxSvg(4, 3, "<rect x='12' y='12' width='376' height='276' rx='20'/><rect x='34' y='34' width='332' height='232' rx='14' fill-opacity='0.05'/>") },
    { id: 'fireplace', name: 'Fireplace', category: 'Other', w: 1.5, h: 0.5, svg: fxSvg(1.5, 0.5, "<rect x='10' y='10' width='130' height='30' rx='5'/><rect x='45' y='18' width='60' height='22' rx='4' fill-opacity='0.05'/>") },
];
const FURNITURE_CATEGORIES = ['Living Room', 'Kitchen & Dining', 'Bathroom', 'Bedroom', 'Office', 'Other'];

// ===================== FLOOR PATTERN LIBRARY =====================
// Tileable 100x100 SVGs; "@C" is replaced with the chosen colour. tile = cells per tile.
const FLOOR_PATTERNS = [
    { id: 'wood', name: 'Wood', tile: 1, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='@C' fill-opacity='0.10'/><g stroke='@C' stroke-opacity='0.45' stroke-width='2'><line x1='0' y1='0' x2='100' y2='0'/><line x1='0' y1='25' x2='100' y2='25'/><line x1='0' y1='50' x2='100' y2='50'/><line x1='0' y1='75' x2='100' y2='75'/><line x1='0' y1='100' x2='100' y2='100'/></g><g stroke='@C' stroke-opacity='0.28' stroke-width='1.5'><line x1='42' y1='0' x2='42' y2='25'/><line x1='76' y1='25' x2='76' y2='50'/><line x1='30' y1='50' x2='30' y2='75'/><line x1='64' y1='75' x2='64' y2='100'/></g></svg>` },
    { id: 'tile', name: 'Tile', tile: 1, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='@C' fill-opacity='0.08'/><g stroke='@C' stroke-opacity='0.4' stroke-width='2'><rect x='1' y='1' width='49' height='49'/><rect x='50' y='1' width='49' height='49'/><rect x='1' y='50' width='49' height='49'/><rect x='50' y='50' width='49' height='49'/></g></svg>` },
    { id: 'checker', name: 'Checker', tile: 1, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='@C' fill-opacity='0.06'/><rect x='0' y='0' width='50' height='50' fill='@C' fill-opacity='0.22'/><rect x='50' y='50' width='50' height='50' fill='@C' fill-opacity='0.22'/></svg>` },
    { id: 'brick', name: 'Brick', tile: 1, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='@C' fill-opacity='0.10'/><g stroke='@C' stroke-opacity='0.4' stroke-width='2'><line x1='0' y1='25' x2='100' y2='25'/><line x1='0' y1='50' x2='100' y2='50'/><line x1='0' y1='75' x2='100' y2='75'/><line x1='50' y1='0' x2='50' y2='25'/><line x1='0' y1='25' x2='0' y2='50'/><line x1='100' y1='25' x2='100' y2='50'/><line x1='50' y1='25' x2='50' y2='25'/><line x1='25' y1='25' x2='25' y2='50'/><line x1='75' y1='25' x2='75' y2='50'/><line x1='50' y1='50' x2='50' y2='75'/><line x1='25' y1='75' x2='25' y2='100'/><line x1='75' y1='75' x2='75' y2='100'/><line x1='0' y1='0' x2='50' y2='0'/></g></svg>` },
    { id: 'carpet', name: 'Carpet', tile: 1, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='@C' fill-opacity='0.16'/><g fill='@C' fill-opacity='0.28'><circle cx='25' cy='25' r='3'/><circle cx='75' cy='25' r='3'/><circle cx='25' cy='75' r='3'/><circle cx='75' cy='75' r='3'/><circle cx='50' cy='50' r='3'/></g></svg>` },
    { id: 'diagonal', name: 'Diagonal', tile: 1, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='@C' fill-opacity='0.08'/><g stroke='@C' stroke-opacity='0.35' stroke-width='2'><line x1='0' y1='100' x2='100' y2='0'/><line x1='-50' y1='100' x2='50' y2='0'/><line x1='50' y1='100' x2='150' y2='0'/></g></svg>` },
    { id: 'plain', name: 'Plain', tile: 1, svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='@C' fill-opacity='0.16'/></svg>` },
];

// ===================== STATE =====================
let currentTool = 'select';
let currentFloor = 0;
let zoom = 1, panX = 0, panY = 0;
let showGrid = true, showGhost = true;
let uid = 1;
const nid = () => uid++;

let floorData = {};
FLOORS.forEach(f => floorData[f] = { walls: [], openings: [], roofs: [], furniture: [], floors: [], fences: [], marks: [], parking: [] });

let selected = null;        // { kind, id }
let newItemColor = FURNITURE_COLORS[0];
let newRoofColor = ROOF_COLORS[0];
let currentFurnitureDef = 'sofa';
let placeRot = 0;           // furniture placement rotation (degrees)
let rotateStep = 90;        // rotation increment (90 or 45)
let hoverGrid = null;       // {x,y} grid pos of cursor (for ghost preview)

let floorMode = 'rect';     // floor tool sub-mode: 'rect' | 'poly'
let wallMode = 'line';      // wall tool sub-mode: 'line' | 'box'
let currentPatternId = 'wood';
let newFloorColor = '#a16207';

// Parking tool state — desired stall counts chosen before drawing the lot rectangle
let parkingCounts = { small: 0, regular: 12, large: 0, xl: 0 };
// The individual stall currently selected for labelling: { lotId, spot } or null
let parkSelSpot = null;

// Marking tool state
let markMode = 'icon';            // 'icon' | 'text'
let currentMarkIcon = 'arrow_upward';
let newMarkColor = MARK_COLORS[0];

let undoStack = [], redoStack = [];
let multiSelected = new Set(); // Set of "kind:id" strings for secondary selections
let rectSelState = null;       // {gx0,gy0,gx1,gy1} marquee in progress

// Furniture kinds use a center-rotation model: x,y = top-left of the UNROTATED box,
// w,h = base (unrotated) dimensions, rot = degrees about the centre.

const canvas = document.getElementById('planCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('boardContainer');

function floor() { return floorData[currentFloor]; }
function floorLabel(f) { return f < 0 ? 'Basement' : (f === 0 ? 'Ground Floor' : 'Floor ' + f); }

// ===================== CUSTOM FURNITURE STORE =====================
const FX_STORAGE = 'bbFloorplanFurniture';
function loadCustoms() { try { return JSON.parse(localStorage.getItem(FX_STORAGE) || '[]'); } catch (e) { return []; } }
function saveCustoms(arr) { localStorage.setItem(FX_STORAGE, JSON.stringify(arr)); }
let customDefs = loadCustoms();

function allDefs() { return FURNITURE_LIBRARY.concat(customDefs); }
function getDef(id) { return allDefs().find(d => d.id === id) || null; }

// ===================== FURNITURE IMAGE CACHE =====================
const imgCache = new Map();
function defSvgColored(def, color) {
    let svg = def.svg;
    if (def.recolor !== false) svg = svg.split('@C').join(color || '#6366f1');
    return svg;
}
function getFurnitureImage(def, color) {
    const svg = defSvgColored(def, color);
    if (imgCache.has(svg)) return imgCache.get(svg);
    const img = new Image();
    img.onload = () => draw();
    img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
    imgCache.set(svg, img);
    return img;
}

// ===================== PATTERN STORE =====================
const PAT_STORAGE = 'bbFloorplanPatterns';
function loadPatterns() { try { return JSON.parse(localStorage.getItem(PAT_STORAGE) || '[]'); } catch (e) { return []; } }
function savePatterns(arr) { localStorage.setItem(PAT_STORAGE, JSON.stringify(arr)); }
let customPatterns = loadPatterns();
function allPatterns() { return FLOOR_PATTERNS.concat(customPatterns); }
function getPattern(id) { return allPatterns().find(p => p.id === id) || FLOOR_PATTERNS[0]; }
function getPatternImage(def, color) {
    const svg = defSvgColored(def, color);
    if (imgCache.has(svg)) return imgCache.get(svg);
    const img = new Image();
    img.onload = () => draw();
    img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
    imgCache.set(svg, img);
    return img;
}

// ===================== FURNITURE GEOMETRY (center-rotation) =====================
function rotPt(px, py, cx, cy, deg) {
    const a = deg * Math.PI / 180, co = Math.cos(a), si = Math.sin(a), dx = px - cx, dy = py - cy;
    return { x: cx + dx * co - dy * si, y: cy + dx * si + dy * co };
}
function rotVec(vx, vy, deg) {
    const a = deg * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
    return { x: vx * co - vy * si, y: vx * si + vy * co };
}
function fCenter(f) { return { cx: f.x + f.w / 2, cy: f.y + f.h / 2 }; }
// corners in grid units, order TL,TR,BR,BL (matches CORNER_SIGNS)
const CORNER_SIGNS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
function fCorners(f) {
    const { cx, cy } = fCenter(f);
    return [[f.x, f.y], [f.x + f.w, f.y], [f.x + f.w, f.y + f.h], [f.x, f.y + f.h]]
        .map(([px, py]) => rotPt(px, py, cx, cy, f.rot || 0));
}
function fAABB(f) {
    const c = fCorners(f);
    const xs = c.map(p => p.x), ys = c.map(p => p.y);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}
function fLocal(f, gx, gy) { const { cx, cy } = fCenter(f); return rotPt(gx, gy, cx, cy, -(f.rot || 0)); }

// ===================== COORD HELPERS =====================
const pxPerCell = () => CELL * zoom;
const toGridX = sx => (sx - panX) / pxPerCell();
const toGridY = sy => (sy - panY) / pxPerCell();
const snap = (v, step) => Math.round(v / step) * step;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clampGrid = v => clamp(v, 0, GRID);

function mouseGrid(e) {
    const r = canvas.getBoundingClientRect();
    return { x: toGridX(e.clientX - r.left), y: toGridY(e.clientY - r.top) };
}
function mouseScreen(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function hexToRgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ===================== HISTORY =====================
function pushHistory() {
    undoStack.push({
        floors: JSON.parse(JSON.stringify(floorData)), uid,
        sel: selected ? { ...selected } : null, multi: [...multiSelected]
    });
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
    updateUndoRedoBtns();
}
function _restoreSnap(s) {
    floorData = s.floors; uid = s.uid; selected = s.sel;
    multiSelected = new Set(s.multi || []);
    _validateSel(); renderPropPanel(); draw();
}
function undo() {
    if (action || !undoStack.length) return;
    redoStack.push({
        floors: JSON.parse(JSON.stringify(floorData)), uid,
        sel: selected ? { ...selected } : null, multi: [...multiSelected]
    });
    _restoreSnap(undoStack.pop());
    updateUndoRedoBtns();
}
function redo() {
    if (action || !redoStack.length) return;
    undoStack.push({
        floors: JSON.parse(JSON.stringify(floorData)), uid,
        sel: selected ? { ...selected } : null, multi: [...multiSelected]
    });
    _restoreSnap(redoStack.pop());
    updateUndoRedoBtns();
}
function updateUndoRedoBtns() {
    const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn');
    if (u) u.style.opacity = undoStack.length ? '1' : '0.35';
    if (r) r.style.opacity = redoStack.length ? '1' : '0.35';
}
function _validateSel() {
    if (selected && !getItem(selected)) selected = null;
    const newM = new Set();
    multiSelected.forEach(key => { if (_getItemByKey(key)) newM.add(key); });
    multiSelected = newM;
}
function selKey(kind, id) { return kind + ':' + id; }
function keyParts(key) { const i = key.indexOf(':'); return { kind: key.slice(0, i), id: parseInt(key.slice(i + 1)) }; }
function _getItemByKey(key) { return getItem(keyParts(key)); }
function isItemSel(kind, id) {
    return (selected && selected.kind === kind && selected.id === id) || multiSelected.has(selKey(kind, id));
}

// ===================== RENDERING =====================
function resize() {
    const r = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    draw();
}

function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScene(ctx, { cssW: w, cssH: h, zoom, panX, panY, floor: currentFloor, showGrid, showGhost, selected, interactive: true });
}

function drawScene(c, V) {
    const ppc = CELL * V.zoom;
    const sx = gx => V.panX + gx * ppc;
    const sy = gy => V.panY + gy * ppc;

    c.fillStyle = PAPER;
    c.fillRect(0, 0, V.cssW, V.cssH);

    const minGX = clamp(Math.floor((0 - V.panX) / ppc), 0, GRID);
    const maxGX = clamp(Math.ceil((V.cssW - V.panX) / ppc), 0, GRID);
    const minGY = clamp(Math.floor((0 - V.panY) / ppc), 0, GRID);
    const maxGY = clamp(Math.ceil((V.cssH - V.panY) / ppc), 0, GRID);

    c.fillStyle = '#ffffff';
    c.fillRect(sx(0), sy(0), GRID * ppc, GRID * ppc);

    if (V.showGrid) drawGrid(c, V, ppc, sx, sy, minGX, maxGX, minGY, maxGY);

    c.strokeStyle = 'rgba(99,102,241,0.5)';
    c.lineWidth = 2;
    c.strokeRect(sx(0), sy(0), GRID * ppc, GRID * ppc);

    if (V.showGhost) drawGhostStack(c, V, ppc, sx, sy);

    const F = floorData[V.floor];
    (F.floors || []).forEach(reg => drawFloorRegion(c, V, ppc, sx, sy, reg, V.selected));
    (F.parking || []).forEach(lot => drawParking(c, V, ppc, sx, sy, lot, V.selected));
    F.roofs.forEach(rf => drawRoof(c, V, ppc, sx, sy, rf, V.selected, F.roofs));
    drawRoofMerges(c, V, ppc, sx, sy, F.roofs);
    F.furniture.forEach(ft => drawFurniture(c, V, ppc, sx, sy, ft, V.selected));
    drawWalls(c, V, sx, sy, F.walls, '#3b3f57', V.selected);
    drawFences(c, V, sx, sy, F.fences, V.selected);
    F.openings.forEach(op => drawOpening(c, V, sx, sy, op, V.selected));
    (F.marks || []).forEach(mk => drawMark(c, V, ppc, sx, sy, mk, V.selected));

    if (V.interactive) {
        if (pending) drawPending(c, ppc, sx, sy);
        else if (polyPending) drawPolyPending(c, ppc, sx, sy);
        else drawGhostPreview(c, V, ppc, sx, sy);
        if (currentTool === 'repeater' && repeaterPending) drawRepeaterPreview(c, V, ppc, sx, sy);

        // Multi-selection secondary highlights (items in multiSelected that aren't the primary)
        if (multiSelected.size > 0) {
            multiSelected.forEach(key => {
                const p = keyParts(key);
                if (selected && selected.kind === p.kind && selected.id === p.id) return;
                const arr = floorArrays()[p.kind];
                const item = arr && arr.find(i => i.id === p.id);
                if (!item) return;
                c.strokeStyle = 'rgba(99,102,241,0.6)'; c.lineCap = 'round';
                if (p.kind === 'wall' || p.kind === 'opening') {
                    c.lineWidth = Math.max(2, WALL_W * V.zoom) + 8;
                    c.beginPath(); c.moveTo(sx(item.x1), sy(item.y1)); c.lineTo(sx(item.x2), sy(item.y2)); c.stroke();
                } else if (p.kind === 'furniture') {
                    c.lineWidth = 2; c.setLineDash([5, 3]);
                    const cor = fCorners(item); c.beginPath();
                    cor.forEach((pt, i) => { const X = sx(pt.x), Y = sy(pt.y); i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
                    c.closePath(); c.stroke(); c.setLineDash([]);
                } else if (p.kind === 'floor') {
                    c.lineWidth = 2; c.setLineDash([5, 3]); c.beginPath();
                    item.points.forEach((pt, i) => { const X = sx(pt.x), Y = sy(pt.y); i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
                    c.closePath(); c.stroke(); c.setLineDash([]);
                } else {
                    c.lineWidth = 2; c.setLineDash([5, 3]);
                    c.strokeRect(sx(item.x), sy(item.y), item.w * ppc, item.h * ppc);
                    c.setLineDash([]);
                }
            });
        }

        // Parking stall being dragged to a new slot — ghost at the cursor
        if (action && action.type === 'spotDrag') {
            const sp = action.dragSpot;
            if (sp) {
                const gx = action.dragX - action.offX - sp.w / 2, gy = action.dragY - action.offY - sp.h / 2;
                const col = (PARKING_SPOTS[sp.type] || PARKING_SPOTS.regular).color;
                c.save(); c.globalAlpha = 0.75;
                c.fillStyle = hexToRgba(col, 0.3); c.fillRect(sx(gx), sy(gy), sp.w * ppc, sp.h * ppc);
                c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(sx(gx), sy(gy), sp.w * ppc, sp.h * ppc);
                if (sp.labelIcon || sp.labelText) drawStallLabel(c, sx(gx), sy(gy), sp.w * ppc, sp.h * ppc, col, sp);
                c.restore();
            }
        }

        // Marquee rectangle
        if (rectSelState) {
            const rx = Math.min(rectSelState.gx0, rectSelState.gx1), ry = Math.min(rectSelState.gy0, rectSelState.gy1);
            const rw = Math.abs(rectSelState.gx1 - rectSelState.gx0), rh = Math.abs(rectSelState.gy1 - rectSelState.gy0);
            c.fillStyle = 'rgba(99,102,241,0.06)'; c.fillRect(sx(rx), sy(ry), rw * ppc, rh * ppc);
            c.setLineDash([5, 4]); c.strokeStyle = 'rgba(99,102,241,0.75)'; c.lineWidth = 1.5;
            c.strokeRect(sx(rx), sy(ry), rw * ppc, rh * ppc); c.setLineDash([]);
        }
    }
}

// ===================== GHOST (floors below) =====================
// Shows every floor beneath the current one, faintly, fading with depth.
// An element is hidden when something on a nearer floor occludes it:
//   • it sits under a floor region that exists on a nearer floor (incl. current), or
//   • a same-kind element with a matching footprint exists directly above it.
function ghostKindArr(FD, kind) {
    return { wall: FD.walls, opening: FD.openings, roof: FD.roofs, furniture: FD.furniture, floor: FD.floors, fence: FD.fences, mark: FD.marks, parking: FD.parking }[kind];
}
// Approximate footprint of a marking, in grid cells (centre-anchored).
function markAABB(mk) {
    const s = mk.size || 1;
    if (mk.mtype === 'text') {
        const w = Math.max(0.6, (mk.text || 'Text').length * s * 0.34);
        const h = s * 0.7;
        return { x0: mk.x - w / 2, y0: mk.y - h / 2, x1: mk.x + w / 2, y1: mk.y + h / 2 };
    }
    const h = s * 0.5;
    return { x0: mk.x - h, y0: mk.y - h, x1: mk.x + h, y1: mk.y + h };
}
function elemAABB(kind, it) {
    if (kind === 'mark') return markAABB(it);
    if (kind === 'furniture') return fAABB(it);
    if (kind === 'parking') return parkingAABB(it);
    if (kind === 'roof') return { x0: it.x, y0: it.y, x1: it.x + it.w, y1: it.y + it.h };
    if (kind === 'floor') {
        const xs = it.points.map(p => p.x), ys = it.points.map(p => p.y);
        return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    }
    return { x0: Math.min(it.x1, it.x2), y0: Math.min(it.y1, it.y2), x1: Math.max(it.x1, it.x2), y1: Math.max(it.y1, it.y2) };
}
function elemCenter(kind, it) { const b = elemAABB(kind, it); return { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 }; }
function aabbOverlapRatio(a, b) {
    const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0));
    const iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
    const areaA = Math.max(1e-6, (a.x1 - a.x0) * (a.y1 - a.y0));
    return (ix * iy) / areaA;
}
function segSimilar(a, b) {
    const adx = a.x2 - a.x1, ady = a.y2 - a.y1, alen = Math.hypot(adx, ady) || 1;
    const bdx = b.x2 - b.x1, bdy = b.y2 - b.y1, blen = Math.hypot(bdx, bdy) || 1;
    if (Math.abs(adx * bdy - ady * bdx) / (alen * blen) > 0.12) return false;   // not parallel
    if (distToSeg((b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2, a.x1, a.y1, a.x2, a.y2) > 0.35) return false;
    const ux = adx / alen, uy = ady / alen;
    const p1 = (b.x1 - a.x1) * ux + (b.y1 - a.y1) * uy, p2 = (b.x2 - a.x1) * ux + (b.y2 - a.y1) * uy;
    const lo = Math.max(0, Math.min(p1, p2)), hi = Math.min(alen, Math.max(p1, p2));
    return (hi - lo) > 0.5 * Math.min(alen, blen);
}
function ghostOccluded(kind, item, f, cur) {
    const ctr = elemCenter(kind, item);
    for (let g = f + 1; g <= cur; g++) {
        const FD = floorData[g]; if (!FD) continue;
        if ((FD.floors || []).some(reg => pointInPoly(ctr.x, ctr.y, reg.points))) return true;
    }
    const ab = elemAABB(kind, item);
    for (let g = f + 1; g <= cur; g++) {
        const FD = floorData[g]; if (!FD) continue;
        const arr = ghostKindArr(FD, kind); if (!arr) continue;
        if (kind === 'wall' || kind === 'opening' || kind === 'fence') { if (arr.some(o => segSimilar(item, o))) return true; }
        else { if (arr.some(o => aabbOverlapRatio(ab, elemAABB(kind, o)) > 0.6)) return true; }
    }
    return false;
}
function drawGhostStack(c, V, ppc, sx, sy) {
    const cur = V.floor;
    const belowFloors = FLOORS.filter(f => f < cur).sort((a, b) => a - b);   // farthest first → nearer painted on top
    belowFloors.forEach(f => {
        const FD = floorData[f]; if (!FD) return;
        const depth = cur - f;
        const alpha = Math.max(0.1, 0.32 - (depth - 1) * 0.07);
        c.save();
        c.globalAlpha = alpha;
        (FD.floors || []).forEach(reg => { if (!ghostOccluded('floor', reg, f, cur)) drawFloorRegion(c, V, ppc, sx, sy, reg, null); });
        (FD.parking || []).forEach(lot => { if (!ghostOccluded('parking', lot, f, cur)) drawParking(c, V, ppc, sx, sy, lot, null); });
        (FD.roofs || []).forEach(rf => { if (!ghostOccluded('roof', rf, f, cur)) drawRoof(c, V, ppc, sx, sy, rf, null); });
        (FD.furniture || []).forEach(ft => { if (!ghostOccluded('furniture', ft, f, cur)) drawFurniture(c, V, ppc, sx, sy, ft, null); });
        drawWalls(c, V, sx, sy, FD.walls.filter(w => !ghostOccluded('wall', w, f, cur)), '#94a3b8', null);
        drawFences(c, V, sx, sy, (FD.fences || []).filter(w => !ghostOccluded('fence', w, f, cur)), null);
        (FD.openings || []).forEach(op => { if (!ghostOccluded('opening', op, f, cur)) drawOpening(c, V, sx, sy, op, null); });
        c.restore();
    });
}

function drawGrid(c, V, ppc, sx, sy, minGX, maxGX, minGY, maxGY) {
    if (ppc / SUBDIV > 5) {
        c.strokeStyle = 'rgba(99,102,241,0.06)';
        c.lineWidth = 1;
        c.beginPath();
        for (let i = minGX * SUBDIV; i <= maxGX * SUBDIV; i++) { const x = sx(i * SUB); c.moveTo(x, sy(minGY)); c.lineTo(x, sy(maxGY)); }
        for (let j = minGY * SUBDIV; j <= maxGY * SUBDIV; j++) { const y = sy(j * SUB); c.moveTo(sx(minGX), y); c.lineTo(sx(maxGX), y); }
        c.stroke();
    }
    c.strokeStyle = 'rgba(99,102,241,0.16)';
    c.lineWidth = 1;
    c.beginPath();
    for (let i = minGX; i <= maxGX; i++) { const x = sx(i); c.moveTo(x, sy(minGY)); c.lineTo(x, sy(maxGY)); }
    for (let j = minGY; j <= maxGY; j++) { const y = sy(j); c.moveTo(sx(minGX), y); c.lineTo(sx(maxGX), y); }
    c.stroke();
    c.strokeStyle = 'rgba(99,102,241,0.3)';
    c.beginPath();
    for (let i = minGX; i <= maxGX; i++) { if (i % 5) continue; const x = sx(i); c.moveTo(x, sy(minGY)); c.lineTo(x, sy(maxGY)); }
    for (let j = minGY; j <= maxGY; j++) { if (j % 5) continue; const y = sy(j); c.moveTo(sx(minGX), y); c.lineTo(sx(maxGX), y); }
    c.stroke();
}

function drawWalls(c, V, sx, sy, walls, color, sel) {
    const lw = Math.max(2, WALL_W * V.zoom);
    walls.forEach(w => {
        const isSel = sel && sel.kind === 'wall' && sel.id === w.id;
        if (isSel) {
            c.strokeStyle = 'rgba(99,102,241,0.4)'; c.lineWidth = lw + 8; c.lineCap = 'round';
            c.beginPath(); c.moveTo(sx(w.x1), sy(w.y1)); c.lineTo(sx(w.x2), sy(w.y2)); c.stroke();
        }
        c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round';
        c.beginPath(); c.moveTo(sx(w.x1), sy(w.y1)); c.lineTo(sx(w.x2), sy(w.y2)); c.stroke();
    });
}

function drawOpening(c, V, sx, sy, op, sel) {
    const lw = Math.max(2, WALL_W * V.zoom);
    // Resolve flip: flipHinge swaps which endpoint is the hinge, flipSide flips the opening direction
    let gx1 = op.x1, gy1 = op.y1, gx2 = op.x2, gy2 = op.y2;
    if (op.flipHinge) { [gx1, gy1, gx2, gy2] = [gx2, gy2, gx1, gy1]; }
    const x1 = sx(gx1), y1 = sy(gy1), x2 = sx(gx2), y2 = sy(gy2);
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    let nx = -uy, ny = ux;
    if (op.flipSide) { nx = -nx; ny = -ny; }
    const isPrimary = sel && sel.kind === 'opening' && sel.id === op.id;
    const isSel = isPrimary || multiSelected.has(selKey('opening', op.id));

    c.save();
    c.strokeStyle = PAPER; c.lineWidth = lw + 2; c.lineCap = 'butt';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    c.restore();

    const accent = isSel ? '#6366f1' : (op.type === 'door' ? '#1f2937' : '#0ea5e9');
    if (op.type === 'door') {
        const lx = x1 + nx * len, ly = y1 + ny * len;
        c.strokeStyle = accent; c.lineWidth = Math.max(1.5, 2 * V.zoom); c.lineCap = 'round';
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(lx, ly); c.stroke();
        c.beginPath();
        const a0 = Math.atan2(ny, nx), a1 = Math.atan2(uy, ux);
        c.arc(x1, y1, len, a0, a1, (nx * uy - ny * ux) < 0);
        c.strokeStyle = isSel ? 'rgba(99,102,241,0.9)' : 'rgba(0,0,0,0.35)';
        c.setLineDash([4 * V.zoom, 4 * V.zoom]); c.stroke(); c.setLineDash([]);
    } else {
        const hw = lw / 2;
        c.strokeStyle = accent; c.lineWidth = Math.max(1.2, 1.5 * V.zoom); c.lineCap = 'butt';
        c.beginPath();
        c.moveTo(x1 + nx * hw, y1 + ny * hw); c.lineTo(x2 + nx * hw, y2 + ny * hw);
        c.moveTo(x1 - nx * hw, y1 - ny * hw); c.lineTo(x2 - nx * hw, y2 - ny * hw);
        c.moveTo(x1, y1); c.lineTo(x2, y2);
        c.moveTo(x1 + nx * hw, y1 + ny * hw); c.lineTo(x1 - nx * hw, y1 - ny * hw);
        c.moveTo(x2 + nx * hw, y2 + ny * hw); c.lineTo(x2 - nx * hw, y2 - ny * hw);
        c.stroke();
    }
    // Endpoint handles — shown when this is the primary selected opening (allows move + resize)
    if (isPrimary) {
        const r = Math.max(5, 5 * V.zoom);
        [[sx(op.x1), sy(op.y1)], [sx(op.x2), sy(op.y2)]].forEach(([px, py]) => {
            c.fillStyle = '#fff'; c.strokeStyle = 'rgba(99,102,241,0.95)'; c.lineWidth = 2;
            c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill(); c.stroke();
        });
    }
}

function drawRoof(c, V, ppc, sx, sy, rf, sel, others) {
    const x = sx(rf.x), y = sy(rf.y), w = rf.w * ppc, hgt = rf.h * ppc;
    const col = rf.color || ROOF_COLORS[0];
    const isSel = (sel && sel.kind === 'roof' && sel.id === rf.id) || multiSelected.has(selKey('roof', rf.id));
    // Roofs that overlap this one — their footprint is clipped out of this roof's
    // ridge & outline so colliding roofs read as one continuous roof (see drawRoofMerges).
    const ov = (others || []).filter(o => o.id !== rf.id &&
        Math.min(rf.x + rf.w, o.x + o.w) > Math.max(rf.x, o.x) &&
        Math.min(rf.y + rf.h, o.y + o.h) > Math.max(rf.y, o.y));
    const clipToRoof = () => {
        c.beginPath(); c.rect(x, y, w, hgt);
        ov.forEach(o => c.rect(sx(o.x), sy(o.y), o.w * ppc, o.h * ppc));
        c.clip('evenodd');   // rf minus overlapping roofs
    };
    c.save();
    c.fillStyle = hexToRgba(col, 0.1); c.fillRect(x, y, w, hgt);
    c.beginPath(); c.rect(x, y, w, hgt); c.clip();
    c.strokeStyle = hexToRgba(col, 0.28); c.lineWidth = 1;
    const gap = 14 * V.zoom + 6;
    c.beginPath();
    for (let d = -hgt; d < w; d += gap) { c.moveTo(x + d, y); c.lineTo(x + d + hgt, y + hgt); }
    c.stroke();
    c.restore();
    c.save();
    clipToRoof();
    c.strokeStyle = hexToRgba(col, 0.7); c.lineWidth = Math.max(1.5, 2 * V.zoom);
    c.beginPath();
    if (w >= hgt) { c.moveTo(x, y + hgt / 2); c.lineTo(x + w, y + hgt / 2); }
    else { c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + hgt); }
    c.stroke();
    c.setLineDash([6 * V.zoom, 4 * V.zoom]);
    c.strokeStyle = isSel ? 'rgba(99,102,241,0.9)' : hexToRgba(col, 0.65);
    c.lineWidth = isSel ? 2.5 : 1.5; c.strokeRect(x, y, w, hgt); c.setLineDash([]);
    c.restore();
    if (w > 50 && hgt > 24) {
        c.fillStyle = hexToRgba(col, 0.85);
        c.font = `600 ${Math.max(10, 11 * V.zoom)}px Roboto`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('Roof', x + w / 2, y + (w >= hgt ? hgt / 2 - 12 * V.zoom : 12 * V.zoom));
        c.textAlign = 'start';
    }
    if (isSel) drawHandles(c, x, y, w, hgt);
}

// Where two roofs overlap (e.g. an L-shaped roof made of two rectangles), draw the
// hip/valley diagonals across the shared corner so the ridges turn into one another
// and the join reads as a single continuous roof rather than two crossing boxes.
function drawRoofMerges(c, V, ppc, sx, sy, roofs) {
    for (let i = 0; i < roofs.length; i++) {
        for (let j = i + 1; j < roofs.length; j++) {
            const a = roofs[i], b = roofs[j];
            const ox0 = Math.max(a.x, b.x), oy0 = Math.max(a.y, b.y);
            const ox1 = Math.min(a.x + a.w, b.x + b.w), oy1 = Math.min(a.y + a.h, b.y + b.h);
            if (ox1 <= ox0 || oy1 <= oy0) continue;   // no overlap
            const col = a.color || ROOF_COLORS[0];
            const X0 = sx(ox0), Y0 = sy(oy0), X1 = sx(ox1), Y1 = sy(oy1);
            c.save();
            c.strokeStyle = hexToRgba(col, 0.7); c.lineWidth = Math.max(1.5, 2 * V.zoom); c.lineCap = 'round';
            c.beginPath();
            c.moveTo(X0, Y0); c.lineTo(X1, Y1);   // hip
            c.moveTo(X1, Y0); c.lineTo(X0, Y1);   // valley
            c.stroke();
            c.restore();
        }
    }
}

function drawFurniture(c, V, ppc, sx, sy, ft, sel, ghost) {
    const { cx, cy } = fCenter(ft);
    const scx = sx(cx), scy = sy(cy), w = ft.w * ppc, hgt = ft.h * ppc;
    const rot = ((ft.rot || 0) % 360 + 360) % 360;
    const isSel = (sel && sel.kind === 'furniture' && sel.id === ft.id) || multiSelected.has(selKey('furniture', ft.id));
    const def = getDef(ft.defId);
    c.save();
    if (ghost) c.globalAlpha = 0.5;
    c.translate(scx, scy); c.rotate(rot * Math.PI / 180);
    if (def) {
        const img = getFurnitureImage(def, ft.color);
        if (img.complete && img.naturalWidth) {
            c.drawImage(img, -w / 2, -hgt / 2, w, hgt);
        } else {
            placeholderRect(c, -w / 2, -hgt / 2, w, hgt, ft.color);
        }
    } else {
        placeholderRect(c, -w / 2, -hgt / 2, w, hgt, ft.color);
    }
    c.restore();
    // Label drawn upright over the furniture (screen-aligned for legibility)
    if (ft.label && !ghost) {
        const fs = Math.max(9, 11 * V.zoom);
        c.save();
        c.font = `600 ${fs}px Roboto`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        const tw = c.measureText(ft.label).width;
        c.fillStyle = 'rgba(255,255,255,0.82)';
        roundRect(c, scx - tw / 2 - 5, scy - fs / 2 - 3, tw + 10, fs + 6, 5); c.fill();
        c.fillStyle = 'rgba(31,41,55,0.95)';
        c.fillText(ft.label, scx, scy);
        c.restore();
    }
    if (isSel && !ghost) {
        const cor = fCorners(ft).map(p => ({ x: sx(p.x), y: sy(p.y) }));
        c.strokeStyle = 'rgba(99,102,241,0.95)'; c.lineWidth = 2; c.setLineDash([5, 4]);
        c.beginPath(); cor.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.closePath(); c.stroke();
        c.setLineDash([]);
        c.fillStyle = '#fff'; c.strokeStyle = 'rgba(99,102,241,0.95)'; c.lineWidth = 1.5;
        const hs = 4;
        cor.forEach(p => { c.beginPath(); c.rect(p.x - hs, p.y - hs, hs * 2, hs * 2); c.fill(); c.stroke(); });
    }
}

function drawFloorRegion(c, V, ppc, sx, sy, reg, sel) {
    const pts = reg.points; if (!pts || pts.length < 2) return;
    const isSel = (sel && sel.kind === 'floor' && sel.id === reg.id) || multiSelected.has(selKey('floor', reg.id));
    c.save();
    c.beginPath();
    pts.forEach((p, i) => { const X = sx(p.x), Y = sy(p.y); i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
    c.closePath();
    c.clip();
    // pattern fill
    const def = getPattern(reg.patternId);
    const ab = pts.reduce((a, p) => ({ x0: Math.min(a.x0, p.x), y0: Math.min(a.y0, p.y), x1: Math.max(a.x1, p.x), y1: Math.max(a.y1, p.y) }),
        { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
    let filled = false;
    if (def) {
        const img = getPatternImage(def, reg.color);
        if (img.complete && img.naturalWidth) {
            try {
                const pat = c.createPattern(img, 'repeat');
                const tilePx = (def.tile || 1) * ppc * FLOOR_TEXTURE_SCALE;
                const m = new DOMMatrix();
                m.e = sx(0); m.f = sy(0); m.a = tilePx / img.naturalWidth; m.d = tilePx / img.naturalHeight;
                if (pat.setTransform) pat.setTransform(m);
                c.fillStyle = pat;
                c.fillRect(sx(ab.x0), sy(ab.y0), (ab.x1 - ab.x0) * ppc, (ab.y1 - ab.y0) * ppc);
                filled = true;
            } catch (e) { /* fall through */ }
        }
    }
    if (!filled) {
        c.fillStyle = hexToRgba(reg.color || '#a16207', 0.25);
        c.fillRect(sx(ab.x0), sy(ab.y0), (ab.x1 - ab.x0) * ppc, (ab.y1 - ab.y0) * ppc);
    }
    c.restore();
    // outline
    c.beginPath();
    pts.forEach((p, i) => { const X = sx(p.x), Y = sy(p.y); i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
    c.closePath();
    c.strokeStyle = isSel ? 'rgba(99,102,241,0.95)' : hexToRgba(reg.color || '#a16207', 0.5);
    c.lineWidth = isSel ? 2.5 : 1.5;
    if (isSel) c.setLineDash([6, 4]);
    c.stroke(); c.setLineDash([]);
    if (isSel) {
        c.fillStyle = '#fff'; c.strokeStyle = 'rgba(99,102,241,0.95)'; c.lineWidth = 1.5;
        pts.forEach(p => { c.beginPath(); c.arc(sx(p.x), sy(p.y), 4, 0, Math.PI * 2); c.fill(); c.stroke(); });
    }
    // Room name, centred on the region
    if (reg.name) {
        let cxg = 0, cyg = 0; pts.forEach(p => { cxg += p.x; cyg += p.y; }); cxg /= pts.length; cyg /= pts.length;
        const X = sx(cxg), Y = sy(cyg), fs = Math.max(11, 13 * V.zoom);
        c.save();
        c.font = `600 ${fs}px Roboto`;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineJoin = 'round'; c.lineWidth = Math.max(2.5, fs / 3.5); c.strokeStyle = 'rgba(255,255,255,0.9)';
        c.strokeText(reg.name, X, Y);
        c.fillStyle = 'rgba(31,41,55,0.92)';
        c.fillText(reg.name, X, Y);
        c.restore();
    }
}

// ===================== MARKINGS =====================
function drawMark(c, V, ppc, sx, sy, mk, sel, ghost) {
    const X = sx(mk.x), Y = sy(mk.y);
    const isSel = !ghost && ((sel && sel.kind === 'mark' && sel.id === mk.id) || multiSelected.has(selKey('mark', mk.id)));
    const col = mk.color || MARK_COLORS[0];
    const s = mk.size || 1;
    c.save();
    if (ghost) c.globalAlpha = 0.5;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (mk.mtype === 'text') {
        const fs = Math.max(9, s * ppc * 0.5);
        c.font = `600 ${fs}px Roboto`;
        const txt = mk.text || 'Text';
        const tw = c.measureText(txt).width;
        c.fillStyle = 'rgba(255,255,255,0.85)';
        roundRect(c, X - tw / 2 - 6, Y - fs / 2 - 4, tw + 12, fs + 8, 5); c.fill();
        c.fillStyle = col === '#ffffff' ? '#1f2937' : col;
        c.fillText(txt, X, Y);
    } else {
        const fs = Math.max(12, s * ppc);
        c.translate(X, Y); c.rotate((mk.rot || 0) * Math.PI / 180);
        c.font = `${fs}px "Material Symbols Outlined"`;
        // subtle white halo so dark icons read over any background
        c.lineJoin = 'round'; c.lineWidth = Math.max(2, fs / 12); c.strokeStyle = 'rgba(255,255,255,0.85)';
        c.strokeText(mk.icon || 'star', 0, 0);
        c.fillStyle = col;
        c.fillText(mk.icon || 'star', 0, 0);
    }
    c.restore();
    if (isSel) {
        const b = markAABB(mk);
        c.save();
        c.setLineDash([5, 4]); c.strokeStyle = 'rgba(99,102,241,0.95)'; c.lineWidth = 2;
        c.strokeRect(sx(b.x0) - 3, sy(b.y0) - 3, (b.x1 - b.x0) * ppc + 6, (b.y1 - b.y0) * ppc + 6);
        c.setLineDash([]); c.restore();
    }
}

function placeholderRect(c, x, y, w, h, color) {
    const col = color || '#6366f1';
    const r = Math.min(6, w / 4, h / 4);
    roundRect(c, x, y, w, h, r);
    c.fillStyle = hexToRgba(col, 0.22); c.fill();
    c.strokeStyle = col; c.lineWidth = 1.5; c.stroke();
}

function drawHandles(c, x, y, w, h) {
    c.fillStyle = '#fff'; c.strokeStyle = 'rgba(99,102,241,0.95)'; c.lineWidth = 1.5;
    const hs = 4;
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([px, py]) => {
        c.beginPath(); c.rect(px - hs, py - hs, hs * 2, hs * 2); c.fill(); c.stroke();
    });
}

function roundRect(c, x, y, w, h, r) {
    r = Math.max(0, r);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
}

// ===================== GHOST PREVIEW =====================
function drawGhostPreview(c, V, ppc, sx, sy) {
    if (!hoverGrid) return;
    if (currentTool === 'door' || currentTool === 'window') {
        const seg = computeOpeningTarget(hoverGrid.x, hoverGrid.y);
        if (seg) {
            c.save(); c.globalAlpha = 0.55;
            drawOpening(c, V, sx, sy, { type: currentTool, x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2 }, null);
            c.restore();
        } else {
            c.fillStyle = 'rgba(99,102,241,0.3)';
            c.beginPath(); c.arc(sx(hoverGrid.x), sy(hoverGrid.y), 6, 0, Math.PI * 2); c.fill();
        }
    } else if (currentTool === 'furniture') {
        const p = computeFurniturePlacement(hoverGrid.x, hoverGrid.y);
        drawFurniture(c, V, ppc, sx, sy, { id: -1, defId: currentFurnitureDef, x: p.x, y: p.y, w: p.w, h: p.h, rot: p.rot, color: newItemColor }, null, true);
    } else if (currentTool === 'wall' || currentTool === 'fence' || currentTool === 'parking') {
        ghostDot(c, sx(clampGrid(snap(hoverGrid.x, 1))), sy(clampGrid(snap(hoverGrid.y, 1))));
    } else if (currentTool === 'repeater') {
        ghostDot(c, sx(clampGrid(snap(hoverGrid.x, SUB))), sy(clampGrid(snap(hoverGrid.y, SUB))));
    } else if (currentTool === 'mark') {
        const mx = clampGrid(snap(hoverGrid.x, SUB)), my = clampGrid(snap(hoverGrid.y, SUB));
        drawMark(c, V, ppc, sx, sy, { mtype: markMode, icon: currentMarkIcon, text: 'Text', x: mx, y: my, size: 1, color: newMarkColor }, null, true);
    }
}

// Small dot marking where the next click will snap (wall / fence / repeater placement)
function ghostDot(c, x, y) {
    c.save();
    c.fillStyle = 'rgba(99,102,241,0.85)';
    c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.lineWidth = 2;
    c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill(); c.stroke();
    c.restore();
}

// ===================== PENDING (drag drawing) =====================
let pending = null;     // wallDrag / rect / floorRect
let polyPending = null; // floor polygon in progress: {points:[...], cursor}

function drawPending(c, ppc, sx, sy) {
    if (pending.type === 'wallDrag') {
        const seg = wallDragSegment();
        const lw = Math.max(2, WALL_W * zoom);
        c.strokeStyle = 'rgba(99,102,241,0.85)'; c.lineWidth = lw; c.lineCap = 'round';
        c.beginPath(); c.moveTo(sx(seg.x1), sy(seg.y1)); c.lineTo(sx(seg.x2), sy(seg.y2)); c.stroke();
        c.fillStyle = '#6366f1';
        [[seg.x1, seg.y1], [seg.x2, seg.y2]].forEach(([px, py]) => { c.beginPath(); c.arc(sx(px), sy(py), 4, 0, Math.PI * 2); c.fill(); });
    } else if (pending.type === 'wallBox') {
        const x0 = Math.min(pending.x0, pending.x1), y0 = Math.min(pending.y0, pending.y1);
        const x1 = Math.max(pending.x0, pending.x1), y1 = Math.max(pending.y0, pending.y1);
        const lw = Math.max(2, WALL_W * zoom);
        c.strokeStyle = 'rgba(99,102,241,0.85)'; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath();
        c.moveTo(sx(x0), sy(y0)); c.lineTo(sx(x1), sy(y0)); c.lineTo(sx(x1), sy(y1)); c.lineTo(sx(x0), sy(y1)); c.closePath();
        c.stroke();
        c.fillStyle = '#6366f1';
        [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([px, py]) => { c.beginPath(); c.arc(sx(px), sy(py), 4, 0, Math.PI * 2); c.fill(); });
    } else if (pending.type === 'rect' || pending.type === 'floorRect' || pending.type === 'parkRect') {
        const x = Math.min(pending.x0, pending.x1), y = Math.min(pending.y0, pending.y1);
        const w = Math.abs(pending.x1 - pending.x0), h = Math.abs(pending.y1 - pending.y0);
        c.fillStyle = 'rgba(99,102,241,0.12)'; c.fillRect(sx(x), sy(y), w * ppc, h * ppc);
        c.setLineDash([6, 4]); c.strokeStyle = 'rgba(99,102,241,0.8)'; c.lineWidth = 1.5;
        c.strokeRect(sx(x), sy(y), w * ppc, h * ppc); c.setLineDash([]);
    } else if (pending.type === 'fenceDrag') {
        const seg = wallDragSegment();
        drawFences(c, { zoom }, sx, sy, [{ id: -1, variant: fenceVariant, x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2 }], null);
    }
}

function drawPolyPending(c, ppc, sx, sy) {
    const pts = polyPending.points.slice();
    if (polyPending.cursor) pts.push(polyPending.cursor);
    c.fillStyle = 'rgba(99,102,241,0.1)';
    c.beginPath();
    pts.forEach((p, i) => { const X = sx(p.x), Y = sy(p.y); i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
    if (pts.length >= 3) { c.closePath(); c.fill(); }
    c.setLineDash([6, 4]); c.strokeStyle = 'rgba(99,102,241,0.85)'; c.lineWidth = 1.5;
    c.beginPath();
    pts.forEach((p, i) => { const X = sx(p.x), Y = sy(p.y); i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
    c.stroke(); c.setLineDash([]);
    c.fillStyle = '#6366f1';
    polyPending.points.forEach(p => { c.beginPath(); c.arc(sx(p.x), sy(p.y), 4, 0, Math.PI * 2); c.fill(); });
}

function wallDragSegment() {
    let { x0, y0, x1, y1, lock } = pending;
    if (lock) { // Shift held → constrain to the nearest axis
        if (Math.abs(x1 - x0) >= Math.abs(y1 - y0)) y1 = y0; else x1 = x0;
    }
    return { x1: x0, y1: y0, x2: x1, y2: y1 };
}

// ===================== HIT TESTING =====================
function distToSeg(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
    t = clamp(t, 0, 1);
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function pointInPoly(px, py, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
}

function hitTest(gx, gy) {
    const F = floor();
    const tol = 8 / pxPerCell() + WALL_W / CELL / 2;
    for (let i = (F.marks || []).length - 1; i >= 0; i--) {
        const m = F.marks[i];
        const b = markAABB(m);
        if (gx >= b.x0 && gx <= b.x1 && gy >= b.y0 && gy <= b.y1) return { kind: 'mark', id: m.id };
    }
    for (let i = F.furniture.length - 1; i >= 0; i--) {
        const f = F.furniture[i];
        const lp = fLocal(f, gx, gy);
        if (lp.x >= f.x && lp.x <= f.x + f.w && lp.y >= f.y && lp.y <= f.y + f.h) return { kind: 'furniture', id: f.id };
    }
    for (let i = F.openings.length - 1; i >= 0; i--) {
        const o = F.openings[i];
        if (distToSeg(gx, gy, o.x1, o.y1, o.x2, o.y2) < tol) return { kind: 'opening', id: o.id };
    }
    for (let i = F.walls.length - 1; i >= 0; i--) {
        const w = F.walls[i];
        if (distToSeg(gx, gy, w.x1, w.y1, w.x2, w.y2) < tol) return { kind: 'wall', id: w.id };
    }
    for (let i = (F.fences || []).length - 1; i >= 0; i--) {
        const fc = F.fences[i];
        if (distToSeg(gx, gy, fc.x1, fc.y1, fc.x2, fc.y2) < tol) return { kind: 'fence', id: fc.id };
    }
    for (let i = F.roofs.length - 1; i >= 0; i--) {
        const r = F.roofs[i];
        if (gx >= r.x && gx <= r.x + r.w && gy >= r.y && gy <= r.y + r.h) return { kind: 'roof', id: r.id };
    }
    for (let i = (F.parking || []).length - 1; i >= 0; i--) {
        const lot = F.parking[i];
        if (parkingSpotAt(lot, gx, gy) >= 0) return { kind: 'parking', id: lot.id };
        if (gx >= lot.x && gx <= lot.x + lot.w && gy >= lot.y && gy <= lot.y + lot.h) return { kind: 'parking', id: lot.id };
    }
    for (let i = (F.floors || []).length - 1; i >= 0; i--) {
        const r = F.floors[i];
        if (pointInPoly(gx, gy, r.points)) return { kind: 'floor', id: r.id };
    }
    return null;
}

function floorArrays() {
    const F = floor();
    return { wall: F.walls, opening: F.openings, roof: F.roofs, furniture: F.furniture, floor: F.floors, fence: F.fences, mark: F.marks, parking: F.parking };
}
function getItem(sel) {
    if (!sel) return null;
    const arr = floorArrays()[sel.kind];
    return arr ? (arr.find(i => i.id === sel.id) || null) : null;
}

function nearestWall(gx, gy) {
    const F = floor();
    let best = null, bestD = Infinity;
    F.walls.forEach(w => {
        const d = distToSeg(gx, gy, w.x1, w.y1, w.x2, w.y2);
        if (d < bestD) { bestD = d; best = w; }
    });
    return { wall: best, dist: bestD };
}

// Axis-aligned corner hit test (roofs). Returns index 0..3 [TL,TR,BL,BR] or -1
function resizeCornerAt(item, sx_px, sy_px) {
    const x = panX + item.x * pxPerCell(), y = panY + item.y * pxPerCell();
    const w = item.w * pxPerCell(), h = item.h * pxPerCell();
    const corners = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
    for (let i = 0; i < 4; i++) {
        if (Math.hypot(sx_px - corners[i][0], sy_px - corners[i][1]) < 9) return i;
    }
    return -1;
}
// Rotated corner hit test (furniture). Returns index 0..3 in fCorners order [TL,TR,BR,BL] or -1
function furniCornerAt(item, sx_px, sy_px) {
    const cor = fCorners(item);
    for (let i = 0; i < 4; i++) {
        if (Math.hypot(sx_px - (panX + cor[i].x * pxPerCell()), sy_px - (panY + cor[i].y * pxPerCell())) < 9) return i;
    }
    return -1;
}
// Floor polygon vertex hit test. Returns vertex index or -1
function floorVertexAt(reg, sx_px, sy_px) {
    for (let i = 0; i < reg.points.length; i++) {
        const p = reg.points[i];
        if (Math.hypot(sx_px - (panX + p.x * pxPerCell()), sy_px - (panY + p.y * pxPerCell())) < 9) return i;
    }
    return -1;
}

// ===================== PLACEMENT MATH =====================
function computeOpeningTarget(gx, gy) {
    const { wall, dist } = nearestWall(gx, gy);
    if (!wall || dist > 0.7) return null;
    const dx = wall.x2 - wall.x1, dy = wall.y2 - wall.y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    // Project cursor onto wall axis, snap to sub-grid, clamp so opening fits
    const rawProj = (gx - wall.x1) * ux + (gy - wall.y1) * uy;
    const half = 0.5; // opening is 1 cell long (half = 0.5 each side)
    const proj = clamp(snap(rawProj, SUB), half, len - half);
    const cx = wall.x1 + ux * proj, cy = wall.y1 + uy * proj;
    return { x1: cx - ux * half, y1: cy - uy * half, x2: cx + ux * half, y2: cy + uy * half };
}

// Returns endpoint index (0 = x1/y1, 1 = x2/y2) if screen pos is near that endpoint, else -1
function openingEndpointAt(op, sx_px, sy_px) {
    const hitR = Math.max(9, 5 * zoom);
    const e0x = panX + op.x1 * pxPerCell(), e0y = panY + op.y1 * pxPerCell();
    const e1x = panX + op.x2 * pxPerCell(), e1y = panY + op.y2 * pxPerCell();
    if (Math.hypot(sx_px - e0x, sy_px - e0y) < hitR) return 0;
    if (Math.hypot(sx_px - e1x, sy_px - e1y) < hitR) return 1;
    return -1;
}

// Center-rotation model: always returns base dims w=dW,h=dH plus rot; (x,y)=unrotated box top-left.
function computeFurniturePlacement(gx, gy) {
    const def = getDef(currentFurnitureDef);
    const dW = def ? def.w : 1, dH = def ? def.h : 1;
    let rot = placeRot;

    const { wall, dist } = nearestWall(gx, gy);
    const axis = wall && (wall.x1 === wall.x2 || wall.y1 === wall.y2);
    if (wall && axis && dist < 0.8) {
        if (wall.y1 === wall.y2) { // horizontal wall: footprint dW x dH
            const wy = wall.y1, below = gy >= wy;
            rot = below ? 0 : 180;
            const cx = snap(gx, SUB), cy = below ? wy + dH / 2 : wy - dH / 2;
            return placementFromCenter(cx, cy, dW, dH, rot);
        } else { // vertical wall: footprint dH x dW
            const wx = wall.x1, right = gx >= wx;
            rot = right ? 90 : 270;
            const cy = snap(gy, SUB), cx = right ? wx + dH / 2 : wx - dH / 2;
            return placementFromCenter(cx, cy, dW, dH, rot);
        }
    }
    // free placement on the sub-grid
    const x = clamp(snap(gx - dW / 2, SUB), 0, GRID - dW);
    const y = clamp(snap(gy - dH / 2, SUB), 0, GRID - dH);
    return { x, y, w: dW, h: dH, rot };
}
function placementFromCenter(cx, cy, w, h, rot) {
    return { x: clamp(cx - w / 2, 0, GRID - w), y: clamp(cy - h / 2, 0, GRID - h), w, h, rot };
}

// ===================== POINTER INTERACTION =====================
let action = null;
let spaceDown = false;

// ===================== CONTEXT MENU =====================
let ctxGrid = null;   // grid position where the menu was opened (paste target)
const ctxMenuEl = document.getElementById('contextMenu');

function ctxAddItem(label, icon, handler, opts = {}) {
    const b = document.createElement('button');
    b.className = 'CtxItem' + (opts.danger ? ' danger' : '') + (opts.disabled ? ' disabled' : '');
    b.innerHTML = `<span class="material-symbols-outlined">${icon}</span><span>${label}</span>` + (opts.key ? `<span class="key">${opts.key}</span>` : '');
    if (!opts.disabled) b.onclick = () => { hideContextMenu(); handler(); };
    ctxMenuEl.appendChild(b);
}
function ctxAddSep() { const s = document.createElement('div'); s.className = 'CtxSep'; ctxMenuEl.appendChild(s); }

function showContextMenu(clientX, clientY, mode) {
    ctxMenuEl.innerHTML = '';
    const hasClip = !!(clipboard && clipboard.items.length);
    if (mode === 'object') {
        ctxAddItem('Copy', 'content_copy', () => copySelection(), { key: 'Ctrl+C' });
        ctxAddItem('Paste', 'content_paste', () => pasteClipboard(ctxGrid && ctxGrid.x, ctxGrid && ctxGrid.y), { key: 'Ctrl+V', disabled: !hasClip });
        ctxAddItem('Duplicate', 'control_point_duplicate', () => duplicateSelection());
        ctxAddSep();
        ctxAddItem('Delete', 'delete', () => deleteSelected(), { danger: true, key: 'Del' });
    } else {
        ctxAddItem('Paste', 'content_paste', () => pasteClipboard(ctxGrid && ctxGrid.x, ctxGrid && ctxGrid.y), { key: 'Ctrl+V', disabled: !hasClip });
        ctxAddSep();
        ctxAddItem('Save plan…', 'save', () => openModal('saveLoad'));
        ctxAddItem('Clear floor', 'delete_sweep', () => clearFloor(), { danger: true });
    }
    ctxMenuEl.classList.add('open');
    // keep on-screen
    const mw = ctxMenuEl.offsetWidth, mh = ctxMenuEl.offsetHeight;
    let x = clientX, y = clientY;
    if (x + mw > window.innerWidth - 8) x = window.innerWidth - mw - 8;
    if (y + mh > window.innerHeight - 8) y = window.innerHeight - mh - 8;
    ctxMenuEl.style.left = x + 'px';
    ctxMenuEl.style.top = y + 'px';
}
function hideContextMenu() { ctxMenuEl.classList.remove('open'); }

canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const g = mouseGrid(e);
    ctxGrid = { x: g.x, y: g.y };
    const hit = hitTest(g.x, g.y);
    if (hit) {
        const inSel = (selected && selected.kind === hit.kind && selected.id === hit.id) || multiSelected.has(selKey(hit.kind, hit.id));
        if (!inSel) { multiSelected.clear(); selectItem(hit); draw(); }
        showContextMenu(e.clientX, e.clientY, 'object');
    } else {
        showContextMenu(e.clientX, e.clientY, 'empty');
    }
});
// Dismiss the menu on any outside interaction
document.addEventListener('pointerdown', e => { if (!ctxMenuEl.contains(e.target)) hideContextMenu(); }, true);
window.addEventListener('blur', hideContextMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideContextMenu(); });

canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    const g = mouseGrid(e), s = mouseScreen(e);

    if (e.button === 1 || spaceDown || currentTool === 'pan') {
        action = { type: 'pan', sx: s.x, sy: s.y, px: panX, py: panY };
        canvas.style.cursor = 'grabbing';
        return;
    }
    if (e.button !== 0) return;

    if (currentTool === 'select') {
        const additive = e.shiftKey || e.ctrlKey || e.metaKey;

        // 1. Check opening endpoint handles (resize opening length)
        if (selected && selected.kind === 'opening') {
            const op = getItem(selected);
            if (op) {
                const ep = openingEndpointAt(op, s.x, s.y);
                if (ep >= 0) {
                    pushHistory();
                    action = { type: 'resizeOpening', id: op.id, endpoint: ep };
                    return;
                }
            }
        }

        // 2a. Roof corner resize (axis-aligned)
        if (selected && selected.kind === 'roof') {
            const item = getItem(selected);
            if (item) {
                const corner = resizeCornerAt(item, s.x, s.y);
                if (corner >= 0) {
                    pushHistory();
                    const fixed = [
                        { x: item.x + item.w, y: item.y + item.h },
                        { x: item.x, y: item.y + item.h },
                        { x: item.x + item.w, y: item.y },
                        { x: item.x, y: item.y }
                    ][corner];
                    action = { type: 'resize', kind: 'roof', id: selected.id, fixed };
                    return;
                }
            }
        }
        // 2b. Furniture corner resize (rotated, local-space)
        if (selected && selected.kind === 'furniture') {
            const item = getItem(selected);
            if (item) {
                const corner = furniCornerAt(item, s.x, s.y);
                if (corner >= 0) {
                    pushHistory();
                    const opp = (corner + 2) % 4;
                    const fixedWorld = fCorners(item)[opp];
                    action = {
                        type: 'resizeF', id: selected.id, rot: item.rot || 0,
                        fixedWorld, fx: CORNER_SIGNS[opp][0], fy: CORNER_SIGNS[opp][1]
                    };
                    return;
                }
            }
        }
        // 2c. Floor polygon vertex drag
        if (selected && selected.kind === 'floor') {
            const item = getItem(selected);
            if (item) {
                const vi = floorVertexAt(item, s.x, s.y);
                if (vi >= 0) { pushHistory(); action = { type: 'floorVertex', id: selected.id, vi }; return; }
            }
        }
        // 2d. Parking lot — resize the area (corner) or rearrange a single stall
        if (selected && selected.kind === 'parking') {
            const item = getItem(selected);
            if (item) {
                const corner = resizeCornerAt(item, s.x, s.y);
                if (corner >= 0) {
                    pushHistory();
                    const fixed = [
                        { x: item.x + item.w, y: item.y + item.h },
                        { x: item.x, y: item.y + item.h },
                        { x: item.x + item.w, y: item.y },
                        { x: item.x, y: item.y }
                    ][corner];
                    action = { type: 'resize', kind: 'parking', id: selected.id, fixed };
                    return;
                }
                const si = parkingSpotAt(item, g.x, g.y);
                if (si >= 0) {
                    pushHistory();
                    const sp = item.spots[si];
                    action = {
                        type: 'spotDrag', lotId: item.id, spotIndex: si, dragSpot: sp,
                        origOrder: item.spots.slice(), startGX: g.x, startGY: g.y,
                        dragX: g.x, dragY: g.y, offX: g.x - (sp.x + sp.w / 2), offY: g.y - (sp.y + sp.h / 2)
                    };
                    return;
                }
            }
        }

        // 3. Hit test
        const hit = hitTest(g.x, g.y);
        if (hit) {
            if (additive) {
                // Shift/Ctrl+click: toggle membership in the extended selection
                const k = selKey(hit.kind, hit.id);
                if (selected && selected.kind === hit.kind && selected.id === hit.id) {
                    if (multiSelected.size > 0) {
                        const first = keyParts([...multiSelected][0]);
                        multiSelected.delete(selKey(first.kind, first.id));
                        selectItem(first);
                    } else { selectItem(null); }
                } else if (multiSelected.has(k)) {
                    multiSelected.delete(k);
                } else {
                    if (!selected) selectItem(hit);
                    else multiSelected.add(k);
                }
                draw(); return;
            }

            // Check if the clicked item is already in the extended selection
            const inMulti = multiSelected.size > 0 && multiSelected.has(selKey(hit.kind, hit.id));
            if (!inMulti) { multiSelected.clear(); selectItem(hit); }

            // Build move-items list: selected + all multiSelected
            const toMove = [];
            if (selected) toMove.push(selected);
            multiSelected.forEach(k => toMove.push(keyParts(k)));

            pushHistory();
            action = {
                type: 'move', startGX: g.x, startGY: g.y,
                items: toMove.map(p => ({ sel: p, orig: JSON.parse(JSON.stringify(getItem(p))) })).filter(i => i.orig)
            };
            draw();
        } else {
            // 4. Empty space → start marquee rectangle selection
            if (!additive) { multiSelected.clear(); selectItem(null); }
            rectSelState = { gx0: g.x, gy0: g.y, gx1: g.x, gy1: g.y };
            action = { type: 'rectSel' };
            draw();
        }

    } else if (currentTool === 'wall') {
        pushHistory();
        const p = { x: clampGrid(snap(g.x, 1)), y: clampGrid(snap(g.y, 1)) };
        if (wallMode === 'box') {
            pending = { type: 'wallBox', x0: p.x, y0: p.y, x1: p.x, y1: p.y };
            action = { type: 'wallBox' };
        } else {
            pending = { type: 'wallDrag', x0: p.x, y0: p.y, x1: p.x, y1: p.y, lock: e.shiftKey };
            action = { type: 'wallDrag' };
        }
        draw();
    } else if (currentTool === 'door' || currentTool === 'window') {
        pushHistory();
        placeOpening(currentTool, g.x, g.y);
    } else if (currentTool === 'roof') {
        pushHistory();
        const p = { x: clampGrid(snap(g.x, 1)), y: clampGrid(snap(g.y, 1)) };
        pending = { type: 'rect', kind: 'roof', x0: p.x, y0: p.y, x1: p.x, y1: p.y };
        action = { type: 'rect' };
    } else if (currentTool === 'furniture') {
        pushHistory();
        placeFurniture(g.x, g.y);
    } else if (currentTool === 'floor') {
        if (floorMode === 'rect') {
            pushHistory();
            const p = { x: clampGrid(snap(g.x, 1)), y: clampGrid(snap(g.y, 1)) };
            pending = { type: 'floorRect', x0: p.x, y0: p.y, x1: p.x, y1: p.y };
            action = { type: 'floorRect' };
        } else {
            // polygon: click to add a vertex; click near the first point to close
            const p = { x: clampGrid(snap(g.x, 1)), y: clampGrid(snap(g.y, 1)) };
            if (!polyPending) polyPending = { points: [p], cursor: p };
            else {
                const f0 = polyPending.points[0];
                if (polyPending.points.length >= 3 && Math.hypot(p.x - f0.x, p.y - f0.y) < 0.4) { commitPoly(); }
                else polyPending.points.push(p);
            }
            draw();
        }
    } else if (currentTool === 'fence') {
        pushHistory();
        const p = { x: clampGrid(snap(g.x, 1)), y: clampGrid(snap(g.y, 1)) };
        pending = { type: 'fenceDrag', x0: p.x, y0: p.y, x1: p.x, y1: p.y, lock: e.shiftKey };
        action = { type: 'fenceDrag' };
        draw();
    } else if (currentTool === 'repeater') {
        if (!repeaterDefId) { flashHint('Click “Select Object” to choose what to repeat'); return; }
        const p = { x: clampGrid(snap(g.x, SUB)), y: clampGrid(snap(g.y, SUB)) };
        if (repeaterMode === 'polygon') {
            if (!repeaterPending || repeaterPending.type !== 'poly') repeaterPending = { type: 'poly', points: [p], cursor: p };
            else {
                const f0 = repeaterPending.points[0];
                if (repeaterPending.points.length >= 2 && Math.hypot(p.x - f0.x, p.y - f0.y) < 0.4) { commitRepeater(); }
                else repeaterPending.points.push(p);
            }
            draw();
        } else {
            repeaterPending = { type: (repeaterMode === 'line' ? 'line' : 'rect'), x0: p.x, y0: p.y, x1: p.x, y1: p.y };
            action = { type: 'repeaterDrag' };
            draw();
        }
    } else if (currentTool === 'mark') {
        pushHistory();
        placeMark(g.x, g.y);
    } else if (currentTool === 'parking') {
        pushHistory();
        const p = { x: clampGrid(snap(g.x, 1)), y: clampGrid(snap(g.y, 1)) };
        pending = { type: 'parkRect', x0: p.x, y0: p.y, x1: p.x, y1: p.y };
        action = { type: 'parkRect' };
        draw();
    }
});

canvas.addEventListener('pointermove', e => {
    const g = mouseGrid(e), s = mouseScreen(e);
    hoverGrid = g;
    updateStatus(g);

    if (action && action.type === 'pan') {
        panX = action.px + (s.x - action.sx); panY = action.py + (s.y - action.sy); draw(); return;
    }
    if (action && action.type === 'move') {
        // Step: use SUB for openings and furniture; 1 cell for walls, fences & floors
        const coarse = action.items.some(i => ['wall', 'fence', 'floor', 'parking'].includes(i.sel.kind));
        const step = coarse ? 1 : SUB;
        const dx = snap(g.x - action.startGX, step);
        const dy = snap(g.y - action.startGY, step);
        action.items.forEach(({ sel, orig }) => {
            const item = getItem(sel);
            if (item) moveItem(sel.kind, item, orig, dx, dy);
        });
        draw(); return;
    }
    if (action && action.type === 'resize') {
        const item = getItem(action);
        if (item) {
            const step = 1;
            const cx = clampGrid(snap(g.x, step)), cy = clampGrid(snap(g.y, step));
            const nx = Math.min(action.fixed.x, cx), ny = Math.min(action.fixed.y, cy);
            item.x = nx; item.y = ny;
            item.w = Math.max(step, Math.abs(cx - action.fixed.x));
            item.h = Math.max(step, Math.abs(cy - action.fixed.y));
            if (action.kind === 'parking') flowParking(item);
            renderPropPanel(); draw();
        }
        return;
    }
    if (action && action.type === 'spotDrag') {
        action.dragX = g.x; action.dragY = g.y;
        // Live preview: re-flow the rest of the lot around the dragged stall's drop slot
        const lot = getItem({ kind: 'parking', id: action.lotId });
        if (lot && action.origOrder) {
            lot.spots = action.origOrder.slice();
            const idx = lot.spots.indexOf(action.dragSpot);
            if (idx >= 0) reorderParkingSpot(lot, idx, g.x - action.offX, g.y - action.offY);
        }
        draw(); return;
    }
    if (action && action.type === 'resizeF') {
        const item = getItem({ kind: 'furniture', id: action.id });
        if (item) {
            const P = { x: snap(g.x, SUB), y: snap(g.y, SUB) };
            const lv = rotVec(P.x - action.fixedWorld.x, P.y - action.fixedWorld.y, -action.rot);
            const newW = Math.max(SUB, snap(Math.abs(lv.x), SUB));
            const newH = Math.max(SUB, snap(Math.abs(lv.y), SUB));
            const lvc = rotVec(-action.fx * newW, -action.fy * newH, action.rot);
            const grab = { x: action.fixedWorld.x + lvc.x, y: action.fixedWorld.y + lvc.y };
            const cx = (action.fixedWorld.x + grab.x) / 2, cy = (action.fixedWorld.y + grab.y) / 2;
            item.w = newW; item.h = newH; item.x = cx - newW / 2; item.y = cy - newH / 2;
            renderPropPanel(); draw();
        }
        return;
    }
    if (action && action.type === 'floorVertex') {
        const item = getItem({ kind: 'floor', id: action.id });
        if (item) { item.points[action.vi] = { x: clampGrid(snap(g.x, 1)), y: clampGrid(snap(g.y, 1)) }; draw(); }
        return;
    }
    if (action && action.type === 'floorRect') {
        pending.x1 = clampGrid(snap(g.x, 1)); pending.y1 = clampGrid(snap(g.y, 1)); draw(); return;
    }
    if (action && action.type === 'parkRect' && pending) {
        pending.x1 = clampGrid(snap(g.x, 1)); pending.y1 = clampGrid(snap(g.y, 1)); draw(); return;
    }
    if (action && action.type === 'resizeOpening') {
        const op = getItem({ kind: 'opening', id: action.id });
        if (op) {
            const wdx = op.x2 - op.x1, wdy = op.y2 - op.y1;
            const len = Math.hypot(wdx, wdy) || 1;
            const ux = wdx / len, uy = wdy / len;
            if (action.endpoint === 1) {
                // drag x2/y2, keep x1/y1 fixed
                const t = snap((g.x - op.x1) * ux + (g.y - op.y1) * uy, SUB);
                const newLen = Math.max(SUB, t);
                op.x2 = clampGrid(op.x1 + ux * newLen);
                op.y2 = clampGrid(op.y1 + uy * newLen);
            } else {
                // drag x1/y1, keep x2/y2 fixed
                const bx = -ux, by = -uy;
                const t = snap((g.x - op.x2) * bx + (g.y - op.y2) * by, SUB);
                const newLen = Math.max(SUB, t);
                op.x1 = clampGrid(op.x2 + bx * newLen);
                op.y1 = clampGrid(op.y2 + by * newLen);
            }
            renderPropPanel(); draw();
        }
        return;
    }
    if (action && action.type === 'rectSel' && rectSelState) {
        rectSelState.gx1 = g.x; rectSelState.gy1 = g.y; draw(); return;
    }
    if (action && action.type === 'wallDrag') {
        pending.x1 = clampGrid(snap(g.x, 1)); pending.y1 = clampGrid(snap(g.y, 1));
        pending.lock = e.shiftKey; draw(); return;
    }
    if (action && action.type === 'wallBox') {
        pending.x1 = clampGrid(snap(g.x, 1)); pending.y1 = clampGrid(snap(g.y, 1)); draw(); return;
    }
    if (action && action.type === 'rect' && pending) {
        pending.x1 = clampGrid(snap(g.x, 1)); pending.y1 = clampGrid(snap(g.y, 1)); draw(); return;
    }
    if (action && action.type === 'fenceDrag') {
        pending.x1 = clampGrid(snap(g.x, 1)); pending.y1 = clampGrid(snap(g.y, 1));
        pending.lock = e.shiftKey; draw(); return;
    }
    if (action && action.type === 'repeaterDrag' && repeaterPending) {
        repeaterPending.x1 = clampGrid(snap(g.x, SUB)); repeaterPending.y1 = clampGrid(snap(g.y, SUB)); draw(); return;
    }
    if (currentTool === 'repeater' && repeaterMode === 'polygon' && repeaterPending) {
        repeaterPending.cursor = { x: clampGrid(snap(g.x, SUB)), y: clampGrid(snap(g.y, SUB)) }; draw(); return;
    }
    if (currentTool === 'floor' && floorMode === 'poly' && polyPending) {
        polyPending.cursor = { x: clampGrid(snap(g.x, 1)), y: clampGrid(snap(g.y, 1)) }; draw(); return;
    }
    if (currentTool === 'door' || currentTool === 'window' || currentTool === 'furniture' || currentTool === 'mark' || currentTool === 'parking') draw();
});

canvas.addEventListener('pointerup', () => {
    if (action && action.type === 'wallDrag') commitWall();
    else if (action && action.type === 'wallBox') commitWallBox();
    else if (action && action.type === 'fenceDrag') commitFence();
    else if (action && action.type === 'rect' && pending) commitRect();
    else if (action && action.type === 'floorRect' && pending) commitFloorRect();
    else if (action && action.type === 'repeaterDrag') commitRepeater();
    else if (action && action.type === 'parkRect' && pending) commitParking();
    else if (action && action.type === 'spotDrag') commitSpotDrag();
    else if (action && action.type === 'rectSel') commitRectSel();
    action = null;
    rectSelState = null;
    updateCursor();
});

canvas.addEventListener('dblclick', () => {
    if (currentTool === 'floor' && floorMode === 'poly' && polyPending) commitPoly();
    if (currentTool === 'repeater' && repeaterMode === 'polygon' && repeaterPending) commitRepeater();
});

canvas.addEventListener('pointerleave', () => { hoverGrid = null; if (!action) draw(); });

function moveItem(kind, item, orig, dx, dy) {
    if (kind === 'wall' || kind === 'opening' || kind === 'fence') {
        item.x1 = clampGrid(orig.x1 + dx); item.y1 = clampGrid(orig.y1 + dy);
        item.x2 = clampGrid(orig.x2 + dx); item.y2 = clampGrid(orig.y2 + dy);
    } else if (kind === 'floor') {
        item.points = orig.points.map(p => ({ x: clampGrid(p.x + dx), y: clampGrid(p.y + dy) }));
    } else if (kind === 'mark') {
        item.x = clampGrid(orig.x + dx); item.y = clampGrid(orig.y + dy);
    } else if (kind === 'parking') {
        item.x = clamp(orig.x + dx, 0, GRID - item.w);
        item.y = clamp(orig.y + dy, 0, GRID - item.h);
        flowParking(item);
    } else {
        item.x = clamp(orig.x + dx, 0, GRID - item.w);
        item.y = clamp(orig.y + dy, 0, GRID - item.h);
    }
}

function commitFloorRect() {
    const x0 = Math.min(pending.x0, pending.x1), y0 = Math.min(pending.y0, pending.y1);
    const x1 = Math.max(pending.x0, pending.x1), y1 = Math.max(pending.y0, pending.y1);
    if (x1 - x0 >= 1 && y1 - y0 >= 1) {
        const reg = { id: nid(), kind: 'floor', points: [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }], patternId: currentPatternId, color: newFloorColor };
        floor().floors.push(reg);
        selectItem({ kind: 'floor', id: reg.id });
    } else { undoStack.pop(); updateUndoRedoBtns(); }
    pending = null; draw();
}

function commitPoly() {
    if (!polyPending || polyPending.points.length < 3) { polyPending = null; draw(); return; }
    pushHistory();
    const reg = { id: nid(), kind: 'floor', points: polyPending.points.map(p => ({ x: p.x, y: p.y })), patternId: currentPatternId, color: newFloorColor };
    floor().floors.push(reg);
    polyPending = null;
    selectItem({ kind: 'floor', id: reg.id });
    draw();
}

function commitWall() {
    const seg = wallDragSegment();
    pending = null;
    if (seg.x1 !== seg.x2 || seg.y1 !== seg.y2) {
        floor().walls.push({ id: nid(), x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2 });
    } else { undoStack.pop(); updateUndoRedoBtns(); }
    draw();
}

function commitWallBox() {
    const x0 = Math.min(pending.x0, pending.x1), y0 = Math.min(pending.y0, pending.y1);
    const x1 = Math.max(pending.x0, pending.x1), y1 = Math.max(pending.y0, pending.y1);
    pending = null;
    if (x1 - x0 >= 1 && y1 - y0 >= 1) {
        const W = floor().walls;
        W.push({ id: nid(), x1: x0, y1: y0, x2: x1, y2: y0 }); // top
        W.push({ id: nid(), x1: x1, y1: y0, x2: x1, y2: y1 }); // right
        W.push({ id: nid(), x1: x1, y1: y1, x2: x0, y2: y1 }); // bottom
        W.push({ id: nid(), x1: x0, y1: y1, x2: x0, y2: y0 }); // left
    } else { undoStack.pop(); updateUndoRedoBtns(); }
    draw();
}

function commitRect() {
    const x = Math.min(pending.x0, pending.x1), y = Math.min(pending.y0, pending.y1);
    const w = Math.abs(pending.x1 - pending.x0), h = Math.abs(pending.y1 - pending.y0);
    if (w >= 1 && h >= 1) {
        const rf = { id: nid(), x, y, w, h, color: newRoofColor };
        floor().roofs.push(rf);
        selectItem({ kind: 'roof', id: rf.id });
    } else { undoStack.pop(); updateUndoRedoBtns(); }
    pending = null; draw();
}

function commitParking() {
    const x0 = Math.min(pending.x0, pending.x1), y0 = Math.min(pending.y0, pending.y1);
    const x1 = Math.max(pending.x0, pending.x1), y1 = Math.max(pending.y0, pending.y1);
    pending = null;
    const w = x1 - x0, h = y1 - y0;
    const counts = readParkingCounts();
    const total = counts.small + counts.regular + counts.large + counts.xl;
    if (total === 0) { undoStack.pop(); updateUndoRedoBtns(); flashHint('Set at least one spot count in the toolbar first'); draw(); return; }
    if (w >= PARK_STALL_W && h >= PARKING_SPOTS.small.len) {
        const lot = generateParking(x0, y0, w, h, counts);
        if (!floor().parking) floor().parking = [];
        floor().parking.push(lot);
        selectItem({ kind: 'parking', id: lot.id });
        const avail = lot.orient === 'h' ? lot.h : lot.w;
        if (parkingDepth(lot, lot.orient) > avail + 0.01) flashHint('Some stalls spill past the area — enlarge it or lower the counts');
    } else { undoStack.pop(); updateUndoRedoBtns(); flashHint('Draw a larger area for the parking lot'); }
    draw();
}

function commitSpotDrag() {
    const lot = getItem({ kind: 'parking', id: action.lotId });
    const moved = Math.hypot(action.dragX - action.startGX, action.dragY - action.startGY) > 0.5;
    if (lot && action.origOrder) {
        lot.spots = action.origOrder.slice();   // start from the pre-drag order
        if (moved) {
            const idx = lot.spots.indexOf(action.dragSpot);
            if (idx >= 0) reorderParkingSpot(lot, idx, action.dragX - action.offX, action.dragY - action.offY);
        } else {
            // A click (no real drag) selects this stall so it can be labelled
            undoStack.pop(); updateUndoRedoBtns();
            flowParking(lot);
            parkSelSpot = { lotId: lot.id, spot: action.dragSpot };
            renderPropPanel();
        }
    } else { undoStack.pop(); updateUndoRedoBtns(); }
    draw();
}

function commitRectSel() {
    if (!rectSelState) return;
    const rx0 = Math.min(rectSelState.gx0, rectSelState.gx1), ry0 = Math.min(rectSelState.gy0, rectSelState.gy1);
    const rx1 = Math.max(rectSelState.gx0, rectSelState.gx1), ry1 = Math.max(rectSelState.gy0, rectSelState.gy1);
    if (rx1 - rx0 < 0.05 && ry1 - ry0 < 0.05) { rectSelState = null; draw(); return; }
    const F = floor();
    const hits = [];
    const ptIn = (px, py) => px >= rx0 && px <= rx1 && py >= ry0 && py <= ry1;
    const rIntersects = (ax0, ay0, ax1, ay1) => ax0 < rx1 && ax1 > rx0 && ay0 < ry1 && ay1 > ry0;
    F.walls.forEach(w => { if (ptIn(w.x1, w.y1) || ptIn(w.x2, w.y2)) hits.push({ kind: 'wall', id: w.id }); });
    (F.fences || []).forEach(w => { if (ptIn(w.x1, w.y1) || ptIn(w.x2, w.y2)) hits.push({ kind: 'fence', id: w.id }); });
    F.openings.forEach(o => { if (ptIn(o.x1, o.y1) || ptIn(o.x2, o.y2)) hits.push({ kind: 'opening', id: o.id }); });
    F.roofs.forEach(r => { if (rIntersects(r.x, r.y, r.x + r.w, r.y + r.h)) hits.push({ kind: 'roof', id: r.id }); });
    F.furniture.forEach(f => { const b = fAABB(f); if (rIntersects(b.x0, b.y0, b.x1, b.y1)) hits.push({ kind: 'furniture', id: f.id }); });
    (F.floors || []).forEach(r => { if (r.points.some(p => ptIn(p.x, p.y))) hits.push({ kind: 'floor', id: r.id }); });
    (F.parking || []).forEach(lot => { const b = parkingAABB(lot); if (rIntersects(b.x0, b.y0, b.x1, b.y1)) hits.push({ kind: 'parking', id: lot.id }); });
    (F.marks || []).forEach(m => { const b = markAABB(m); if (rIntersects(b.x0, b.y0, b.x1, b.y1)) hits.push({ kind: 'mark', id: m.id }); });
    if (hits.length === 1) { multiSelected.clear(); selectItem(hits[0]); }
    else if (hits.length > 1) {
        selectItem(hits[0]);
        for (let i = 1; i < hits.length; i++) multiSelected.add(selKey(hits[i].kind, hits[i].id));
    }
    rectSelState = null; draw();
}

function placeFurniture(gx, gy) {
    const p = computeFurniturePlacement(gx, gy);
    const ft = { id: nid(), defId: currentFurnitureDef, x: p.x, y: p.y, w: p.w, h: p.h, rot: p.rot, color: newItemColor, label: '' };
    floor().furniture.push(ft);
    selectItem({ kind: 'furniture', id: ft.id });
    draw();
}

function placeMark(gx, gy) {
    const x = clampGrid(snap(gx, SUB)), y = clampGrid(snap(gy, SUB));
    const mk = { id: nid(), kind: 'mark', mtype: markMode, icon: currentMarkIcon, text: markMode === 'text' ? 'Text' : '', x, y, size: 1, rot: 0, color: newMarkColor };
    floor().marks.push(mk);
    selectItem({ kind: 'mark', id: mk.id });
    if (markMode === 'text') setTimeout(() => { const el = document.getElementById('ppMarkText'); if (el) { el.focus(); el.select(); } }, 0);
    draw();
}

function placeOpening(type, gx, gy) {
    const seg = computeOpeningTarget(gx, gy);
    if (!seg) { undoStack.pop(); updateUndoRedoBtns(); flashHint('Click directly on a wall to place a ' + type); return; }
    const op = { id: nid(), type, x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2, flipHinge: false, flipSide: false };
    floor().openings.push(op);
    selectItem({ kind: 'opening', id: op.id });
    draw();
}

// ===================== SELECTION =====================
function selectItem(sel) {
    // Switching to a brand-new single item clears the multi-set
    if (sel && !(selected && selected.kind === sel.kind && selected.id === sel.id)) {
        multiSelected.clear();
    }
    // Drop any per-stall selection unless we're staying on the same parking lot
    if (parkSelSpot && !(sel && sel.kind === 'parking' && sel.id === parkSelSpot.lotId)) parkSelSpot = null;
    selected = sel;
    renderPropPanel();
}

function renderPropPanel() {
    const panel = document.getElementById('propPanel');
    const labelRow = document.getElementById('ppLabelRow');
    const colorRow = document.getElementById('ppColorRow');
    const rotateRow = document.getElementById('ppRotateRow');
    const flipRow = document.getElementById('ppFlipRow');
    const info = document.getElementById('ppInfo');

    // Multi-selection summary (no primary item)
    if (!selected && multiSelected.size > 0) {
        panel.classList.add('open');
        document.getElementById('ppIcon').textContent = 'select_all';
        document.getElementById('ppTitleText').textContent = multiSelected.size + 1 + ' items';
        labelRow.style.display = 'none'; colorRow.style.display = 'none';
        rotateRow.style.display = 'none'; flipRow.style.display = 'none';
        ['ppNameRow', 'ppMarkTextRow', 'ppSizeRow', 'ppFenceRow', 'ppPatternRow', 'ppParkRow', 'ppParkBtnRow', 'ppStallRow'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        info.textContent = 'Drag to move all • Del to delete all • Esc to deselect';
        return;
    }

    const item = getItem(selected);
    if (!selected || !item) { panel.classList.remove('open'); return; }
    panel.classList.add('open');
    const kind = selected.kind;
    const def = kind === 'furniture' ? getDef(item.defId) : null;
    const titleMap = { wall: 'Wall', opening: item.type, roof: 'Roof', furniture: def ? def.name : 'Furniture', floor: 'Floor', fence: 'Fence', mark: item.mtype === 'text' ? 'Text' : 'Marking', parking: 'Parking Lot' };
    const iconMap = { wall: 'square_foot', door: 'door_open', window: 'window', roof: 'roofing', furniture: 'chair', floor: 'grid_view', fence: 'fence', mark: 'signpost', parking: 'local_parking' };
    document.getElementById('ppTitleText').textContent = titleMap[kind] || kind;
    document.getElementById('ppIcon').textContent = iconMap[kind === 'opening' ? item.type : kind] || 'tune';

    labelRow.style.display = kind === 'furniture' ? 'flex' : 'none';
    if (kind === 'furniture') document.getElementById('ppLabel').value = item.label || '';
    const nameRow = document.getElementById('ppNameRow');
    nameRow.style.display = kind === 'floor' ? 'flex' : 'none';
    if (kind === 'floor') document.getElementById('ppName').value = item.name || '';
    const markTextRow = document.getElementById('ppMarkTextRow');
    const showMarkText = kind === 'mark' && item.mtype === 'text';
    markTextRow.style.display = showMarkText ? 'flex' : 'none';
    if (showMarkText) document.getElementById('ppMarkText').value = item.text || '';
    document.getElementById('ppSizeRow').style.display = kind === 'mark' ? 'flex' : 'none';
    rotateRow.style.display = (kind === 'furniture' || (kind === 'mark' && item.mtype === 'icon')) ? 'flex' : 'none';
    flipRow.style.display = kind === 'opening' ? 'flex' : 'none';

    const fenceRow = document.getElementById('ppFenceRow');
    fenceRow.style.display = kind === 'fence' ? 'flex' : 'none';
    if (kind === 'fence') {
        document.getElementById('ppFencePlain').classList.toggle('primary', item.variant === 'plain');
        document.getElementById('ppFenceMetal').classList.toggle('primary', item.variant === 'metal');
    }

    // Pattern row (floors)
    const patternRow = document.getElementById('ppPatternRow');
    patternRow.style.display = kind === 'floor' ? 'flex' : 'none';
    if (kind === 'floor') {
        const pdef = getPattern(item.patternId);
        document.getElementById('ppPatternName').textContent = pdef.name;
        document.getElementById('ppPatternThumb').src = 'data:image/svg+xml,' + encodeURIComponent(defSvgColored(pdef, item.color));
    }

    // Parking lot rows (stall counts + auto-arrange)
    const parkRow = document.getElementById('ppParkRow');
    const parkBtnRow = document.getElementById('ppParkBtnRow');
    const isPark = kind === 'parking';
    parkRow.style.display = isPark ? 'flex' : 'none';
    parkBtnRow.style.display = isPark ? 'flex' : 'none';
    if (isPark) {
        document.getElementById('ppParkSmall').value = item.counts.small || 0;
        document.getElementById('ppParkRegular').value = item.counts.regular || 0;
        document.getElementById('ppParkLarge').value = item.counts.large || 0;
        document.getElementById('ppParkXL').value = item.counts.xl || 0;
    }
    // Per-stall label editor — only when a single stall of this lot is selected
    const stallRow = document.getElementById('ppStallRow');
    const stall = (isPark && parkSelSpot && parkSelSpot.lotId === item.id && item.spots.includes(parkSelSpot.spot)) ? parkSelSpot.spot : null;
    stallRow.style.display = stall ? 'flex' : 'none';
    if (stall) renderStallLabelEditor(stall);

    const recolorable = (kind === 'furniture' && def && def.recolor !== false) || kind === 'roof' || kind === 'floor' || kind === 'mark';
    if (recolorable) {
        colorRow.style.display = 'flex';
        const palette = kind === 'roof' ? ROOF_COLORS : (kind === 'floor' ? FLOOR_COLORS : (kind === 'mark' ? MARK_COLORS : FURNITURE_COLORS));
        const cont = document.getElementById('ppColors');
        cont.innerHTML = '';
        palette.forEach(col => {
            const sw = document.createElement('div');
            sw.className = 'swatch' + (item.color === col ? ' sel' : '');
            sw.style.background = col;
            sw.onclick = () => {
                item.color = col;
                if (kind === 'roof') newRoofColor = col; else if (kind === 'floor') newFloorColor = col; else if (kind === 'mark') newMarkColor = col; else newItemColor = col;
                renderPropPanel(); draw();
            };
            cont.appendChild(sw);
        });
    } else { colorRow.style.display = 'none'; }

    if (kind === 'furniture' || kind === 'roof')
        info.textContent = `${item.w.toFixed(2)} × ${item.h.toFixed(2)} cells${kind === 'furniture' ? ' • rot ' + (item.rot || 0) + '°' : ''} • drag corners to resize`;
    else if (kind === 'opening')
        info.textContent = `${Math.hypot(item.x2 - item.x1, item.y2 - item.y1).toFixed(2)} cells • drag handles to move/resize`;
    else if (kind === 'floor')
        info.textContent = `${item.points.length} points • drag vertices to reshape`;
    else if (kind === 'fence')
        info.textContent = `${Math.hypot(item.x2 - item.x1, item.y2 - item.y1).toFixed(2)} cells • ${item.variant} fence`;
    else if (kind === 'mark')
        info.textContent = (item.mtype === 'text' ? 'Text label' : 'Icon marking') + ` • size ${(item.size || 1).toFixed(2)}` + (item.mtype === 'icon' ? ' • rot ' + (item.rot || 0) + '°' : '');
    else if (kind === 'parking')
        info.textContent = `${item.spots.length} stalls • drag a stall to move it (others shift aside) • click a stall to label it`;
    else
        info.textContent = `${Math.hypot(item.x2 - item.x1, item.y2 - item.y1).toFixed(2)} cells long`;
}

function updateSelLabel(val) {
    const item = getItem(selected);
    if (item && selected.kind === 'furniture') { item.label = val; draw(); }
}
function updateSelName(val) {
    const item = getItem(selected);
    if (item && selected.kind === 'floor') { item.name = val; draw(); }
}
function updateMarkText(val) {
    const item = getItem(selected);
    if (item && selected.kind === 'mark') { item.text = val; draw(); }
}
function resizeMark(dir) {
    const item = getItem(selected);
    if (!item || selected.kind !== 'mark') return;
    pushHistory();
    item.size = clamp(+(((item.size || 1) + dir * 0.25).toFixed(2)), 0.5, 6);
    renderPropPanel(); draw();
}

function rotateSelected(dir) {
    const item = getItem(selected);
    if (!item) return;
    if (selected.kind === 'furniture' || (selected.kind === 'mark' && item.mtype === 'icon')) {
        pushHistory();
        item.rot = (((item.rot || 0) + dir * rotateStep) % 360 + 360) % 360;
        renderPropPanel(); draw();
    }
}

function rotatePlacement(dir) {
    if (selected && (selected.kind === 'furniture' || selected.kind === 'mark') && currentTool === 'select') { rotateSelected(dir); return; }
    placeRot = (((placeRot + dir * rotateStep) % 360) + 360) % 360;
    draw();
}

function toggleRotateStep() {
    rotateStep = rotateStep === 90 ? 45 : 90;
    placeRot = (((Math.round(placeRot / rotateStep) * rotateStep) % 360) + 360) % 360;
    updateRotateStepBtn(); draw();
}
function updateRotateStepBtn() {
    const b = document.getElementById('rotStepBtn'); if (b) b.textContent = rotateStep + '°';
}

function flipOpening(which) {
    const item = getItem(selected);
    if (!item || selected.kind !== 'opening') return;
    pushHistory();
    if (which === 'hinge') item.flipHinge = !item.flipHinge;
    else item.flipSide = !item.flipSide;
    draw();
}

function deleteSelected() {
    const toDelete = new Set(multiSelected);
    if (selected) toDelete.add(selKey(selected.kind, selected.id));
    if (!toDelete.size) return;
    pushHistory();
    const arrs = floorArrays();
    toDelete.forEach(key => {
        const p = keyParts(key);
        const arr = arrs[p.kind];
        if (arr) { const idx = arr.findIndex(i => i.id === p.id); if (idx >= 0) arr.splice(idx, 1); }
    });
    multiSelected.clear(); selectItem(null); draw();
}

function clearFloor() {
    if (!confirm('Clear everything on ' + floorLabel(currentFloor) + '?')) return;
    pushHistory();
    floorData[currentFloor] = { walls: [], openings: [], roofs: [], furniture: [], floors: [], fences: [], marks: [], parking: [] };
    multiSelected.clear(); selectItem(null); draw();
}

// ===================== COPY / PASTE =====================
let clipboard = null;   // { anchor:{x,y}, items:[{kind, data}] }
const KIND_ARRAY = { wall: 'walls', opening: 'openings', roof: 'roofs', furniture: 'furniture', floor: 'floors', fence: 'fences', mark: 'marks', parking: 'parking' };

function translateItem(kind, it, dx, dy) {
    if (kind === 'wall' || kind === 'opening' || kind === 'fence') {
        it.x1 = clampGrid(it.x1 + dx); it.y1 = clampGrid(it.y1 + dy);
        it.x2 = clampGrid(it.x2 + dx); it.y2 = clampGrid(it.y2 + dy);
    } else if (kind === 'floor') {
        it.points = it.points.map(p => ({ x: clampGrid(p.x + dx), y: clampGrid(p.y + dy) }));
    } else if (kind === 'mark') {
        it.x = clampGrid(it.x + dx); it.y = clampGrid(it.y + dy);
    } else if (kind === 'parking') {
        it.x = clamp(it.x + dx, 0, GRID - it.w); it.y = clamp(it.y + dy, 0, GRID - it.h);
        flowParking(it);
    } else {
        it.x = clamp(it.x + dx, 0, GRID - it.w); it.y = clamp(it.y + dy, 0, GRID - it.h);
    }
}

// Re-snap a pasted door/window onto the nearest wall at its dropped location, keeping its length.
function reSnapOpening(op) {
    const mx = (op.x1 + op.x2) / 2, my = (op.y1 + op.y2) / 2;
    const { wall, dist } = nearestWall(mx, my);
    if (!wall || dist > 0.9) return;
    const dx = wall.x2 - wall.x1, dy = wall.y2 - wall.y1, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const half = (Math.hypot(op.x2 - op.x1, op.y2 - op.y1) || 1) / 2;
    const proj = clamp(snap((mx - wall.x1) * ux + (my - wall.y1) * uy, SUB), half, Math.max(half, len - half));
    const cx = wall.x1 + ux * proj, cy = wall.y1 + uy * proj;
    op.x1 = cx - ux * half; op.y1 = cy - uy * half; op.x2 = cx + ux * half; op.y2 = cy + uy * half;
}

function copySelection() {
    const keys = new Set(multiSelected);
    if (selected) keys.add(selKey(selected.kind, selected.id));
    if (!keys.size) return false;
    const items = [];
    keys.forEach(key => {
        const p = keyParts(key);
        const it = getItem(p);
        if (it) items.push({ kind: p.kind, data: JSON.parse(JSON.stringify(it)) });
    });
    if (!items.length) return false;
    let ax = 0, ay = 0;
    items.forEach(({ kind, data }) => { const c = elemCenter(kind, data); ax += c.x; ay += c.y; });
    clipboard = { anchor: { x: ax / items.length, y: ay / items.length }, items };
    flashHint(items.length + (items.length === 1 ? ' item copied' : ' items copied') + ' — Ctrl+V to paste');
    return true;
}

function pasteClipboard(tx, ty) {
    if (!clipboard || !clipboard.items.length) return;
    pushHistory();
    const F = floor();
    const dx = (tx != null && ty != null) ? tx - clipboard.anchor.x : 1;
    const dy = (tx != null && ty != null) ? ty - clipboard.anchor.y : 1;
    multiSelected.clear(); selectItem(null);
    const newSel = [];
    clipboard.items.forEach(({ kind, data }) => {
        const it = JSON.parse(JSON.stringify(data));
        it.id = nid();
        translateItem(kind, it, dx, dy);
        if (kind === 'opening') reSnapOpening(it);
        F[KIND_ARRAY[kind]].push(it);
        newSel.push({ kind, id: it.id });
    });
    if (newSel.length === 1) selectItem(newSel[0]);
    else if (newSel.length > 1) {
        selectItem(newSel[0]);
        for (let i = 1; i < newSel.length; i++) multiSelected.add(selKey(newSel[i].kind, newSel[i].id));
        renderPropPanel();
    }
    draw();
}

function duplicateSelection() {
    const it = getItem(selected);
    // Furniture → arm the placement tool with this object (per spec)
    if (selected && selected.kind === 'furniture' && it) {
        currentFurnitureDef = it.defId;
        if (it.color) newItemColor = it.color;
        placeRot = it.rot || 0;
        updateFurnitureButton();
        setTool('furniture');
        return;
    }
    if (copySelection()) pasteClipboard(null, null);
}

// ===================== FENCES =====================
let fenceVariant = 'plain';
function setFenceVariant(v) {
    fenceVariant = v;
    document.getElementById('fenceePlainBtn').classList.toggle('active', v === 'plain');
    document.getElementById('fenceMetalBtn').classList.toggle('active', v === 'metal');
    updateHint();
}
function setSelFenceVariant(v) {
    const item = getItem(selected);
    if (item && selected && selected.kind === 'fence') { pushHistory(); item.variant = v; renderPropPanel(); draw(); }
    setFenceVariant(v);
}
function commitFence() {
    const seg = wallDragSegment();
    pending = null;
    if (seg.x1 !== seg.x2 || seg.y1 !== seg.y2) {
        const fc = { id: nid(), kind: 'fence', variant: fenceVariant, x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2 };
        floor().fences.push(fc);
        selectItem({ kind: 'fence', id: fc.id });
    } else { undoStack.pop(); updateUndoRedoBtns(); }
    draw();
}
function drawFences(c, V, sx, sy, fences, sel) {
    (fences || []).forEach(f => {
        const x1 = sx(f.x1), y1 = sy(f.y1), x2 = sx(f.x2), y2 = sy(f.y2);
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
        const isSel = (sel && sel.kind === 'fence' && sel.id === f.id) || multiSelected.has(selKey('fence', f.id));
        if (isSel) {
            c.strokeStyle = 'rgba(99,102,241,0.4)'; c.lineWidth = Math.max(2, 4 * V.zoom) + 8; c.lineCap = 'round';
            c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
        }
        const col = '#6b5b4a';
        if (f.variant === 'metal') {
            const h = 5 * V.zoom + 3;
            c.strokeStyle = col; c.lineWidth = Math.max(1.2, 1.6 * V.zoom); c.lineCap = 'round';
            c.beginPath();
            c.moveTo(x1 + nx * h, y1 + ny * h); c.lineTo(x2 + nx * h, y2 + ny * h);
            c.moveTo(x1 - nx * h, y1 - ny * h); c.lineTo(x2 - nx * h, y2 - ny * h);
            c.stroke();
            const step = 10 * V.zoom + 6;
            c.beginPath();
            for (let d = 0; d + step <= len + 0.01; d += step) {
                const ax = x1 + ux * d, ay = y1 + uy * d, bx = x1 + ux * (d + step), by = y1 + uy * (d + step);
                c.moveTo(ax + nx * h, ay + ny * h); c.lineTo(bx - nx * h, by - ny * h);
                c.moveTo(ax - nx * h, ay - ny * h); c.lineTo(bx + nx * h, by + ny * h);
            }
            c.stroke();
        } else {
            c.strokeStyle = col; c.lineWidth = Math.max(2, 3 * V.zoom); c.lineCap = 'round';
            c.setLineDash([8 * V.zoom + 2, 5 * V.zoom + 2]);
            c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]);
            c.fillStyle = col;
            [[x1, y1], [x2, y2]].forEach(([px, py]) => { c.beginPath(); c.arc(px, py, Math.max(2, 2.2 * V.zoom), 0, Math.PI * 2); c.fill(); });
        }
    });
}

// ===================== REPEATER =====================
let repeaterDefId = null;
let repeaterMode = 'line';     // line | box | rectangle | polygon
let repeaterPending = null;
const REPEATER_MODES = ['line', 'box', 'rectangle', 'polygon'];

function openRepeaterObject() {
    openModal('repeaterObject');
    document.getElementById('rpSearch').value = '';
    renderRepeaterObjects();
    setTimeout(() => { const s = document.getElementById('rpSearch'); if (s) s.focus(); }, 50);
}
function renderRepeaterObjects() {
    const q = (document.getElementById('rpSearch').value || '').toLowerCase().trim();
    const grid = document.getElementById('rpGrid'); grid.innerHTML = '';
    allDefs().filter(d => !q || d.name.toLowerCase().includes(q) || (d.category || '').toLowerCase().includes(q)).forEach(def => {
        const el = document.createElement('div');
        el.className = 'LibItem' + (def.id === repeaterDefId ? ' sel' : '');
        const img = document.createElement('img'); img.src = 'data:image/svg+xml,' + encodeURIComponent(defSvgColored(def, newItemColor));
        const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = def.name;
        el.appendChild(img); el.appendChild(nm);
        el.onclick = () => chooseRepeaterObject(def.id);
        grid.appendChild(el);
    });
    if (!grid.children.length) {
        const n = document.createElement('div'); n.style.cssText = 'grid-column:1/-1;text-align:center;color:rgba(0,0,0,0.4);font-size:13px;padding:10px;'; n.textContent = 'No matching objects.';
        grid.appendChild(n);
    }
}
function chooseRepeaterObject(id) {
    repeaterDefId = id;
    const def = getDef(id);
    document.getElementById('rpName').textContent = def ? def.name : 'Select Object';
    document.getElementById('rpThumb').src = def ? 'data:image/svg+xml,' + encodeURIComponent(defSvgColored(def, newItemColor)) : '';
    document.getElementById('rpModeBtn').style.display = 'inline-flex';
    updateRepeaterModeBtn();
    closeModal('repeaterObject');
    if (currentTool !== 'repeater') setTool('repeater');
    updateHint();
}
function cycleRepeaterMode() {
    repeaterMode = REPEATER_MODES[(REPEATER_MODES.indexOf(repeaterMode) + 1) % REPEATER_MODES.length];
    repeaterPending = null;
    updateRepeaterModeBtn(); updateHint(); draw();
}
function updateRepeaterModeBtn() {
    const b = document.getElementById('rpModeBtn'); if (b) b.textContent = repeaterMode.charAt(0).toUpperCase() + repeaterMode.slice(1);
}
function lineStamps(x0, y0, x1, y1, sp) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), out = [];
    if (len < 1e-6) { out.push({ x: x0, y: y0 }); return out; }
    const ux = dx / len, uy = dy / len, n = Math.max(1, Math.round(len / sp));
    for (let i = 0; i <= n; i++) { const t = i * len / n; out.push({ x: x0 + ux * t, y: y0 + uy * t }); }
    return out;
}
function pushUniqueStamps(out, arr) { arr.forEach(p => { if (!out.some(q => Math.abs(q.x - p.x) < 0.05 && Math.abs(q.y - p.y) < 0.05)) out.push(p); }); }
function repeaterPositions(def, rp = repeaterPending) {
    const out = []; if (!rp) return out;
    const sp = Math.max(0.5, Math.max(def.w, def.h));
    if (rp.type === 'line') return lineStamps(rp.x0, rp.y0, rp.x1, rp.y1, sp);
    if (rp.type === 'rect') {
        const x0 = Math.min(rp.x0, rp.x1), y0 = Math.min(rp.y0, rp.y1), x1 = Math.max(rp.x0, rp.x1), y1 = Math.max(rp.y0, rp.y1);
        if (repeaterMode === 'box') {
            pushUniqueStamps(out, lineStamps(x0, y0, x1, y0, sp));
            pushUniqueStamps(out, lineStamps(x1, y0, x1, y1, sp));
            pushUniqueStamps(out, lineStamps(x1, y1, x0, y1, sp));
            pushUniqueStamps(out, lineStamps(x0, y1, x0, y0, sp));
        } else {
            const w = x1 - x0, h = y1 - y0;
            if (w < 0.1 && h < 0.1) { out.push({ x: x0, y: y0 }); return out; }
            const nx = Math.max(1, Math.round(w / sp)), ny = Math.max(1, Math.round(h / sp));
            const grid = [];
            for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) grid.push({ x: x0 + i * w / nx, y: y0 + j * h / ny });
            pushUniqueStamps(out, grid);
        }
        return out;
    }
    if (rp.type === 'poly') {
        const pts = rp.points; if (pts.length < 2) return out;
        for (let i = 0; i < pts.length; i++) {
            if (i === pts.length - 1 && pts.length < 3) break;
            const a = pts[i], b = pts[(i + 1) % pts.length];
            pushUniqueStamps(out, lineStamps(a.x, a.y, b.x, b.y, sp));
        }
        return out;
    }
    return out;
}
function drawRepeaterPreview(c, V, ppc, sx, sy) {
    const def = getDef(repeaterDefId); if (!def || !repeaterPending) return;
    const rp = repeaterPending;
    c.save();
    c.setLineDash([6, 4]); c.strokeStyle = 'rgba(99,102,241,0.7)'; c.lineWidth = 1.5;
    if (rp.type === 'rect') { c.strokeRect(sx(Math.min(rp.x0, rp.x1)), sy(Math.min(rp.y0, rp.y1)), Math.abs(rp.x1 - rp.x0) * ppc, Math.abs(rp.y1 - rp.y0) * ppc); }
    else if (rp.type === 'line') { c.beginPath(); c.moveTo(sx(rp.x0), sy(rp.y0)); c.lineTo(sx(rp.x1), sy(rp.y1)); c.stroke(); }
    else if (rp.type === 'poly') { const pts = rp.points.slice(); if (rp.cursor) pts.push(rp.cursor); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(sx(p.x), sy(p.y)) : c.moveTo(sx(p.x), sy(p.y))); c.stroke(); }
    c.setLineDash([]); c.restore();
    const previewRp = (rp.type === 'poly' && rp.cursor) ? { type: 'poly', points: rp.points.concat([rp.cursor]) } : rp;
    repeaterPositions(def, previewRp).forEach(pt => {
        const pl = placementFromCenter(pt.x, pt.y, def.w, def.h, 0);
        drawFurniture(c, V, ppc, sx, sy, { id: -1, defId: def.id, x: pl.x, y: pl.y, w: pl.w, h: pl.h, rot: 0, color: newItemColor }, null, true);
    });
}
function commitRepeater() {
    const def = getDef(repeaterDefId);
    if (!def || !repeaterPending) { repeaterPending = null; draw(); return; }
    const positions = repeaterPositions(def);
    repeaterPending = null;
    if (!positions.length) { draw(); return; }
    pushHistory();
    const F = floor(); const newIds = [];
    positions.forEach(pt => {
        const pl = placementFromCenter(pt.x, pt.y, def.w, def.h, 0);
        const ft = { id: nid(), defId: def.id, x: pl.x, y: pl.y, w: pl.w, h: pl.h, rot: 0, color: newItemColor, label: '' };
        F.furniture.push(ft); newIds.push(ft.id);
    });
    multiSelected.clear(); selectItem(null);
    if (newIds.length) {
        selectItem({ kind: 'furniture', id: newIds[0] });
        for (let i = 1; i < newIds.length; i++) multiSelected.add(selKey('furniture', newIds[i]));
        renderPropPanel();
    }
    draw();
}

// ===================== PARKING LOT =====================
// Reads the four stall-count inputs in the toolbar into parkingCounts.
function readParkingCounts() {
    const g = id => { const el = document.getElementById(id); return el ? Math.max(0, Math.floor(+el.value || 0)) : 0; };
    parkingCounts = { small: g('pkSmall'), regular: g('pkRegular'), large: g('pkLarge'), xl: g('pkXL') };
    return parkingCounts;
}

// Build the ordered stall list from desired counts. Sorted short→long so that rows
// stay length-uniform (mixed-length rows only ever occur at a type boundary).
function parkingSpotList(counts) {
    const out = [];
    PARK_TYPES.forEach(t => { const n = Math.max(0, Math.floor(counts[t] || 0)); for (let k = 0; k < n; k++) out.push({ type: t }); });
    return out;
}

// Pack lot.spots into rows for the given orientation and assign each stall x,y,w,h.
// 'h' → rows run along x (stalls 2 wide in x, length in y); 'v' → rows run along y.
function flowParking(lot) {
    const aisle = lot.aisle != null ? lot.aisle : PARK_AISLE;
    const orient = lot.orient || 'h';
    const alongRow = orient === 'h' ? lot.w : lot.h;          // size of the row direction
    const perRow = Math.max(1, Math.floor(alongRow / PARK_STALL_W));
    const spots = lot.spots;
    let v = 0, i = 0;
    while (i < spots.length) {
        const row = spots.slice(i, i + perRow);
        const rowLen = Math.max(...row.map(s => PARKING_SPOTS[s.type].len));
        row.forEach((s, j) => {
            const u = j * PARK_STALL_W, L = PARKING_SPOTS[s.type].len;
            if (orient === 'h') { s.x = lot.x + u; s.y = lot.y + v; s.w = PARK_STALL_W; s.h = L; }
            else { s.x = lot.x + v; s.y = lot.y + u; s.w = L; s.h = PARK_STALL_W; }
        });
        i += row.length;
        v += rowLen + aisle;
    }
}

// Total depth (across-row extent) the current stalls consume for a given orientation.
function parkingDepth(lot, orient) {
    const aisle = lot.aisle != null ? lot.aisle : PARK_AISLE;
    const alongRow = orient === 'h' ? lot.w : lot.h;
    const perRow = Math.max(1, Math.floor(alongRow / PARK_STALL_W));
    const spots = lot.spots;
    let v = 0, i = 0;
    while (i < spots.length) {
        const row = spots.slice(i, i + perRow);
        v += Math.max(...row.map(s => PARKING_SPOTS[s.type].len)) + aisle;
        i += row.length;
    }
    return Math.max(0, v - aisle);
}

// Pick the orientation that packs the stalls into the least depth (best space usage),
// then flow them. Returns the lot.
function repackParking(lot) {
    if (!lot.spots.length) { lot.orient = lot.orient || 'h'; return lot; }
    lot.orient = parkingDepth(lot, 'v') < parkingDepth(lot, 'h') ? 'v' : 'h';
    flowParking(lot);
    return lot;
}

function generateParking(x, y, w, h, counts) {
    const lot = { id: nid(), kind: 'parking', x, y, w, h, counts: { ...counts }, aisle: PARK_AISLE, orient: 'h', spots: parkingSpotList(counts) };
    return repackParking(lot);
}

// Rebuild a lot's stalls from its counts (discards any manual rearranging).
function rebuildParkingSpots(lot) {
    if (parkSelSpot && parkSelSpot.lotId === lot.id) parkSelSpot = null;
    lot.spots = parkingSpotList(lot.counts);
    repackParking(lot);
}

// Bounding box including any stalls that overflow the drawn rectangle.
function parkingAABB(lot) {
    let x0 = lot.x, y0 = lot.y, x1 = lot.x + lot.w, y1 = lot.y + lot.h;
    (lot.spots || []).forEach(s => { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x + s.w); y1 = Math.max(y1, s.y + s.h); });
    return { x0, y0, x1, y1 };
}

// Index of the stall under a grid point (topmost first), or -1.
function parkingSpotAt(lot, gx, gy) {
    for (let i = lot.spots.length - 1; i >= 0; i--) {
        const s = lot.spots[i];
        if (gx >= s.x && gx <= s.x + s.w && gy >= s.y && gy <= s.y + s.h) return i;
    }
    return -1;
}

// Drop the stall at `idx` wherever the cursor is: find the stall nearest the drop
// point, then slot the dragged stall just before/after it (whichever side the cursor
// is on along the row). The stalls in between shift one place toward the gap the
// dragged stall left behind — i.e. they slide left or right, whichever is closest.
function reorderParkingSpot(lot, idx, cx, cy) {
    const spots = lot.spots;
    if (idx < 0 || idx >= spots.length) { flowParking(lot); return; }
    const dragged = spots.splice(idx, 1)[0];
    if (!spots.length) { spots.unshift(dragged); flowParking(lot); return; }
    // Lay out the remaining stalls (gap closed) so we can read their resting centres.
    flowParking(lot);
    const orient = lot.orient || 'h';
    let nearest = 0, nd = Infinity;
    spots.forEach((s, i) => {
        const d = Math.hypot((s.x + s.w / 2) - cx, (s.y + s.h / 2) - cy);
        if (d < nd) { nd = d; nearest = i; }
    });
    const ns = spots[nearest];
    const nc = orient === 'h' ? (ns.x + ns.w / 2) : (ns.y + ns.h / 2);
    const dc = orient === 'h' ? cx : cy;
    let target = clamp(nearest + (dc > nc ? 1 : 0), 0, spots.length);
    spots.splice(target, 0, dragged);
    flowParking(lot);
}

function drawParking(c, V, ppc, sx, sy, lot, sel, ghost) {
    const isSel = !ghost && ((sel && sel.kind === 'parking' && sel.id === lot.id) || multiSelected.has(selKey('parking', lot.id)));
    c.save();
    if (ghost) c.globalAlpha = 0.5;
    // Lot area (asphalt) + dashed boundary
    c.fillStyle = 'rgba(100,116,139,0.07)';
    c.fillRect(sx(lot.x), sy(lot.y), lot.w * ppc, lot.h * ppc);
    c.setLineDash([6, 4]);
    c.strokeStyle = isSel ? 'rgba(99,102,241,0.9)' : 'rgba(100,116,139,0.55)';
    c.lineWidth = isSel ? 2.5 : 1.5;
    c.strokeRect(sx(lot.x), sy(lot.y), lot.w * ppc, lot.h * ppc);
    c.setLineDash([]);
    // Stalls — each is a rectangle with a thicker "wheel-stop" line at the closed end
    const orient = lot.orient || 'h';
    const dragLot = !ghost && action && action.type === 'spotDrag' && action.lotId === lot.id;
    const selSp = (!ghost && parkSelSpot && parkSelSpot.lotId === lot.id) ? parkSelSpot.spot : null;
    lot.spots.forEach(s => {
        if (dragLot && s === action.dragSpot) return;   // shown as the cursor ghost instead
        const col = (PARKING_SPOTS[s.type] || PARKING_SPOTS.regular).color;
        const X = sx(s.x), Y = sy(s.y), W = s.w * ppc, H = s.h * ppc;
        c.fillStyle = hexToRgba(col, 0.14); c.fillRect(X, Y, W, H);
        c.strokeStyle = hexToRgba(col, 0.85); c.lineWidth = Math.max(1, 1.4 * V.zoom);
        c.strokeRect(X, Y, W, H);
        // wheel stop at the closed end (top for 'h', left for 'v')
        c.lineWidth = Math.max(2, 3 * V.zoom);
        c.beginPath();
        if (orient === 'h') { c.moveTo(X, Y); c.lineTo(X + W, Y); }
        else { c.moveTo(X, Y); c.lineTo(X, Y + H); }
        c.stroke();
        // optional per-stall label (text or icon)
        if (!ghost && (s.labelIcon || s.labelText)) drawStallLabel(c, X, Y, W, H, col, s);
        // highlight the stall selected for labelling
        if (s === selSp) {
            c.save();
            c.strokeStyle = 'rgba(99,102,241,0.95)'; c.lineWidth = Math.max(2, 2.5 * V.zoom);
            c.setLineDash([4, 3]); c.strokeRect(X + 1, Y + 1, W - 2, H - 2); c.setLineDash([]);
            c.restore();
        }
    });
    c.restore();
    // Count label at the top-left of the lot
    if (!ghost && lot.w * ppc > 50) {
        const fs = Math.max(10, 11 * V.zoom);
        c.save();
        c.font = `600 ${fs}px Roboto`;
        c.textAlign = 'left'; c.textBaseline = 'bottom';
        c.fillStyle = 'rgba(71,85,105,0.9)';
        c.fillText(lot.spots.length + (lot.spots.length === 1 ? ' spot' : ' spots'), sx(lot.x) + 4, sy(lot.y) - 3);
        c.restore();
    }
    if (isSel) drawHandles(c, sx(lot.x), sy(lot.y), lot.w * ppc, lot.h * ppc);
}

// Draw a stall's label (icon or text) centred, with a white halo for legibility.
function drawStallLabel(c, X, Y, W, H, col, s) {
    c.save();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const cx = X + W / 2, cy = Y + H / 2;
    if (s.labelIcon) {
        const size = Math.max(8, Math.min(W, H) * 0.62);
        c.font = `${size}px "Material Symbols Outlined"`;
        c.lineJoin = 'round'; c.lineWidth = Math.max(2, size / 9); c.strokeStyle = 'rgba(255,255,255,0.9)';
        c.strokeText(s.labelIcon, cx, cy);
        c.fillStyle = col; c.fillText(s.labelIcon, cx, cy);
    } else if (s.labelText) {
        let fs = Math.max(7, Math.min(H * 0.5, W * 0.42));
        c.font = `700 ${fs}px Roboto`;
        const tw = c.measureText(s.labelText).width;
        if (tw > W - 4) { fs = Math.max(6, fs * (W - 4) / tw); c.font = `700 ${fs}px Roboto`; }
        c.lineJoin = 'round'; c.lineWidth = Math.max(2, fs / 4); c.strokeStyle = 'rgba(255,255,255,0.9)';
        c.strokeText(s.labelText, cx, cy);
        c.fillStyle = col; c.fillText(s.labelText, cx, cy);
    }
    c.restore();
}

// Edit one stall count of the selected lot (from the properties panel) and re-pack.
function updateSelParkingCount(type, val) {
    const item = getItem(selected);
    if (!item || !selected || selected.kind !== 'parking') return;
    pushHistory();
    item.counts[type] = Math.max(0, Math.floor(+val || 0));
    rebuildParkingSpots(item);
    renderPropPanel(); draw();
}

// Re-pack the selected lot into the optimal layout (discards manual rearranging).
function autoArrangeSelectedParking() {
    const item = getItem(selected);
    if (!item || !selected || selected.kind !== 'parking') return;
    pushHistory();
    rebuildParkingSpots(item);
    renderPropPanel(); draw();
}

// ----- per-stall labels -----
function curStall() {
    const item = getItem(selected);
    if (!item || selected.kind !== 'parking' || !parkSelSpot || parkSelSpot.lotId !== item.id) return null;
    return item.spots.includes(parkSelSpot.spot) ? parkSelSpot.spot : null;
}
function renderStallLabelEditor(stall) {
    const mode = stall.labelIcon ? 'icon' : (stall.labelText ? 'text' : 'none');
    document.getElementById('ppStallNone').classList.toggle('primary', mode === 'none');
    document.getElementById('ppStallTextBtn').classList.toggle('primary', mode === 'text');
    document.getElementById('ppStallIconBtn').classList.toggle('primary', mode === 'icon');
    const textInput = document.getElementById('ppStallText');
    const iconGrid = document.getElementById('ppStallIcons');
    textInput.style.display = mode === 'text' ? 'block' : 'none';
    iconGrid.style.display = mode === 'icon' ? 'grid' : 'none';
    if (mode === 'text' && document.activeElement !== textInput) textInput.value = stall.labelText || '';
    if (mode === 'icon') {
        iconGrid.innerHTML = '';
        PARK_LABEL_ICONS.forEach(d => {
            const b = document.createElement('button');
            if (stall.labelIcon === d.icon) b.className = 'sel';
            b.title = d.name;
            b.innerHTML = `<span class="material-symbols-outlined">${d.icon}</span>`;
            b.onclick = () => chooseStallIcon(d.icon);
            iconGrid.appendChild(b);
        });
    }
}
function setStallLabelMode(mode) {
    const s = curStall(); if (!s) return;
    pushHistory();
    if (mode === 'none') { s.labelText = ''; s.labelIcon = ''; }
    else if (mode === 'text') { s.labelIcon = ''; }                 // keep any existing text
    else if (mode === 'icon') { s.labelText = ''; if (!s.labelIcon) s.labelIcon = PARK_LABEL_ICONS[0].icon; }
    renderPropPanel(); draw();
    if (mode === 'text') { const el = document.getElementById('ppStallText'); if (el) { el.focus(); el.select(); } }
}
function updateStallText(val) {
    const s = curStall(); if (!s) return;
    s.labelText = val; s.labelIcon = '';
    draw();
}
function chooseStallIcon(icon) {
    const s = curStall(); if (!s) return;
    pushHistory();
    s.labelIcon = icon; s.labelText = '';
    renderPropPanel(); draw();
}

// ===================== TOOLS / VIEW =====================
// ===================== MARKING TOOL UI =====================
function setMarkMode(mode) {
    markMode = mode;
    document.getElementById('markTextBtn').classList.toggle('active', mode === 'text');
    updateMarkButton(); updateHint(); draw();
}
function updateMarkButton() {
    const def = MARK_LIBRARY.find(m => m.icon === currentMarkIcon) || MARK_LIBRARY[0];
    const iconEl = document.getElementById('markCurrentIcon');
    const nameEl = document.getElementById('markCurrentName');
    if (!iconEl || !nameEl) return;
    iconEl.textContent = markMode === 'text' ? 'title' : def.icon;
    nameEl.textContent = markMode === 'text' ? 'Text Label' : def.name;
}
function openMarkLibrary() { openModal('markLibrary'); renderMarkLibrary(); }
function renderMarkLibrary() {
    const grid = document.getElementById('markGrid');
    grid.innerHTML = '';
    MARK_LIBRARY.forEach(def => {
        const el = document.createElement('button');
        el.className = 'MarkItem' + (markMode === 'icon' && currentMarkIcon === def.icon ? ' sel' : '');
        el.title = def.name;
        el.innerHTML = `<span class="material-symbols-outlined">${def.icon}</span><span class="MarkItemName">${def.name}</span>`;
        el.onclick = () => chooseMark(def.icon);
        grid.appendChild(el);
    });
}
function chooseMark(icon) {
    currentMarkIcon = icon; markMode = 'icon';
    document.getElementById('markTextBtn').classList.remove('active');
    updateMarkButton(); closeModal('markLibrary');
    if (currentTool !== 'mark') setTool('mark');
    updateHint(); draw();
}

function setTool(tool) {
    pending = null; action = null; rectSelState = null; polyPending = null; repeaterPending = null;
    multiSelected.clear(); parkSelSpot = null;
    currentTool = tool;
    document.querySelectorAll('.ToolBtn[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    const showWl = tool === 'wall';
    document.getElementById('wallToolbar').style.display = showWl ? 'flex' : 'none';
    document.getElementById('wallDivider').style.display = showWl ? 'block' : 'none';
    const showFx = tool === 'furniture';
    document.getElementById('fxToolbar').style.display = showFx ? 'flex' : 'none';
    document.getElementById('fxDivider').style.display = showFx ? 'block' : 'none';
    const showFl = tool === 'floor';
    document.getElementById('flToolbar').style.display = showFl ? 'flex' : 'none';
    document.getElementById('flDivider').style.display = showFl ? 'block' : 'none';
    const showFn = tool === 'fence';
    document.getElementById('fenceToolbar').style.display = showFn ? 'flex' : 'none';
    document.getElementById('fenceDivider').style.display = showFn ? 'block' : 'none';
    const showRp = tool === 'repeater';
    document.getElementById('rpToolbar').style.display = showRp ? 'flex' : 'none';
    document.getElementById('rpDivider').style.display = showRp ? 'block' : 'none';
    if (showRp) document.getElementById('rpModeBtn').style.display = repeaterDefId ? 'inline-flex' : 'none';
    const showPk = tool === 'parking';
    document.getElementById('pkToolbar').style.display = showPk ? 'flex' : 'none';
    document.getElementById('pkDivider').style.display = showPk ? 'block' : 'none';
    const showMk = tool === 'mark';
    document.getElementById('markToolbar').style.display = showMk ? 'flex' : 'none';
    document.getElementById('markDivider').style.display = showMk ? 'block' : 'none';
    if (tool !== 'select') selectItem(null);
    updateCursor(); updateHint(); draw();
}

function setWallMode(mode) {
    wallMode = mode; pending = null; action = null;
    document.getElementById('wallLineBtn').classList.toggle('active', mode === 'line');
    document.getElementById('wallBoxBtn').classList.toggle('active', mode === 'box');
    updateHint(); draw();
}

function setFloorMode(mode) {
    floorMode = mode; polyPending = null;
    document.getElementById('flRectBtn').classList.toggle('active', mode === 'rect');
    document.getElementById('flPolyBtn').classList.toggle('active', mode === 'poly');
    updateHint(); draw();
}

function updateCursor() {
    canvas.style.cursor = currentTool === 'pan' ? 'grab' : (currentTool === 'select' ? 'default' : 'crosshair');
}

const HINTS = {
    select: 'Click to select • drag to move • drag corners to resize • Del to delete',
    wall: 'Hold and drag to draw a wall at any angle, release to confirm (hold Shift to lock to an axis)',
    door: 'Move over a wall and click to drop a door',
    window: 'Move over a wall and click to drop a window',
    roof: 'Hold and drag a rectangle, release to confirm',
    furniture: 'Click to place • snaps to the 4×4 sub-grid and to walls • Q/E rotate',
    floor: 'Choose a pattern, then draw flooring • Q/E switch shape',
    fence: 'Hold and drag to draw a fence, release to confirm • hold Shift to lock to an axis',
    repeater: 'Choose an object, then stamp it across the canvas',
    parking: 'Set the spot counts in the toolbar, then hold and drag a rectangle to generate the lot',
    mark: 'Click to place a marking • choose an icon or switch to Text • rotate & recolour in the panel',
    pan: 'Drag to pan • scroll to zoom'
};
function updateHint() {
    let h = HINTS[currentTool] || '';
    if (currentTool === 'wall') h = wallMode === 'box'
        ? 'Box: hold and drag a rectangle, release to drop four walls (a room outline)'
        : HINTS.wall;
    if (currentTool === 'floor') h = floorMode === 'poly'
        ? 'Polygon: click each corner, double-click (or click the first point) to finish • Esc to cancel'
        : 'Rectangle: hold and drag flooring, release to confirm';
    if (currentTool === 'repeater') {
        if (!repeaterDefId) h = 'Click “Select Object” to choose what to repeat';
        else if (repeaterMode === 'polygon') h = 'Polygon: click each corner, double-click to stamp objects along the edges • Esc to cancel';
        else if (repeaterMode === 'line') h = 'Line: hold and drag to stamp objects along a line';
        else if (repeaterMode === 'box') h = 'Box: hold and drag a rectangle to stamp objects around its outline';
        else h = 'Rectangle: hold and drag to fill the area with objects';
    }
    document.getElementById('statusHint').textContent = h;
}
let hintTimer = null;
function flashHint(msg) {
    document.getElementById('statusHint').textContent = msg;
    clearTimeout(hintTimer); hintTimer = setTimeout(updateHint, 2200);
}

function changeFloor(delta) {
    const idx = FLOORS.indexOf(currentFloor) + delta;
    if (idx < 0 || idx >= FLOORS.length) return;
    currentFloor = FLOORS[idx];
    pending = null; action = null; rectSelState = null; polyPending = null; repeaterPending = null;
    multiSelected.clear(); selectItem(null); updateFloorUI(); draw();
}

function updateFloorUI() {
    const lbl = floorLabel(currentFloor);
    document.getElementById('floorLabel').textContent = lbl;
    document.getElementById('statusFloor').textContent = lbl;
    const idx = FLOORS.indexOf(currentFloor);
    document.getElementById('floorDownBtn').disabled = idx <= 0;
    document.getElementById('floorUpBtn').disabled = idx >= FLOORS.length - 1;
}

function toggleGrid() { showGrid = !showGrid; document.getElementById('gridToggle').classList.toggle('active', showGrid); draw(); }
function toggleGhost() { showGhost = !showGhost; document.getElementById('ghostToggle').classList.toggle('active', showGhost); draw(); }

function updateStatus(g) {
    document.getElementById('statusCoord').textContent = `${Math.floor(clampGrid(g.x))}, ${Math.floor(clampGrid(g.y))}`;
    document.getElementById('statusZoom').textContent = Math.round(zoom * 100) + '%';
}

// ===================== ZOOM / PAN =====================
function fitView() {
    const r = container.getBoundingClientRect();
    const world = GRID * CELL;
    zoom = clamp(Math.min(r.width / world, r.height / world) * 0.92, MIN_ZOOM, MAX_ZOOM);
    panX = (r.width - world * zoom) / 2;
    panY = (r.height - world * zoom) / 2;
}
function zoomAt(cx, cy, factor) {
    const gx = (cx - panX) / pxPerCell(), gy = (cy - panY) / pxPerCell();
    zoom = clamp(zoom * factor, MIN_ZOOM, MAX_ZOOM);
    panX = cx - gx * pxPerCell(); panY = cy - gy * pxPerCell();
}
function zoomBy(factor) { const r = container.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, factor); draw(); }
canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const s = mouseScreen(e);
    zoomAt(s.x, s.y, e.deltaY < 0 ? 1.1 : 1 / 1.1); draw();
}, { passive: false });

// ===================== KEYBOARD PANNING (WASD + arrows) =====================
const PAN_KEYS = {
    w: { x: 0, y: 1 }, s: { x: 0, y: -1 }, a: { x: 1, y: 0 }, d: { x: -1, y: 0 },
    W: { x: 0, y: 1 }, S: { x: 0, y: -1 }, A: { x: 1, y: 0 }, D: { x: -1, y: 0 },
    ArrowUp: { x: 0, y: 1 }, ArrowDown: { x: 0, y: -1 }, ArrowLeft: { x: 1, y: 0 }, ArrowRight: { x: -1, y: 0 }
};
const panKeys = new Set();
let panRAF = null;
const PAN_SPEED = 16;       // px per frame at 60fps
function startPanLoop() {
    if (panRAF) return;
    const tick = () => {
        let vx = 0, vy = 0;
        panKeys.forEach(key => { const d = PAN_KEYS[key]; if (d) { vx += d.x; vy += d.y; } });
        if (vx === 0 && vy === 0) { panRAF = null; return; }
        panX += vx * PAN_SPEED; panY += vy * PAN_SPEED;
        draw();
        panRAF = requestAnimationFrame(tick);
    };
    panRAF = requestAnimationFrame(tick);
}
function stopPanKeys() { panKeys.clear(); if (panRAF) { cancelAnimationFrame(panRAF); panRAF = null; } }

// ===================== KEYBOARD =====================
document.addEventListener('keydown', e => {
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
    if (document.querySelector('.ModalOverlay.open')) {
        if (e.key === 'Escape') { document.querySelectorAll('.ModalOverlay.open').forEach(m => m.classList.remove('open')); }
        return;
    }
    if (e.code === 'Space') { spaceDown = true; canvas.style.cursor = 'grab'; e.preventDefault(); return; }
    // WASD + arrow keys pan the view (WASD takes priority over tool letters)
    if (!e.ctrlKey && !e.metaKey && !e.altKey && PAN_KEYS[e.key] !== undefined) {
        if (!panKeys.has(e.key)) { panKeys.add(e.key); startPanLoop(); }
        e.preventDefault();
        return;
    }
    const map = { v: 'select', n: 'window', r: 'roof', g: 'floor', f: 'furniture', m: 'mark', p: 'parking', h: 'pan' };
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'c') { e.preventDefault(); copySelection(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'v') { e.preventDefault(); pasteClipboard(hoverGrid ? hoverGrid.x : null, hoverGrid ? hoverGrid.y : null); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'a') {
        e.preventDefault();
        const F = floor();
        multiSelected.clear(); selectItem(null);
        F.walls.forEach(i => multiSelected.add(selKey('wall', i.id)));
        (F.fences || []).forEach(i => multiSelected.add(selKey('fence', i.id)));
        F.openings.forEach(i => multiSelected.add(selKey('opening', i.id)));
        F.roofs.forEach(i => multiSelected.add(selKey('roof', i.id)));
        F.furniture.forEach(i => multiSelected.add(selKey('furniture', i.id)));
        (F.floors || []).forEach(i => multiSelected.add(selKey('floor', i.id)));
        (F.parking || []).forEach(i => multiSelected.add(selKey('parking', i.id)));
        (F.marks || []).forEach(i => multiSelected.add(selKey('mark', i.id)));
        renderPropPanel(); draw(); return;
    }
    if (k === 'q' || k === 'e') {
        if (currentTool === 'floor') setFloorMode(floorMode === 'rect' ? 'poly' : 'rect');
        else rotatePlacement(k === 'q' ? -1 : 1);
        return;
    }
    if (e.key === 'Enter' && currentTool === 'floor' && polyPending) { commitPoly(); return; }
    if (map[k] && !e.ctrlKey && !e.metaKey) { setTool(map[k]); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
    if (e.key === 'Escape') {
        pending = null; action = null; rectSelState = null; polyPending = null; repeaterPending = null;
        multiSelected.clear(); selectItem(null); draw();
    }
    if (e.key === 'PageUp') { changeFloor(1); e.preventDefault(); }
    if (e.key === 'PageDown') { changeFloor(-1); e.preventDefault(); }
});
document.addEventListener('keyup', e => {
    if (e.code === 'Space') { spaceDown = false; updateCursor(); }
    if (PAN_KEYS[e.key] !== undefined) panKeys.delete(e.key);
});
// Stop panning if focus leaves the window (avoids "stuck" keys)
window.addEventListener('blur', stopPanKeys);

// ===================== FURNITURE LIBRARY UI =====================
let libActiveCat = FURNITURE_CATEGORIES[0];

function updateFurnitureButton() {
    const def = getDef(currentFurnitureDef) || FURNITURE_LIBRARY[0];
    document.getElementById('fxCurrentName').textContent = def.name;
    const img = document.getElementById('fxCurrentThumb');
    img.src = 'data:image/svg+xml,' + encodeURIComponent(defSvgColored(def, newItemColor));
}

function openFurnitureLibrary() { openModal('furnitureLibrary'); renderLibrary(); }

function renderLibrary() {
    const tabs = document.getElementById('libTabs');
    const cats = FURNITURE_CATEGORIES.concat(['Custom']);
    tabs.innerHTML = '';
    cats.forEach(cat => {
        const t = document.createElement('div');
        t.className = 'LibTab' + (cat === libActiveCat ? ' active' : '');
        t.textContent = cat;
        t.onclick = () => { libActiveCat = cat; renderLibrary(); };
        tabs.appendChild(t);
    });

    const grid = document.getElementById('libGrid');
    grid.innerHTML = '';

    if (libActiveCat === 'Custom') {
        const addCard = document.createElement('div');
        addCard.className = 'LibItem addNew';
        addCard.innerHTML = "<span class='material-symbols-outlined'>add</span><span class='nm'>Create new</span>";
        addCard.onclick = () => openFurnitureEditor(null);
        grid.appendChild(addCard);

        const importCard = document.createElement('div');
        importCard.className = 'LibItem addNew';
        importCard.innerHTML = "<span class='material-symbols-outlined'>upload</span><span class='nm'>Import</span>";
        importCard.onclick = () => document.getElementById('importFurnitureFile').click();
        grid.appendChild(importCard);

        customDefs.forEach(def => grid.appendChild(libItemEl(def, true)));
        if (customDefs.length === 0) {
            const note = document.createElement('div');
            note.style.cssText = 'grid-column:1/-1;text-align:center;color:rgba(0,0,0,0.4);font-size:13px;padding:8px;';
            note.textContent = 'No custom furniture yet — create or import one.';
            grid.appendChild(note);
        }
    } else {
        FURNITURE_LIBRARY.filter(d => d.category === libActiveCat).forEach(def => grid.appendChild(libItemEl(def, false)));
    }
}

function libItemEl(def, custom) {
    const el = document.createElement('div');
    el.className = 'LibItem' + (def.id === currentFurnitureDef ? ' sel' : '');
    const img = document.createElement('img');
    img.src = 'data:image/svg+xml,' + encodeURIComponent(defSvgColored(def, newItemColor));
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = def.name;
    el.appendChild(img); el.appendChild(nm);
    el.onclick = () => { currentFurnitureDef = def.id; updateFurnitureButton(); closeModal('furnitureLibrary'); if (currentTool !== 'furniture') setTool('furniture'); };
    if (custom) {
        const acts = document.createElement('div'); acts.className = 'miniActions';
        const edit = document.createElement('button'); edit.title = 'Edit'; edit.innerHTML = "<span class='material-symbols-outlined'>edit</span>";
        edit.onclick = (ev) => { ev.stopPropagation(); openFurnitureEditor(def.id); };
        const exp = document.createElement('button'); exp.title = 'Export'; exp.innerHTML = "<span class='material-symbols-outlined'>download</span>";
        exp.onclick = (ev) => { ev.stopPropagation(); exportCustomFurniture(def); };
        const del = document.createElement('button'); del.title = 'Delete'; del.innerHTML = "<span class='material-symbols-outlined'>delete</span>";
        del.onclick = (ev) => { ev.stopPropagation(); deleteCustomFurniture(def.id); };
        acts.appendChild(edit); acts.appendChild(exp); acts.appendChild(del);
        el.appendChild(acts);
    }
    return el;
}

function exportCustomFurniture(def) {
    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(def));
    const a = document.createElement('a');
    a.href = data; a.download = 'furniture_' + def.name.replace(/\s+/g, '_') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
}

function deleteCustomFurniture(id) {
    const def = getDef(id);
    if (!def || !confirm('Delete custom furniture "' + def.name + '"?')) return;
    customDefs = customDefs.filter(d => d.id !== id);
    saveCustoms(customDefs);
    if (currentFurnitureDef === id) { currentFurnitureDef = 'sofa'; updateFurnitureButton(); }
    renderLibrary(); draw();
}

function importCustomFurnitureFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const def = JSON.parse(reader.result);
            if (!def.svg || !def.name) throw new Error('bad');
            def.id = 'c' + Date.now();
            def.category = 'Custom'; def.recolor = false;
            def.w = def.w || 1; def.h = def.h || 1;
            customDefs.push(def); saveCustoms(customDefs);
            libActiveCat = 'Custom'; renderLibrary();
        } catch (e) { alert('Could not import — not a valid furniture file.'); }
    };
    reader.readAsText(file);
}

// ===================== PATTERN LIBRARY UI =====================
let patApplyToSel = false;
function updatePatternButton() {
    const def = getPattern(currentPatternId);
    const nm = document.getElementById('flCurrentName'); if (nm) nm.textContent = def.name;
    const img = document.getElementById('flCurrentThumb'); if (img) img.src = 'data:image/svg+xml,' + encodeURIComponent(defSvgColored(def, newFloorColor));
}
function openPatternLibrary(applyToSel) { patApplyToSel = !!applyToSel; openModal('patternLibrary'); renderPatternLibrary(); }
function choosePattern(id) {
    if (patApplyToSel && selected && selected.kind === 'floor') {
        const reg = getItem(selected);
        if (reg) { pushHistory(); reg.patternId = id; }
    } else {
        currentPatternId = id; updatePatternButton();
        if (currentTool !== 'floor') setTool('floor');
    }
    closeModal('patternLibrary'); renderPropPanel(); draw();
}
function renderPatternLibrary() {
    const grid = document.getElementById('patGrid');
    grid.innerHTML = '';
    const themeColor = (patApplyToSel && selected && selected.kind === 'floor') ? (getItem(selected) || {}).color : newFloorColor;
    const sel = (patApplyToSel && selected && selected.kind === 'floor') ? (getItem(selected) || {}).patternId : currentPatternId;
    allPatterns().forEach(def => {
        const custom = customPatterns.includes(def);
        const el = document.createElement('div');
        el.className = 'LibItem' + (def.id === sel ? ' sel' : '');
        const img = document.createElement('img'); img.src = 'data:image/svg+xml,' + encodeURIComponent(defSvgColored(def, themeColor));
        const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = def.name;
        el.appendChild(img); el.appendChild(nm);
        el.onclick = () => choosePattern(def.id);
        if (custom) {
            const acts = document.createElement('div'); acts.className = 'miniActions';
            const edit = document.createElement('button'); edit.title = 'Edit'; edit.innerHTML = "<span class='material-symbols-outlined'>edit</span>";
            edit.onclick = (ev) => { ev.stopPropagation(); openPatternEditor(def.id); };
            const exp = document.createElement('button'); exp.title = 'Export'; exp.innerHTML = "<span class='material-symbols-outlined'>download</span>";
            exp.onclick = (ev) => { ev.stopPropagation(); const d = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(def)); const a = document.createElement('a'); a.href = d; a.download = 'pattern_' + def.name.replace(/\s+/g, '_') + '.json'; document.body.appendChild(a); a.click(); a.remove(); };
            const del = document.createElement('button'); del.title = 'Delete'; del.innerHTML = "<span class='material-symbols-outlined'>delete</span>";
            del.onclick = (ev) => { ev.stopPropagation(); if (!confirm('Delete pattern "' + def.name + '"?')) return; customPatterns = customPatterns.filter(p => p.id !== def.id); savePatterns(customPatterns); if (currentPatternId === def.id) { currentPatternId = 'wood'; updatePatternButton(); } renderPatternLibrary(); draw(); };
            acts.appendChild(edit); acts.appendChild(exp); acts.appendChild(del); el.appendChild(acts);
        }
        grid.appendChild(el);
    });
    const addCard = document.createElement('div'); addCard.className = 'LibItem addNew';
    addCard.innerHTML = "<span class='material-symbols-outlined'>add</span><span class='nm'>Create new</span>";
    addCard.onclick = () => openPatternEditor(null); grid.appendChild(addCard);
    const importCard = document.createElement('div'); importCard.className = 'LibItem addNew';
    importCard.innerHTML = "<span class='material-symbols-outlined'>upload</span><span class='nm'>Import</span>";
    importCard.onclick = () => document.getElementById('importPatternFile').click(); grid.appendChild(importCard);
}
function importCustomPatternFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const def = JSON.parse(reader.result);
            if (!def.svg || !def.name) throw new Error('bad');
            def.id = 'p' + Date.now(); def.recolor = false; def.tile = def.tile || 1;
            customPatterns.push(def); savePatterns(customPatterns); renderPatternLibrary();
        } catch (e) { alert('Could not import — not a valid pattern file.'); }
    };
    reader.readAsText(file);
}

// ===================== PATTERN EDITOR (simple: image/SVG + name) =====================
let patEdSvg = '';
let patEdEditingId = null;
function openPatternEditor(id) {
    patEdEditingId = id || null;
    patEdSvg = '';
    document.getElementById('patEdTitle').textContent = (id ? 'Edit ' : 'Create ') + 'Pattern';
    document.getElementById('patEdName').value = '';
    document.getElementById('patEdTile').value = 1;
    const prev = document.getElementById('patEdPreview'); prev.src = ''; prev.style.display = 'none';
    if (id) {
        const def = customPatterns.find(d => d.id === id);
        if (def) {
            document.getElementById('patEdName').value = def.name;
            document.getElementById('patEdTile').value = def.tile || 1;
            patEdSvg = def.svg;
            prev.src = 'data:image/svg+xml,' + encodeURIComponent(def.svg); prev.style.display = 'block';
        }
    }
    closeModal('patternLibrary');
    openModal('patternEditor');
}
function patEdLoadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    const prev = document.getElementById('patEdPreview');
    const nameField = document.getElementById('patEdName');
    const baseName = (file.name || 'Pattern').replace(/\.[^.]+$/, '');
    if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
        reader.onload = () => {
            patEdSvg = (reader.result || '').trim();
            if (!patEdSvg.includes('<svg')) { alert('That SVG file looks invalid.'); return; }
            prev.src = 'data:image/svg+xml,' + encodeURIComponent(patEdSvg); prev.style.display = 'block';
            if (!nameField.value) nameField.value = baseName;
        };
        reader.readAsText(file);
    } else {
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const max = 256, scale = Math.min(1, max / Math.max(img.width, img.height));
                const cw = Math.max(1, Math.round(img.width * scale)), ch = Math.max(1, Math.round(img.height * scale));
                const tc = document.createElement('canvas'); tc.width = cw; tc.height = ch;
                tc.getContext('2d').drawImage(img, 0, 0, cw, ch);
                const dataUrl = tc.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png');
                patEdSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${cw} ${ch}'><image href='${dataUrl}' width='${cw}' height='${ch}'/></svg>`;
                prev.src = dataUrl; prev.style.display = 'block';
                if (!nameField.value) nameField.value = baseName;
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
}
function savePatternFromEditor() {
    const name = document.getElementById('patEdName').value.trim();
    if (!name) { document.getElementById('patEdName').focus(); return; }
    if (!patEdSvg || !patEdSvg.includes('<svg')) { alert('Upload an image or SVG first.'); return; }
    const tile = Math.max(0.25, +document.getElementById('patEdTile').value || 1);
    imgCache.clear();
    if (patEdEditingId) { const def = customPatterns.find(d => d.id === patEdEditingId); if (def) { def.name = name; def.svg = patEdSvg; def.tile = tile; } }
    else { patEdEditingId = 'p' + Date.now(); customPatterns.push({ id: patEdEditingId, name, svg: patEdSvg, tile, recolor: false }); }
    savePatterns(customPatterns);
    currentPatternId = patEdEditingId; updatePatternButton();
    closeModal('patternEditor');
    if (currentTool !== 'floor') setTool('floor');
    draw();
}

// ===================== FURNITURE EDITOR =====================
let edTab = 'draw';
let edTool = 'select';
let editingId = null;
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx = fxCanvas.getContext('2d');
const FX_SIZE = 400, FX_SCALE = FX_SIZE / 100;
let edShapes = [];
let edCurrent = null;
let edSnapN = 4;            // subdivisions per cell (1,2,4); editor cell = 25 units
let edElements = [];       // placed SVG elements: { svg, cx, cy, w, h, rot }
let edSelEl = -1;          // index of selected element
let edElAction = null;     // { type:'move'|'scale'|'rotate', ... }

function edSnapStep() { return 25 / edSnapN; }
function edSnapVal(v) { const s = edSnapStep(); return Math.round(v / s) * s; }
function setEdSnap(n) {
    edSnapN = n;
    document.querySelectorAll('#edSnapSeg button').forEach(b => b.classList.toggle('active', +b.dataset.snap === n));
    edRender();
}
function edElImage(el) {
    if (el._img) return el._img;
    const img = new Image();
    img.onload = () => edRender();
    img.src = 'data:image/svg+xml,' + encodeURIComponent(el.svg);
    el._img = img; return img;
}

function openFurnitureEditor(id) {
    editingId = id;
    edShapes = []; edCurrent = null;
    edElements = []; edSelEl = -1; edElAction = null;
    document.getElementById('edTitle').textContent = (id ? 'Edit ' : 'Create ') + 'Furniture';
    document.getElementById('edName').value = '';
    document.getElementById('edW').value = 1;
    document.getElementById('edH').value = 1;
    setEdSnap(edSnapN);
    setEdTool('select');
    setEdTab('draw');
    if (id) {
        const def = getDef(id);
        if (def) {
            document.getElementById('edName').value = def.name;
            document.getElementById('edW').value = def.w;
            document.getElementById('edH').value = def.h;
            // load existing artwork as a movable element so it can be re-edited
            if (def.svg) {
                const aw = def.w || 1, ah = def.h || 1;
                let ew = 100, eh = 100;
                if (aw >= ah) eh = 100 * ah / aw; else ew = 100 * aw / ah;
                edElements.push({ svg: def.svg, cx: 50, cy: 50, w: ew, h: eh, rot: 0 });
            }
        }
    }
    closeModal('furnitureLibrary');
    openModal('furnitureEditor');
    requestAnimationFrame(edRender);
}

function setEdTab(tab) {
    edTab = tab;
    document.querySelectorAll('.EdTabs .LibTab').forEach(t => t.classList.toggle('active', t.dataset.edtab === tab));
    document.querySelectorAll('.EdPanel').forEach(p => p.classList.remove('active'));
    document.getElementById('edPanel-' + tab).classList.add('active');
    if (tab === 'draw') requestAnimationFrame(edRender);
}

function setEdTool(t) {
    edTool = t;
    if (t !== 'select') edSelEl = -1;
    document.querySelectorAll('.EdToolBtn[data-edtool]').forEach(b => b.classList.toggle('active', b.dataset.edtool === t));
    edRender();
}

function edPoint(e) {
    const r = fxCanvas.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / FX_SCALE, 0, 100), y: clamp((e.clientY - r.top) / FX_SCALE, 0, 100) };
}
function edStyle() {
    return {
        color: document.getElementById('edColor').value,
        width: +document.getElementById('edWidth').value,
        fill: document.getElementById('edFill').checked,
        fillColor: document.getElementById('edFillColor').value
    };
}

function edMouse(e) { const r = fxCanvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function edElHandles(el) {
    const c = { x: el.cx * FX_SCALE, y: el.cy * FX_SCALE };
    const hw = el.w / 2, hh = el.h / 2, a = (el.rot || 0) * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
    const loc = (lx, ly) => ({ x: c.x + (lx * co - ly * si) * FX_SCALE, y: c.y + (lx * si + ly * co) * FX_SCALE });
    return { center: c, br: loc(hw, hh), corners: [loc(-hw, -hh), loc(hw, -hh), loc(hw, hh), loc(-hw, hh)], rot: loc(0, -hh - 14) };
}
function pointInEl(el, px, py) {
    const lp = rotPt(px, py, el.cx, el.cy, -(el.rot || 0));
    return Math.abs(lp.x - el.cx) <= el.w / 2 && Math.abs(lp.y - el.cy) <= el.h / 2;
}

fxCanvas.addEventListener('pointerdown', e => {
    fxCanvas.setPointerCapture(e.pointerId);
    const p = edPoint(e), st = edStyle();
    if (edTool === 'select') {
        const m = edMouse(e);
        if (edSelEl >= 0 && edElements[edSelEl]) {
            const el = edElements[edSelEl], H = edElHandles(el);
            if (Math.hypot(m.x - H.rot.x, m.y - H.rot.y) < 11) { edElAction = { type: 'rotate', i: edSelEl }; return; }
            if (Math.hypot(m.x - H.br.x, m.y - H.br.y) < 11) {
                edElAction = { type: 'scale', i: edSelEl, d0: Math.hypot(p.x - el.cx, p.y - el.cy) || 1, w0: el.w, h0: el.h }; return;
            }
        }
        let found = -1;
        for (let i = edElements.length - 1; i >= 0; i--) { if (pointInEl(edElements[i], p.x, p.y)) { found = i; break; } }
        edSelEl = found;
        if (found >= 0) edElAction = { type: 'move', i: found, ox: p.x - edElements[found].cx, oy: p.y - edElements[found].cy };
        edRender(); return;
    }
    if (edTool === 'fill') {
        const idx = edShapeHitFill(p.x, p.y);
        if (idx >= 0) { edShapes[idx].fill = true; edShapes[idx].fillColor = st.fillColor; edRender(); }
        return;
    }
    const sp = { x: edSnapVal(p.x), y: edSnapVal(p.y) };
    if (edTool === 'pen') edCurrent = { type: 'pen', pts: [p], ...st };
    else if (edTool === 'line') edCurrent = { type: 'line', x1: sp.x, y1: sp.y, x2: sp.x, y2: sp.y, ...st };
    else if (edTool === 'rect') edCurrent = { type: 'rect', x0: sp.x, y0: sp.y, x1: sp.x, y1: sp.y, ...st };
    else if (edTool === 'ellipse') edCurrent = { type: 'ellipse', x0: sp.x, y0: sp.y, x1: sp.x, y1: sp.y, ...st };
    edRender();
});
fxCanvas.addEventListener('pointermove', e => {
    const p = edPoint(e);
    if (edElAction) {
        const el = edElements[edElAction.i]; if (!el) return;
        if (edElAction.type === 'move') { el.cx = clamp(edSnapVal(p.x - edElAction.ox), 0, 100); el.cy = clamp(edSnapVal(p.y - edElAction.oy), 0, 100); }
        else if (edElAction.type === 'scale') {
            const ratio = (Math.hypot(p.x - el.cx, p.y - el.cy) || 1) / edElAction.d0;
            el.w = clamp(edSnapVal(edElAction.w0 * ratio), 4, 200); el.h = clamp(edSnapVal(edElAction.h0 * ratio), 4, 200);
        } else if (edElAction.type === 'rotate') {
            let deg = Math.atan2(p.y - el.cy, p.x - el.cx) * 180 / Math.PI + 90;
            el.rot = Math.round(deg / 15) * 15;
        }
        edRender(); return;
    }
    if (!edCurrent) return;
    if (edCurrent.type === 'pen') edCurrent.pts.push(p);
    else if (edCurrent.type === 'line') { edCurrent.x2 = edSnapVal(p.x); edCurrent.y2 = edSnapVal(p.y); }
    else { edCurrent.x1 = edSnapVal(p.x); edCurrent.y1 = edSnapVal(p.y); }
    edRender();
});
fxCanvas.addEventListener('pointerup', () => {
    if (edElAction) { edElAction = null; return; }
    if (edCurrent) { edShapes.push(edCurrent); edCurrent = null; edRender(); }
});

function edRender() {
    fxCtx.clearRect(0, 0, FX_SIZE, FX_SIZE);
    fxCtx.fillStyle = '#fff'; fxCtx.fillRect(0, 0, FX_SIZE, FX_SIZE);
    // snap grid (fine) + cell grid (every 25)
    const step = edSnapStep();
    fxCtx.strokeStyle = 'rgba(99,102,241,0.07)'; fxCtx.lineWidth = 1; fxCtx.beginPath();
    for (let v = 0; v <= 100.001; v += step) { fxCtx.moveTo(v * FX_SCALE, 0); fxCtx.lineTo(v * FX_SCALE, FX_SIZE); fxCtx.moveTo(0, v * FX_SCALE); fxCtx.lineTo(FX_SIZE, v * FX_SCALE); }
    fxCtx.stroke();
    fxCtx.strokeStyle = 'rgba(99,102,241,0.18)'; fxCtx.beginPath();
    for (let v = 0; v <= 100.001; v += 25) { fxCtx.moveTo(v * FX_SCALE, 0); fxCtx.lineTo(v * FX_SCALE, FX_SIZE); fxCtx.moveTo(0, v * FX_SCALE); fxCtx.lineTo(FX_SIZE, v * FX_SCALE); }
    fxCtx.stroke();
    // placed SVG elements (under shapes)
    edElements.forEach((el, i) => {
        const img = edElImage(el);
        fxCtx.save();
        fxCtx.translate(el.cx * FX_SCALE, el.cy * FX_SCALE); fxCtx.rotate((el.rot || 0) * Math.PI / 180);
        if (img.complete && img.naturalWidth) fxCtx.drawImage(img, -el.w / 2 * FX_SCALE, -el.h / 2 * FX_SCALE, el.w * FX_SCALE, el.h * FX_SCALE);
        fxCtx.restore();
    });
    // drawn shapes (on top)
    const all = edCurrent ? edShapes.concat([edCurrent]) : edShapes;
    all.forEach(sh => edDrawShape(fxCtx, sh, FX_SCALE));
    // selected element handles
    if (edTool === 'select' && edSelEl >= 0 && edElements[edSelEl]) {
        const H = edElHandles(edElements[edSelEl]);
        fxCtx.strokeStyle = 'rgba(99,102,241,0.9)'; fxCtx.lineWidth = 1.5; fxCtx.setLineDash([5, 4]);
        fxCtx.beginPath(); H.corners.forEach((p, i) => i ? fxCtx.lineTo(p.x, p.y) : fxCtx.moveTo(p.x, p.y)); fxCtx.closePath(); fxCtx.stroke();
        fxCtx.setLineDash([]);
        fxCtx.beginPath(); fxCtx.moveTo(H.center.x, H.center.y); fxCtx.lineTo(H.rot.x, H.rot.y); fxCtx.stroke();
        fxCtx.fillStyle = '#fff';
        [H.br, H.rot].forEach(p => { fxCtx.beginPath(); fxCtx.arc(p.x, p.y, 5, 0, Math.PI * 2); fxCtx.fill(); fxCtx.stroke(); });
    }
}

function edShapeHitFill(px, py) {
    for (let i = edShapes.length - 1; i >= 0; i--) {
        const sh = edShapes[i];
        if (sh.type === 'rect') {
            const x0 = Math.min(sh.x0, sh.x1), x1 = Math.max(sh.x0, sh.x1), y0 = Math.min(sh.y0, sh.y1), y1 = Math.max(sh.y0, sh.y1);
            if (px >= x0 && px <= x1 && py >= y0 && py <= y1) return i;
        } else if (sh.type === 'ellipse') {
            const cx = (sh.x0 + sh.x1) / 2, cy = (sh.y0 + sh.y1) / 2, rx = Math.abs(sh.x1 - sh.x0) / 2 || 1, ry = Math.abs(sh.y1 - sh.y0) / 2 || 1;
            if (((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1) return i;
        }
    }
    return -1;
}

function edDrawShape(c, sh, sc) {
    c.lineWidth = sh.width * sc; c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = sh.color;
    c.fillStyle = sh.fillColor || sh.color;
    if (sh.type === 'pen') {
        c.beginPath(); c.moveTo(sh.pts[0].x * sc, sh.pts[0].y * sc);
        for (let i = 1; i < sh.pts.length; i++) c.lineTo(sh.pts[i].x * sc, sh.pts[i].y * sc);
        c.stroke();
    } else if (sh.type === 'line') {
        c.beginPath(); c.moveTo(sh.x1 * sc, sh.y1 * sc); c.lineTo(sh.x2 * sc, sh.y2 * sc); c.stroke();
    } else if (sh.type === 'rect') {
        const x = Math.min(sh.x0, sh.x1) * sc, y = Math.min(sh.y0, sh.y1) * sc;
        const w = Math.abs(sh.x1 - sh.x0) * sc, h = Math.abs(sh.y1 - sh.y0) * sc;
        if (sh.fill) c.fillRect(x, y, w, h);
        c.strokeRect(x, y, w, h);
    } else if (sh.type === 'ellipse') {
        const cx = (sh.x0 + sh.x1) / 2 * sc, cy = (sh.y0 + sh.y1) / 2 * sc;
        const rx = Math.abs(sh.x1 - sh.x0) / 2 * sc, ry = Math.abs(sh.y1 - sh.y0) / 2 * sc;
        c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (sh.fill) c.fill(); c.stroke();
    }
}

function edUndo() { if (edCurrent) { edCurrent = null; } else edShapes.pop(); edRender(); }
function edClear() { edShapes = []; edCurrent = null; edElements = []; edSelEl = -1; edRender(); }

// ----- placed SVG / image elements -----
function edAddElement(svg) {
    if (!svg || !svg.includes('<svg')) { alert('That is not a valid SVG or image.'); return; }
    svg = svg.trim();
    // size the placed element from its viewBox aspect, fitting within ~60 editor units
    let w = 50, h = 50;
    const vb = svg.match(/viewBox\s*=\s*['"]\s*[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)/);
    if (vb) {
        const vw = +vb[1], vh = +vb[2];
        if (vw > 0 && vh > 0) { const m = 60; if (vw >= vh) { w = m; h = m * vh / vw; } else { h = m; w = m * vw / vh; } }
    }
    edElements.push({ svg, cx: 50, cy: 50, w, h, rot: 0 });
    edSelEl = edElements.length - 1;
    setEdTool('select');
    edRender();
}
async function edAddElementFromClipboard() {
    try {
        if (navigator.clipboard && navigator.clipboard.read) {
            const items = await navigator.clipboard.read();
            for (const it of items) {
                const imgType = it.types.find(t => t.startsWith('image/') && t !== 'image/svg+xml');
                if (imgType) {
                    const blob = await it.getType(imgType);
                    edAddElementFromFile(new File([blob], 'pasted', { type: imgType }));
                    return;
                }
            }
        }
        const txt = await navigator.clipboard.readText();
        if (txt && txt.includes('<svg')) edAddElement(txt);
        else alert('No SVG or image found on the clipboard.');
    } catch (e) {
        try { const txt = await navigator.clipboard.readText(); if (txt && txt.includes('<svg')) { edAddElement(txt); return; } } catch (_) { }
        alert('Could not read the clipboard.');
    }
}
function edAddElementFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
        reader.onload = () => edAddElement(reader.result);
        reader.readAsText(file);
    } else {
        // raster image → downscale to max 256×256 and embed in an svg wrapper
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const max = 256, scale = Math.min(1, max / Math.max(img.width, img.height));
                const cw = Math.max(1, Math.round(img.width * scale)), ch = Math.max(1, Math.round(img.height * scale));
                const tc = document.createElement('canvas'); tc.width = cw; tc.height = ch;
                tc.getContext('2d').drawImage(img, 0, 0, cw, ch);
                const dataUrl = tc.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png');
                edAddElement(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${cw} ${ch}'><image href='${dataUrl}' width='${cw}' height='${ch}'/></svg>`);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
}
function edDeleteElement() { if (edSelEl >= 0) { edElements.splice(edSelEl, 1); edSelEl = -1; edRender(); } }

function edShapesToSvg() {
    let body = '';
    // placed elements first (so drawn shapes sit on top)
    edElements.forEach(el => {
        const href = 'data:image/svg+xml,' + encodeURIComponent(el.svg);
        body += `<g transform='translate(${el.cx.toFixed(2)} ${el.cy.toFixed(2)}) rotate(${(el.rot || 0).toFixed(2)})'><image href="${href}" x='${(-el.w / 2).toFixed(2)}' y='${(-el.h / 2).toFixed(2)}' width='${el.w.toFixed(2)}' height='${el.h.toFixed(2)}'/></g>`;
    });
    edShapes.forEach(sh => {
        const fill = sh.fill ? (sh.fillColor || sh.color) : 'none';
        const fillOp = '';
        const stroke = `stroke='${sh.color}' stroke-width='${sh.width}' stroke-linecap='round' stroke-linejoin='round'`;
        if (sh.type === 'pen') {
            const pts = sh.pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            body += `<polyline points='${pts}' fill='none' ${stroke}/>`;
        } else if (sh.type === 'line') {
            body += `<line x1='${sh.x1.toFixed(1)}' y1='${sh.y1.toFixed(1)}' x2='${sh.x2.toFixed(1)}' y2='${sh.y2.toFixed(1)}' ${stroke}/>`;
        } else if (sh.type === 'rect') {
            const x = Math.min(sh.x0, sh.x1), y = Math.min(sh.y0, sh.y1), w = Math.abs(sh.x1 - sh.x0), h = Math.abs(sh.y1 - sh.y0);
            body += `<rect x='${x.toFixed(1)}' y='${y.toFixed(1)}' width='${w.toFixed(1)}' height='${h.toFixed(1)}' fill='${fill}' ${fillOp} ${stroke}/>`;
        } else if (sh.type === 'ellipse') {
            const cx = (sh.x0 + sh.x1) / 2, cy = (sh.y0 + sh.y1) / 2, rx = Math.abs(sh.x1 - sh.x0) / 2, ry = Math.abs(sh.y1 - sh.y0) / 2;
            body += `<ellipse cx='${cx.toFixed(1)}' cy='${cy.toFixed(1)}' rx='${rx.toFixed(1)}' ry='${ry.toFixed(1)}' fill='${fill}' ${fillOp} ${stroke}/>`;
        }
    });
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>${body}</svg>`;
}

function saveCustomFurniture() {
    const name = document.getElementById('edName').value.trim();
    if (!name) { setEdTab('settings'); document.getElementById('edName').focus(); flashHint('Give it a name'); return; }
    if (edShapes.length === 0 && edElements.length === 0) { alert('Draw or import something first.'); return; }
    const svg = edShapesToSvg();
    const w = Math.max(0.25, +document.getElementById('edW').value || 1);
    const h = Math.max(0.25, +document.getElementById('edH').value || 1);
    imgCache.clear();
    if (editingId) { const def = customDefs.find(d => d.id === editingId); if (def) { def.name = name; def.svg = svg; def.w = w; def.h = h; } }
    else { editingId = 'c' + Date.now(); customDefs.push({ id: editingId, name, category: 'Custom', svg, w, h, recolor: false }); }
    saveCustoms(customDefs);
    currentFurnitureDef = editingId; updateFurnitureButton();
    closeModal('furnitureEditor');
    libActiveCat = 'Custom';
    if (currentTool !== 'furniture') setTool('furniture');
    draw();
}

// ===================== SAVE / LOAD PLANS =====================
const STORAGE_KEY = 'bbFloorplans';
function collectPlanData() { return { floors: JSON.parse(JSON.stringify(floorData)), uid }; }

function loadPlanData(data) {
    FLOORS.forEach(f => floorData[f] = { walls: [], openings: [], roofs: [], furniture: [], floors: [], fences: [], marks: [], parking: [] });
    if (data.floors) {
        Object.keys(data.floors).forEach(k => {
            if (floorData[k] !== undefined) {
                const d = data.floors[k];
                floorData[k] = { walls: d.walls || [], openings: d.openings || [], roofs: d.roofs || [], furniture: d.furniture || [], floors: d.floors || [], fences: d.fences || [], marks: d.marks || [], parking: d.parking || [] };
            }
        });
    }
    uid = data.uid || (maxId() + 1);
    multiSelected.clear(); selectItem(null); updateFloorUI(); draw();
}

function maxId() {
    let m = 0;
    FLOORS.forEach(f => ['walls', 'openings', 'roofs', 'furniture', 'floors', 'fences', 'marks', 'parking'].forEach(k => (floorData[f][k] || []).forEach(i => { if (i.id > m) m = i.id; })));
    return m;
}

function savePlan() {
    const input = document.getElementById('planNameInput');
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    const plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    plans[name] = collectPlanData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    input.value = ''; renderPlansList();
}
function loadPlan(name) {
    const plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (plans[name]) { loadPlanData(plans[name]); closeModal('saveLoad'); }
}
function importPlanFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            if (!data || typeof data.floors !== 'object') throw new Error('bad');
            const plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            // Derive a name from the filename, keep it unique against existing plans
            let base = (file.name || 'Imported Plan').replace(/\.[^.]+$/, '').replace(/^floorplan_/, '').replace(/_/g, ' ').trim() || 'Imported Plan';
            let name = base, i = 2;
            while (plans[name]) name = base + ' (' + (i++) + ')';
            plans[name] = data;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
            renderPlansList();
            flashHint('Imported “' + name + '”');
        } catch (e) { alert('Could not import — not a valid floor plan file.'); }
    };
    reader.readAsText(file);
}
function deletePlan(name) {
    if (!confirm('Delete plan "' + name + '"?')) return;
    const plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete plans[name]; localStorage.setItem(STORAGE_KEY, JSON.stringify(plans)); renderPlansList();
}
function overwritePlan(name) {
    if (!confirm('Overwrite "' + name + '" with the current drawing? This replaces the saved plan.')) return;
    const plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    plans[name] = collectPlanData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    flashHint('Overwrote “' + name + '”');
    renderPlansList();
}
function renderPlansList() {
    const list = document.getElementById('savedPlansList');
    const plans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const keys = Object.keys(plans);
    if (keys.length === 0) {
        list.innerHTML = '<div class="EmptyState"><span class="material-symbols-outlined">home_work</span><div>No saved plans yet.</div></div>';
        return;
    }
    list.innerHTML = '';
    keys.forEach(name => {
        const item = document.createElement('div'); item.className = 'SavedBoardItem';
        const span = document.createElement('span'); span.textContent = name;
        const actions = document.createElement('div'); actions.className = 'SavedBoardActions';
        const loadBtn = document.createElement('button'); loadBtn.className = 'GTextBtn'; loadBtn.style.cssText = 'padding: 6px 10px;'; loadBtn.textContent = 'Load'; loadBtn.onclick = (e) => { e.stopPropagation(); loadPlan(name); };
        const owBtn = document.createElement('button'); owBtn.className = 'GTextBtn'; owBtn.style.cssText = 'padding: 6px; background: rgba(245,158,11,0.2); border-color: rgba(245,158,11,0.4); color: #b45309;'; owBtn.title = 'Overwrite with current drawing'; owBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">save_as</span>'; owBtn.onclick = (e) => { e.stopPropagation(); overwritePlan(name); };
        const dlBtn = document.createElement('button'); dlBtn.className = 'GTextBtn'; dlBtn.style.cssText = 'padding: 6px; background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #22c55e;'; dlBtn.title = 'Export JSON'; dlBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">download</span>';
        dlBtn.onclick = (e) => {
            e.stopPropagation();
            const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plans[name]));
            const a = document.createElement('a'); a.href = data; a.download = 'floorplan_' + name.replace(/\s+/g, '_') + '.json';
            document.body.appendChild(a); a.click(); a.remove();
        };
        const delBtn = document.createElement('button'); delBtn.className = 'GTextBtn'; delBtn.style.cssText = 'padding: 6px; background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.4); color: #ef4444;'; delBtn.title = 'Delete'; delBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">delete</span>'; delBtn.onclick = (e) => { e.stopPropagation(); deletePlan(name); };
        actions.appendChild(loadBtn); actions.appendChild(owBtn); actions.appendChild(dlBtn); actions.appendChild(delBtn);
        item.appendChild(span); item.appendChild(actions);
        // hover / click → live preview of the saved plan
        item.addEventListener('mouseenter', () => showPlanPreview(name, plans[name]));
        item.addEventListener('mouseleave', hidePlanPreview);
        item.addEventListener('click', () => showPlanPreview(name, plans[name]));
        list.appendChild(item);
    });
}

// ----- saved-plan preview rendering -----
function floorContentBounds(F) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const acc = (x, y) => { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); };
    F.walls.concat(F.openings, F.fences || []).forEach(s => { acc(s.x1, s.y1); acc(s.x2, s.y2); });
    F.roofs.forEach(r => { acc(r.x, r.y); acc(r.x + r.w, r.y + r.h); });
    F.furniture.forEach(f => { const b = fAABB(f); acc(b.x0, b.y0); acc(b.x1, b.y1); });
    (F.floors || []).forEach(r => r.points.forEach(p => acc(p.x, p.y)));
    (F.parking || []).forEach(lot => { const b = parkingAABB(lot); acc(b.x0, b.y0); acc(b.x1, b.y1); });
    (F.marks || []).forEach(m => { const b = markAABB(m); acc(b.x0, b.y0); acc(b.x1, b.y1); });
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = GRID; maxY = GRID; }
    const pad = 1;
    return { minX: Math.max(0, minX - pad), minY: Math.max(0, minY - pad), maxX: Math.min(GRID, maxX + pad), maxY: Math.min(GRID, maxY + pad) };
}
function showPlanPreview(name, planData) {
    if (!planData) return;
    document.getElementById('planPreviewName').textContent = name;
    const cv = document.getElementById('planPreviewCanvas');
    const cctx = cv.getContext('2d');
    // build temporary floorData from the saved plan, render, then restore
    const saved = floorData;
    const tmp = {}; FLOORS.forEach(f => tmp[f] = { walls: [], openings: [], roofs: [], furniture: [], floors: [], fences: [], marks: [], parking: [] });
    if (planData.floors) Object.keys(planData.floors).forEach(k => {
        if (tmp[k] !== undefined) { const d = planData.floors[k]; tmp[k] = { walls: d.walls || [], openings: d.openings || [], roofs: d.roofs || [], furniture: d.furniture || [], floors: d.floors || [], fences: d.fences || [], marks: d.marks || [], parking: d.parking || [] }; }
    });
    floorData = tmp;
    try {
        let bestF = 0, bestN = -1;
        FLOORS.forEach(f => { const F = tmp[f]; const n = F.walls.length + F.openings.length + F.roofs.length + F.furniture.length + F.floors.length + (F.parking || []).length; if (n > bestN) { bestN = n; bestF = f; } });
        const F = tmp[bestF];
        const b = floorContentBounds(F);
        const cw = cv.width, ch = cv.height;
        const cellsW = Math.max(1, b.maxX - b.minX), cellsH = Math.max(1, b.maxY - b.minY);
        const z = clamp(Math.min(cw / (cellsW * CELL), ch / (cellsH * CELL)) * 0.94, MIN_ZOOM, MAX_ZOOM);
        const px = (cw - cellsW * CELL * z) / 2 - b.minX * CELL * z;
        const py = (ch - cellsH * CELL * z) / 2 - b.minY * CELL * z;
        drawScene(cctx, { cssW: cw, cssH: ch, zoom: z, panX: px, panY: py, floor: bestF, showGrid: false, showGhost: false, selected: null, interactive: false });
    } finally { floorData = saved; }
    document.getElementById('planPreview').classList.add('open');
}
function hidePlanPreview() { document.getElementById('planPreview').classList.remove('open'); }

// ===================== EXPORT PNG =====================
function exportAsPNG() {
    const F = floor();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const acc = (x, y) => { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); };
    F.walls.concat(F.openings, F.fences || []).forEach(s => { acc(s.x1, s.y1); acc(s.x2, s.y2); });
    F.roofs.forEach(r => { acc(r.x, r.y); acc(r.x + r.w, r.y + r.h); });
    F.furniture.forEach(f => { const b = fAABB(f); acc(b.x0, b.y0); acc(b.x1, b.y1); });
    (F.floors || []).forEach(r => r.points.forEach(p => acc(p.x, p.y)));
    (F.parking || []).forEach(lot => { const b = parkingAABB(lot); acc(b.x0, b.y0); acc(b.x1, b.y1); });
    (F.marks || []).forEach(m => { const b = markAABB(m); acc(b.x0, b.y0); acc(b.x1, b.y1); });
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = GRID; maxY = GRID; }
    const pad = 1.5;
    minX = clamp(Math.floor(minX - pad), 0, GRID); minY = clamp(Math.floor(minY - pad), 0, GRID);
    maxX = clamp(Math.ceil(maxX + pad), 0, GRID); maxY = clamp(Math.ceil(maxY + pad), 0, GRID);
    const cellsW = Math.max(1, maxX - minX), cellsH = Math.max(1, maxY - minY);
    const targetCell = clamp(1400 / Math.max(cellsW, cellsH), 14, 60);
    const expZoom = targetCell / CELL;
    const W = Math.round(cellsW * targetCell), H = Math.round(cellsH * targetCell) + 36;
    const ec = document.createElement('canvas'); ec.width = W; ec.height = H;
    const ectx = ec.getContext('2d');
    drawScene(ectx, { cssW: W, cssH: H - 36, zoom: expZoom, panX: -minX * CELL * expZoom, panY: -minY * CELL * expZoom, floor: currentFloor, showGrid, showGhost: false, selected: null, interactive: false });
    ectx.fillStyle = '#6366f1'; ectx.fillRect(0, H - 36, W, 36);
    ectx.fillStyle = '#fff'; ectx.font = '600 16px Roboto'; ectx.textBaseline = 'middle';
    ectx.fillText('Floorplanner — ' + floorLabel(currentFloor), 14, H - 18);
    ec.toBlob(blob => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'floorplan_' + floorLabel(currentFloor).replace(/\s+/g, '_').toLowerCase() + '.png';
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    }, 'image/png');
}

// ===================== MODALS =====================
function openModal(id) {
    document.getElementById(id + 'Modal').classList.add('open');
    if (id === 'saveLoad') renderPlansList();
}
function closeModal(id) { document.getElementById(id + 'Modal').classList.remove('open'); }

// ===================== TUTORIAL =====================
const TUT_FLAG = 'bbFloorplanTutorialDone';
let tutorial = { active: false, step: 0 };
const tutorialSteps = [
    { sel: null, icon: 'school', title: 'Welcome to the Floorplanner', body: 'Plan your Bloxburg builds in 2D — walls, doors, windows, roofs, flooring and furniture, across multiple floors. Want a quick 60-second tour?' },
    { sel: '[data-tool="wall"]', icon: 'square_foot', title: 'Draw walls', body: 'Pick the Wall tool, then hold and drag to draw a wall at any angle. Endpoints snap to the grid. Hold <b>Shift</b> to lock to a straight axis.' },
    { sel: '[data-tool="door"]', icon: 'door_open', title: 'Doors & windows', body: 'With the Door or Window tool, hover over a wall — a preview snaps onto it — then click to drop it in. Once placed, select it to drag, resize, or flip the hinge/side.' },
    { sel: '[data-tool="roof"]', icon: 'roofing', title: 'Roofs', body: 'The Roof tool lets you hold-drag a rectangle to mark roof coverage. Release to confirm.' },
    { sel: '[data-tool="floor"]', icon: 'grid_view', title: 'Flooring', body: 'The Floor tool paints flooring with a texture. Switch between <b>Rectangle</b> and <b>Polygon</b> modes, pick a pattern, and draw a region in each room. You can even create your own patterns!' },
    { sel: '[data-tool="furniture"]', icon: 'chair', title: 'Place furniture', before: () => setTool('furniture'), title2: '', body: 'The Furniture tool drops objects that snap to the 4×4 sub-grid and flush against walls. A ghost preview follows your cursor — click to place.' },
    { sel: '#fxToolbar', icon: 'category', title: 'Choose & rotate furniture', before: () => setTool('furniture'), body: 'Use the chooser to browse the library or build your own object. <b>Q</b>/<b>E</b> (or the rotate buttons) rotate before placing — toggle the step between 90° and 45°.' },
    { sel: '[data-tool="select"]', icon: 'near_me', title: 'Move, resize & rotate', before: () => setTool('select'), body: 'The Select tool moves anything. Drag the corner handles to resize furniture, roofs & flooring; drag door/window handles to resize them. Drag an empty area to rubber-band select many items.' },
    { sel: '#fxToolbar', icon: 'draw', title: 'Create custom furniture', before: () => setTool('furniture'), body: 'Open the chooser → Custom → <b>Create new</b>. Draw your own shapes (with stroke &amp; fill colours), or paste/import an SVG or image element to move, scale &amp; rotate. Name it in the Settings tab and save.' },
    { sel: '#undoBtn', icon: 'undo', title: 'Undo, save & export', body: 'Every change can be undone with <b>Ctrl+Z</b> (redo with Ctrl+Y). Use <b>Plans</b> to save/load, and <b>Export PNG</b> to share. That\'s it — happy building!' }
];

function startTutorial() { tutorial.active = true; tutorial.step = 0; setTool('select'); showTutStep(); }
function endTutorial() {
    tutorial.active = false;
    document.getElementById('tutCard').classList.remove('show');
    document.getElementById('tutRing').classList.remove('show');
    document.getElementById('tutDim').classList.remove('show');
    localStorage.setItem(TUT_FLAG, '1');
}
function tutStep(dir) {
    const n = tutorial.step + dir;
    if (n < 0) return;
    if (n >= tutorialSteps.length) { endTutorial(); return; }
    tutorial.step = n; showTutStep();
}
function showTutStep() {
    const st = tutorialSteps[tutorial.step];
    if (st.before) { try { st.before(); } catch (e) { } }
    document.getElementById('tutIcon').textContent = st.icon;
    document.getElementById('tutTitle').textContent = st.title;
    document.getElementById('tutBody').innerHTML = st.body;
    const dots = document.getElementById('tutDots');
    dots.innerHTML = '';
    tutorialSteps.forEach((_, i) => { const d = document.createElement('i'); if (i === tutorial.step) d.className = 'on'; dots.appendChild(d); });
    document.getElementById('tutBack').style.visibility = tutorial.step === 0 ? 'hidden' : 'visible';
    document.getElementById('tutNext').textContent = tutorial.step === tutorialSteps.length - 1 ? 'Finish' : 'Next';
    document.getElementById('tutSkip').style.visibility = tutorial.step === tutorialSteps.length - 1 ? 'hidden' : 'visible';

    const ring = document.getElementById('tutRing'), card = document.getElementById('tutCard'), dim = document.getElementById('tutDim');
    card.classList.add('show');
    const target = st.sel ? document.querySelector(st.sel) : null;
    const vw = window.innerWidth, vh = window.innerHeight;
    if (target && target.offsetParent !== null) {
        const r = target.getBoundingClientRect(), pad = 6;
        ring.style.left = (r.left - pad) + 'px'; ring.style.top = (r.top - pad) + 'px';
        ring.style.width = (r.width + pad * 2) + 'px'; ring.style.height = (r.height + pad * 2) + 'px';
        ring.classList.add('show'); dim.classList.remove('show');
        const ch = card.offsetHeight || 160, cw = 320;
        let top = r.bottom + 14;
        if (top + ch > vh - 12) top = Math.max(12, r.top - 14 - ch);
        let left = clamp(r.left, 12, vw - cw - 12);
        card.style.left = left + 'px'; card.style.top = top + 'px';
        card.style.transform = 'none';
    } else {
        ring.classList.remove('show'); dim.classList.add('show');
        card.style.left = '50%'; card.style.top = '50%'; card.style.transform = 'translate(-50%,-50%)';
    }
}
window.addEventListener('resize', () => { if (tutorial.active) showTutStep(); });

// ===================== TOOLBAR SCROLL =====================
// Let a regular vertical wheel scroll the toolbar horizontally so it never wraps.
(function () {
    const tb = document.querySelector('.Toolbar');
    if (!tb) return;
    tb.addEventListener('wheel', e => {
        if (e.deltaY === 0) return;
        if (tb.scrollWidth <= tb.clientWidth) return; // nothing to scroll
        e.preventDefault();
        tb.scrollLeft += (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX);
    }, { passive: false });
})();

// ===================== INIT =====================
window.addEventListener('resize', resize);
fitView();
updateFloorUI();
updateCursor();
updateHint();
updateFurnitureButton();
updatePatternButton();
updateMarkButton();
updateRotateStepBtn();
setFloorMode('rect');
resize();
// Marking icons are drawn straight onto the canvas with the Material Symbols font —
// redraw once it's loaded so the first paint isn't a tofu box.
if (document.fonts && document.fonts.load) {
    document.fonts.load('24px "Material Symbols Outlined"').then(draw).catch(() => { });
    document.fonts.ready.then(draw).catch(() => { });
}
if (!localStorage.getItem(TUT_FLAG)) setTimeout(startTutorial, 500);