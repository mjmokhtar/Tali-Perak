const P = {
  wall: '#3a2a3c', wall2: '#4a3447', trim: '#2a1c2a', floor: '#6b4630', floor2: '#5a3a28', floorL: '#7d5638',
  rug: '#8a3b45', rug2: '#c78a4a', rug3: '#e8c27a', wood: '#4b2f22', woodL: '#8a5a3a', cream: '#efdcb0',
  lamp: '#f6cf62', teal: '#3fa7a0', night: '#10203f', leaf: '#2d6a52', leaf2: '#1f4a40', red: '#c4566e',
  blue: '#46618f', blueD: '#2c4068', white: '#f2ead6', ink: '#14102a',
};

const hash = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

function r(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function window_(g: CanvasRenderingContext2D, x: number, y: number, t: number, seed: number) {
  r(g, x - 1, y - 1, 30, 26, P.wood);
  r(g, x, y, 28, 24, P.night);
  // garden glimpse: hills, bush, banana leaves, fireflies
  r(g, x, y + 15, 28, 9, P.leaf2);
  r(g, x + 2, y + 11, 8, 6, P.leaf);
  r(g, x + 16, y + 9, 3, 10, P.leaf);
  r(g, x + 12, y + 8, 5, 2, P.leaf); r(g, x + 19, y + 10, 6, 2, P.leaf);
  r(g, x + 20, y + 3, 4, 4, '#d9dfe8');
  for (let i = 0; i < 3; i++) {
    const on = Math.sin(t * 2 + i * 2 + seed) > 0;
    if (on) r(g, x + 3 + hash(i, seed) * 20, y + 5 + hash(seed, i) * 8 + Math.sin(t + i), 1, 1, P.lamp);
  }
  r(g, x + 13, y, 2, 24, P.wood); r(g, x, y + 11, 28, 2, P.wood);
  r(g, x - 3, y - 2, 4, 28, P.red); r(g, x + 27, y - 2, 4, 28, P.red);
}

function bookshelf(g: CanvasRenderingContext2D, x: number, y: number) {
  r(g, x, y, 36, 34, P.wood);
  for (let row = 0; row < 3; row++) {
    const yy = y + 2 + row * 11;
    r(g, x + 2, yy, 32, 9, P.trim);
    let bx = x + 3;
    for (let i = 0; i < 8; i++) {
      const w = 2 + Math.floor(hash(i, row + x) * 3), h = 5 + Math.floor(hash(row, i + x) * 4);
      r(g, bx, yy + 9 - h, w, h, [P.red, P.blue, P.rug2, P.leaf, P.cream][Math.floor(hash(i + 3, row) * 5)]);
      bx += w + 1;
      if (bx > x + 31) break;
    }
    r(g, x + 2, yy + 9, 32, 1, P.woodL);
  }
}

function frame(g: CanvasRenderingContext2D, x: number, y: number) {
  r(g, x, y, 30, 22, P.woodL); r(g, x + 2, y + 2, 26, 18, '#d9c493');
  for (let i = 0; i < 4; i++) {
    const px = x + 5 + i * 6, h = i < 2 ? 8 : 5;
    r(g, px, y + 18 - h, 4, h, [P.blueD, P.red, P.teal, P.rug2][i]);
    r(g, px, y + 18 - h - 3, 4, 3, '#d8b49a');
    r(g, px, y + 18 - h - 4, 4, 1, P.ink);
  }
}

function table(g: CanvasRenderingContext2D, x: number, y: number, t: number) {
  // round-cornered table, cloth, two place settings, candle
  r(g, x + 2, y + 24, 3, 8, P.wood); r(g, x + 51, y + 24, 3, 8, P.wood);
  r(g, x, y + 4, 56, 22, P.woodL);
  r(g, x + 2, y + 2, 52, 2, P.woodL);
  r(g, x + 2, y + 26, 52, 2, P.wood);
  r(g, x + 4, y + 6, 48, 16, P.cream);
  for (let i = 0; i < 12; i++) r(g, x + 4 + i * 4, y + 6, 2, 16, i % 2 ? '#e3c9a0' : P.cream);
  r(g, x + 4, y + 20, 48, 2, P.red);
  for (const px of [x + 9, x + 39]) {
    r(g, px, y + 10, 8, 8, P.white); r(g, px + 1, y + 11, 6, 6, '#cfe0e6');
    r(g, px - 2, y + 11, 1, 6, '#b9cfe0'); r(g, px + 9, y + 11, 1, 6, '#b9cfe0');
  }
  r(g, x + 26, y + 9, 4, 8, P.cream); r(g, x + 27, y + 8, 2, 1, P.red);
  r(g, x + 27, y + 4 + Math.sin(t * 9) * 0.5, 2, 3, P.lamp);
  g.globalAlpha = 0.15; r(g, x + 18, y - 4, 20, 14, P.lamp); g.globalAlpha = 1;
  // chairs
  r(g, x + 8, y - 6, 10, 6, P.wood); r(g, x + 38, y - 6, 10, 6, P.wood);
  r(g, x + 8, y + 30, 10, 5, P.wood); r(g, x + 38, y + 30, 10, 5, P.wood);
}

function bed(g: CanvasRenderingContext2D, x: number, y: number) {
  r(g, x, y, 46, 54, P.wood);
  r(g, x + 2, y + 2, 42, 8, P.woodL);
  r(g, x + 4, y + 8, 38, 44, P.white);
  r(g, x + 6, y + 10, 14, 9, '#fff6df'); r(g, x + 26, y + 10, 14, 9, '#fff6df');
  r(g, x + 4, y + 24, 38, 28, P.blueD);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2 === 0) r(g, x + 6 + i * 7, y + 26 + j * 6, 5, 4, P.blue);
  r(g, x + 4, y + 24, 38, 2, P.rug3);
  r(g, x + 2, y + 50, 42, 4, P.wood);
}

function kitchen(g: CanvasRenderingContext2D, x: number, y: number, t: number) {
  r(g, x, y, 80, 22, P.wood); r(g, x, y, 80, 4, '#b99a78');
  r(g, x + 2, y + 6, 36, 14, P.trim); r(g, x + 42, y + 6, 36, 14, P.trim);
  r(g, x + 18, y + 11, 3, 2, P.rug3); r(g, x + 58, y + 11, 3, 2, P.rug3);
  // stove w/ pot and steam
  r(g, x + 46, y - 6, 20, 6, '#6c6f80'); r(g, x + 48, y - 10, 16, 5, '#8c93a6');
  r(g, x + 47, y - 11, 18, 1, '#b9cfe0');
  for (let i = 0; i < 3; i++) {
    g.globalAlpha = 0.3; r(g, x + 52 + Math.sin(t * 2 + i) * 2 + i * 2, y - 14 - ((t * 6 + i * 5) % 14), 2, 2, '#d9dfe8'); g.globalAlpha = 1;
  }
  // hanging pans & jars
  for (let i = 0; i < 3; i++) { r(g, x + 6 + i * 9, y - 24, 1, 6, P.ink); r(g, x + 3 + i * 9, y - 18, 7, 5, '#7b8396'); }
  r(g, x + 4, y - 8, 6, 7, '#c9a35a'); r(g, x + 12, y - 7, 5, 6, '#8fb59a');
}

function plant(g: CanvasRenderingContext2D, x: number, y: number, t: number) {
  r(g, x, y + 10, 10, 8, '#a2573d'); r(g, x - 1, y + 9, 12, 2, '#c4704f');
  for (let i = 0; i < 5; i++) {
    const s = Math.sin(t * 1.3 + i) * 0.6;
    r(g, x + 4 + (i - 2) * 3 + s, y + 2 - (i % 2) * 3, 3, 8, P.leaf);
  }
}

function rug(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  r(g, x, y, w, h, P.rug); r(g, x + 3, y + 3, w - 6, h - 6, P.rug2);
  r(g, x + 5, y + 5, w - 10, h - 10, P.rug);
  for (let i = 0; i < w - 10; i += 8) {
    r(g, x + 5 + i, y + h / 2 - 2, 4, 4, P.rug3);
    r(g, x + 9 + i, y + h / 2 - 1, 1, 2, P.rug2);
  }
  for (let i = 0; i < h; i += 3) { r(g, x - 2, y + i, 2, 1, P.cream); r(g, x + w, y + i, 2, 1, P.cream); }
}

function sofa(g: CanvasRenderingContext2D, x: number, y: number) {
  r(g, x, y, 50, 14, '#7a3d4a'); r(g, x - 3, y + 6, 6, 18, '#5e2d3b'); r(g, x + 47, y + 6, 6, 18, '#5e2d3b');
  r(g, x + 2, y + 12, 46, 12, '#9a4e5a');
  r(g, x + 25, y + 12, 1, 12, '#6e3340');
  r(g, x + 6, y + 14, 8, 6, P.rug3);
}

export function drawHome(g: CanvasRenderingContext2D, t: number): void {
  g.imageSmoothingEnabled = false;
  // outside dark
  r(g, 0, 0, 640, 360, '#0b0f20');
  // wall band
  r(g, 0, 0, 640, 56, P.wall);
  for (let x = 0; x < 640; x += 12) r(g, x, 0, 6, 56, P.wall2);
  r(g, 0, 50, 640, 6, P.trim);
  // floors
  for (let y = 56; y < 360; y += 8) {
    for (let x = 0; x < 640; x += 32) {
      const o = (y / 8) % 2 ? 16 : 0;
      const h = hash(x + o, y);
      r(g, x + o - 16 + (o ? 32 : 0) - (o ? 32 : 0), y, 32, 8, h > 0.5 ? P.floor : P.floor2);
    }
  }
  for (let y = 56; y < 360; y += 8) {
    r(g, 0, y, 640, 1, '#3d261b');
    for (let x = (y / 8) % 2 ? 0 : 16; x < 640; x += 32) r(g, x, y, 1, 8, '#3d261b');
  }
  for (let i = 0; i < 90; i++) r(g, hash(i, 1) * 640, 58 + hash(i, 2) * 300, 5, 1, P.floorL);
  // hallway runner
  r(g, 224, 186, 196, 58, '#4b2a3a');
  r(g, 226, 188, 192, 54, '#6b3a48');
  for (let x = 230; x < 416; x += 10) r(g, x, 212, 5, 2, P.rug3);
  // back entry tile
  for (let y = 56; y < 360; y += 16) for (let x = 424; x < 640; x += 16)
    r(g, x, y, 16, 16, ((x + y) / 16) % 2 ? '#8c7b6b' : '#6e5f56');
  // windows
  window_(g, 40, 14, t, 1); window_(g, 150, 14, t, 2);
  window_(g, 300, 14, t, 3); window_(g, 480, 14, t, 4); window_(g, 560, 14, t, 5);
  // living room
  frame(g, 88, 12);
  bookshelf(g, 184, 18);
  rug(g, 40, 70, 150, 46);
  table(g, 70, 78, t);
  // kitchen-ish corner (northwest-ish) beside hall wall
  kitchen(g, 132, 32, t);
  // sofa + lamp rug near rest light 92,240
  rug(g, 56, 214, 90, 56);
  sofa(g, 150, 290);
  plant(g, 24, 300, t);
  plant(g, 196, 128, t);
  // low shelf with photos
  r(g, 30, 320, 70, 14, P.wood); r(g, 32, 322, 66, 4, P.woodL);
  r(g, 40, 314, 8, 8, P.cream); r(g, 56, 312, 6, 10, P.teal);
  // bedroom
  rug(g, 250, 90, 70, 50);
  bed(g, 350, 60);
  r(g, 340, 70, 8, 14, P.wood); r(g, 341, 66, 6, 4, P.lamp);
  r(g, 260, 62, 20, 26, P.wood); r(g, 262, 64, 16, 10, P.trim);
  // cat blanket nook at (304,128)
  r(g, 292, 120, 28, 18, '#a8705a'); r(g, 294, 122, 24, 14, '#d09a74');
  for (let i = 0; i < 4; i++) r(g, 296 + i * 6, 124, 3, 10, '#e8c27a');
  // hall extras: shoe rack, stool
  r(g, 240, 200, 1, 1, P.wood);
  r(g, 380, 190, 28, 6, P.wood); r(g, 382, 186, 24, 4, '#7a5a40');
  // back entry: umbrella stand, boots, mat, hanging cloth
  r(g, 590, 112, 14, 22, P.wood); r(g, 592, 106, 2, 10, P.blueD); r(g, 598, 104, 2, 12, P.red);
  r(g, 540, 296, 40, 14, '#a9894f'); r(g, 542, 298, 36, 10, '#c4a468');
  r(g, 470, 90, 20, 12, '#a2573d'); r(g, 474, 80, 12, 10, P.leaf);
  r(g, 500, 306, 8, 6, P.ink); r(g, 510, 306, 8, 6, P.ink);
  // partitions (phaseable)
  r(g, 222, 56, 4, 112, P.trim); r(g, 223, 56, 2, 112, P.woodL);
  r(g, 222, 250, 4, 110, P.trim); r(g, 223, 250, 2, 110, P.woodL);
  r(g, 226, 166, 194, 4, P.trim); r(g, 226, 167, 194, 1, P.woodL);
  r(g, 226, 248, 194, 3, P.trim);
  // door frames
  r(g, 220, 168, 8, 2, P.rug3); r(g, 220, 248, 8, 2, P.rug3);
  // warm ambient vignette
  g.globalAlpha = 0.12 + Math.sin(t * 1.5) * 0.02;
  r(g, 0, 56, 224, 304, P.lamp);
  g.globalAlpha = 1;
}

export function drawCat(g: CanvasRenderingContext2D, x: number, y: number, t: number, moving: boolean): void {
  const px = Math.round(x - 8), step = moving ? Math.floor(t * 8) % 2 : 0;
  const py = Math.round(y - 12) + (moving && step ? -1 : 0);
  const fur = '#d98c4a', dk = '#9a5a2e', lt = '#f3d2a0';
  const tail = Math.round(Math.sin(t * 3) * 2);
  // shadow
  g.globalAlpha = 0.3; r(g, px + 1, py + 13, 14, 2, '#000'); g.globalAlpha = 1;
  // tail
  r(g, px + 13, py + 5 + tail, 2, 6, dk); r(g, px + 13, py + 3 + tail, 2, 3, fur);
  // body
  r(g, px + 3, py + 6, 11, 7, fur); r(g, px + 4, py + 7, 3, 5, dk); r(g, px + 9, py + 7, 2, 5, dk);
  r(g, px + 5, py + 11, 7, 2, lt);
  // legs
  r(g, px + 4 + step, py + 12, 2, 3, lt); r(g, px + 11 - step, py + 12, 2, 3, lt);
  // head
  r(g, px, py + 2, 8, 7, fur); r(g, px, py, 2, 3, dk); r(g, px + 6, py, 2, 3, dk);
  r(g, px + 1, py + 6, 6, 3, lt);
  r(g, px + 1, py + 4, 2, 2, '#2a2a40'); r(g, px + 5, py + 4, 2, 2, '#2a2a40');
  r(g, px + 1, py + 4, 1, 1, '#f6cf62'); r(g, px + 5, py + 4, 1, 1, '#f6cf62');
  r(g, px + 3, py + 6, 2, 1, '#c4566e');
}
