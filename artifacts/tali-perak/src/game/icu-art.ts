const P = {
  floor: '#1f3d4c', floor2: '#183342', wall: '#2c5062', wallD: '#1a3342', trim: '#6f8f98', ink: '#14102a',
  white: '#e8eef0', blanket: '#6a9fb5', blanketL: '#8ec0d2', skin: '#d8b49a', hair: '#14102a', night: '#10203f',
  green: '#7dfcd0', red: '#c4566e', lamp: '#f6cf62', chair: '#3d6a8a', chairD: '#2c4a68',
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

function window_(g: CanvasRenderingContext2D, x: number, y: number, t: number) {
  r(g, x - 1, y - 1, 34, 28, P.trim); r(g, x, y, 32, 26, P.night);
  for (let i = 0; i < 8; i++) r(g, x + 2 + hash(i, x) * 28, (hash(i, 3) * 26 + t * 40) % 26 + y, 1, 3, 'rgba(160,200,230,.5)');
  r(g, x + 15, y, 2, 26, P.trim);
}

function trace(g: CanvasRenderingContext2D, x: number, y: number, w: number, t: number, steady: boolean) {
  for (let i = 0; i < w; i++) {
    const ph = (i - (t * 18) % w + w) % w;
    const jitter = steady ? 0 : (hash(i, Math.floor(t * 8)) - 0.5) * 7;
    const beat = steady ? (ph < 2 ? -6 : ph < 4 ? 4 : ph < 5 ? -2 : 0) : jitter;
    r(g, x + i, y + beat, 1, 1, i < 4 ? '#2d7a6c' : steady ? P.green : '#e08ca0');
  }
}

/** Intensive-care room. `steady` is true once the player has calmed the monitor. */
export function drawIcu(g: CanvasRenderingContext2D, t: number, steady: boolean): void {
  g.imageSmoothingEnabled = false;
  r(g, 0, 0, 640, 360, P.wall);
  r(g, 0, 40, 640, 4, P.wallD); r(g, 0, 50, 640, 6, P.trim);
  for (let y = 56; y < 360; y += 16) for (let x = 0; x < 640; x += 16)
    r(g, x, y, 16, 16, ((x + y) / 16) % 2 ? P.floor : P.floor2);
  for (const x of [28, 130, 230, 430, 540]) window_(g, x, 12, t);
  // left side: waiting bench and a supply cabinet
  r(g, 24, 296, 76, 8, P.trim); for (let i = 0; i < 4; i++) { r(g, 28 + i * 18, 304, 12, 5, P.chairD); r(g, 29 + i * 18, 309, 10, 6, P.chair); }
  r(g, 120, 66, 44, 36, P.wallD); r(g, 122, 68, 40, 32, '#3a6578'); r(g, 141, 68, 2, 32, P.wallD);
  r(g, 126, 76, 4, 3, P.lamp); r(g, 148, 76, 4, 3, P.lamp);
  // right side: wall monitors above the bed
  for (const [x, o] of [[470, 0], [556, 1.3]] as const) {
    r(g, x, 64, 44, 30, P.ink); r(g, x + 2, 66, 40, 20, '#0b2a24');
    trace(g, x + 4, 76, 36, t + o, steady);
    r(g, x + 4, 88, 8, 3, steady ? P.green : P.red);
  }
  // bed with the body
  r(g, 496, 156, 106, 52, P.trim); r(g, 498, 158, 102, 48, P.white);
  r(g, 574, 164, 22, 34, '#f5f8f8');
  r(g, 580, 170, 10, 10, P.skin); r(g, 579, 167, 12, 5, P.hair); r(g, 579, 170, 2, 8, P.hair);
  r(g, 504, 164, 70, 38, P.blanket); r(g, 504, 164, 70, 3, P.blanketL);
  r(g, 494, 206, 5, 5, P.ink); r(g, 599, 206, 5, 5, P.ink);
  // body's faint glow, slow like breathing
  g.globalAlpha = 0.1 + Math.sin(t * 1.5) * 0.05;
  r(g, 490, 148, 118, 68, P.green);
  g.globalAlpha = 1;
  // IV stand beside the bed
  r(g, 612, 130, 2, 52, P.trim); r(g, 606, 180, 14, 2, P.trim);
  r(g, 608, 124, 8, 11, '#d7ecf2'); r(g, 609, 129, 6, 5, P.blanketL);
  // chair for the visitor
  r(g, 486, 232, 28, 6, P.chairD); r(g, 488, 238, 24, 12, P.chair); r(g, 488, 250, 3, 8, P.trim); r(g, 509, 250, 3, 8, P.trim);
  r(g, 496, 292, 120, 8, P.wallD);
  // soft cold light
  g.globalAlpha = 0.04 + Math.sin(t * 1.1) * 0.01;
  r(g, 0, 56, 640, 304, '#ffffff');
  g.globalAlpha = 1;
}

export function drawMonitorObject(g: CanvasRenderingContext2D, x: number, y: number, t: number, steady: boolean): void {
  r(g, x - 16, y - 30, 32, 24, P.ink); r(g, x - 14, y - 28, 28, 16, '#0b2a24');
  trace(g, x - 12, y - 20, 24, t, steady);
  r(g, x - 3, y - 6, 6, 8, P.trim); r(g, x - 10, y + 2, 20, 3, P.trim);
  r(g, x + 9, y - 10, 3, 2, steady ? P.green : P.red);
}

export function drawMother(g: CanvasRenderingContext2D, x: number, y: number, t: number): void {
  const sway = Math.sin(t * 1.2) * 0.5;
  const px = Math.round(x - 8), py = Math.round(y - 16 + sway);
  r(g, px + 1, py + 10, 14, 12, '#7b5a82');
  r(g, px + 3, py + 2, 10, 9, P.skin);
  r(g, px + 2, py, 12, 4, '#4a4a58'); r(g, px + 2, py + 3, 3, 8, '#4a4a58');
  r(g, px + 5, py + 6, 3, 1, P.ink); r(g, px + 9, py + 6, 3, 1, P.ink);
  r(g, px + 13, 211, 3, py + 12 - 211, '#7b5a82'); r(g, px + 12, 208, 5, 4, P.skin);
  r(g, px - 4, py + 22, 24, 3, '#5c4668');
}
