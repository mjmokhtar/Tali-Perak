const P = {
  wall: '#cfe0e0', wallD: '#9db8bc', trim: '#6f8f98', floor: '#a8c0c2', floor2: '#93aeb2', line: '#3fa7a0',
  ink: '#14102a', white: '#f2f7f5', red: '#c4566e', lamp: '#f6cf62', teal: '#3fa7a0', wood: '#6b4630',
  chair: '#3d6a8a', chairD: '#2c4a68', bed: '#e8eef0', blanket: '#6a9fb5', icu: '#28485a', icuD: '#1a3342',
  night: '#10203f', skin: '#d8b49a',
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
  r(g, x, y + 18, 32, 8, '#16264a');
  for (let i = 0; i < 9; i++) r(g, x + 2 + hash(i, x) * 28, (hash(i, 3) * 26 + t * 40) % 26 + y, 1, 3, 'rgba(160,200,230,.6)');
  r(g, x + 15, y, 2, 26, P.trim); r(g, x, y + 12, 32, 2, P.trim);
}

function chair(g: CanvasRenderingContext2D, x: number, y: number) {
  r(g, x, y, 12, 5, P.chairD); r(g, x + 1, y + 5, 10, 6, P.chair);
  r(g, x + 1, y + 11, 2, 4, P.trim); r(g, x + 9, y + 11, 2, 4, P.trim);
}

function bed(g: CanvasRenderingContext2D, x: number, y: number) {
  r(g, x, y, 40, 22, P.trim); r(g, x + 1, y + 1, 38, 20, P.bed);
  r(g, x + 2, y + 3, 11, 8, P.white);
  r(g, x + 14, y + 2, 25, 18, P.blanket); r(g, x + 14, y + 2, 25, 2, '#8ec0d2');
  r(g, x - 1, y + 21, 3, 3, P.ink); r(g, x + 38, y + 21, 3, 3, P.ink);
}

function ivStand(g: CanvasRenderingContext2D, x: number, y: number, t: number) {
  r(g, x, y, 2, 30, P.trim); r(g, x - 4, y + 29, 10, 2, P.trim);
  r(g, x - 3, y - 6, 8, 11, '#d7ecf2'); r(g, x - 2, y - 1, 6, 5, '#8ec0d2');
  r(g, x + 1, y + 5, 1, 9 + Math.floor((t * 2) % 2), '#d7ecf2');
}

function monitor(g: CanvasRenderingContext2D, x: number, y: number, t: number) {
  r(g, x, y, 28, 20, P.ink); r(g, x + 2, y + 2, 24, 14, '#0b2a24');
  for (let i = 0; i < 24; i++) {
    const ph = (i - (t * 18) % 24 + 24) % 24;
    const beat = ph < 2 ? -6 : ph < 4 ? 4 : ph < 5 ? -2 : 0;
    r(g, x + 2 + i, y + 9 + beat, 1, 1, i < 4 ? '#2d7a6c' : '#7dfcd0');
  }
  r(g, x + 10, y + 20, 8, 4, P.trim);
}

export function drawHospital(g: CanvasRenderingContext2D, t: number): void {
  g.imageSmoothingEnabled = false;
  r(g, 0, 0, 640, 360, P.wall);
  r(g, 0, 0, 640, 56, P.wall);
  r(g, 0, 40, 640, 4, P.wallD); r(g, 0, 50, 640, 6, P.trim);
  // checker floor
  for (let y = 56; y < 360; y += 16) for (let x = 0; x < 640; x += 16)
    r(g, x, y, 16, 16, ((x + y) / 16) % 2 ? P.floor : P.floor2);
  // corridor guide line
  r(g, 0, 211, 450, 2, P.line);
  for (let x = 20; x < 440; x += 40) r(g, x, 207, 8, 10, P.line);
  // windows
  for (const x of [28, 120, 260, 340, 500]) window_(g, x, 12, t);
  // lobby: carpet, reception desk, waiting chairs
  r(g, 24, 70, 150, 60, '#2c4a68'); r(g, 28, 74, 142, 52, '#35587a');
  for (let i = 0; i < 6; i++) chair(g, 36 + i * 22, 82);
  r(g, 128, 130, 84, 16, P.trim); r(g, 128, 130, 84, 4, '#e8eef0');
  r(g, 140, 124, 14, 8, P.ink); r(g, 142, 126, 10, 4, '#7dfcd0');
  r(g, 24, 300, 70, 8, P.trim); for (let i = 0; i < 4; i++) chair(g, 30 + i * 18, 308);
  // rooms with beds
  bed(g, 244, 70); bed(g, 316, 70); ivStand(g, 290, 74, t);
  bed(g, 244, 276); bed(g, 316, 276); ivStand(g, 360, 276, t);
  r(g, 390, 60, 40, 52, P.wallD);
  r(g, 392, 62, 36, 48, P.white); r(g, 396, 70, 28, 4, P.red); r(g, 408, 66, 4, 12, P.red);
  // room partitions
  r(g, 222, 56, 4, 112, P.trim); r(g, 222, 250, 4, 110, P.trim);
  r(g, 226, 166, 218, 4, P.trim); r(g, 226, 248, 218, 3, P.trim);
  // ICU section beyond the double doors
  r(g, 452, 56, 188, 304, P.icu);
  for (let y = 56; y < 360; y += 16) for (let x = 452; x < 640; x += 16)
    if (((x + y) / 16) % 2) r(g, x, y, 16, 16, P.icuD);
  window_(g, 500, 12, t);
  monitor(g, 480, 70, t); monitor(g, 560, 70, t + 1.3);
  bed(g, 500, 120); ivStand(g, 552, 124, t);
  r(g, 470, 276, 120, 10, P.icuD);
  // soft ward light and a faint cold wash
  g.globalAlpha = 0.05 + Math.sin(t * 1.1) * 0.01;
  r(g, 0, 56, 450, 304, '#ffffff');
  g.globalAlpha = 1;
}

export function drawWallClock(g: CanvasRenderingContext2D, x: number, y: number, t: number, on: boolean): void {
  r(g, x - 8, y - 22, 16, 34, P.wood); r(g, x - 6, y - 20, 12, 12, '#efe6cf');
  r(g, x - 1, y - 18, 2, 5, P.ink); r(g, x, y - 14, 4, 2, P.ink);
  r(g, x - 6, y - 5, 12, 14, '#4b2f22');
  const sw = on ? Math.round(Math.sin(t * 6) * 3) : 0;
  r(g, x - 1 + sw, y + 1, 2, 5, P.lamp);
  if (on) { g.globalAlpha = 0.25 + Math.sin(t * 6) * 0.1; r(g, x - 12, y - 24, 24, 38, P.lamp); g.globalAlpha = 1; }
}

export function drawNurse(g: CanvasRenderingContext2D, x: number, y: number, t: number, facing: number): void {
  const px = Math.round(x - 6), py = Math.round(y - 15 + Math.sin(t * 6) * 0.5);
  g.globalAlpha = 0.3; r(g, px - 1, py + 20, 14, 2, '#000'); g.globalAlpha = 1;
  const step = Math.floor(t * 6) % 2;
  r(g, px + 2, py + 17, 3, 4 - step, '#6f8f98'); r(g, px + 7, py + 17, 3, 3 + step, '#6f8f98');
  r(g, px + 1, py + 8, 10, 11, P.white); r(g, px + 1, py + 8, 10, 1, '#d7ecf2');
  r(g, px + 5, py + 10, 2, 5, P.red); r(g, px + 4, py + 12, 4, 2, P.red);
  r(g, px + 3, py + 1, 6, 7, P.skin);
  r(g, px + 2, py - 1, 8, 3, '#2a2a40');
  r(g, px + 3, py - 2, 6, 2, P.white);
  r(g, px + 5 + facing * 2, py + 4, 1, 2, P.ink);
  r(g, px + (facing > 0 ? 9 : -1), py + 10, 3, 6, '#e8eef0');
  r(g, px + (facing > 0 ? 11 : -3), py + 11, 4, 5, '#3d6a8a');
}
