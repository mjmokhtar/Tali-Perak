import { getNpcPosition, isBlessedActive, type Game, type Rect } from './engine';
import { drawHome, drawCat } from './home-art';
import { drawHospital, drawNurse, drawWallClock } from './hospital-art';
import { drawIcu, drawMonitorObject, drawMother } from './icu-art';

export const VW = 320;
export const VH = 180;

const C = {
  ink: '#070b18', night: '#0d1530', deep: '#101c40', teal: '#3fa7a0', tealD: '#1f5c68',
  violet: '#6b4fa0', violetD: '#2b2250', lamp: '#f6cf62', mist: '#b9cfe0', blood: '#c4566e',
  road: '#161d38', roadL: '#232d52', grass: '#10283a', grass2: '#143246', skin: '#d8b49a',
};

const hash = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

let dark: HTMLCanvasElement | null = null;
let lastX = 0;
let facing = 1;

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function building(g: CanvasRenderingContext2D, r: Rect, t: number, ch: number) {
  const seed = r.x * 7 + r.y * 13;
  if (r.w <= 24 && r.h <= 28) {
    // tree
    rect(g, r.x + r.w / 2 - 2, r.y + r.h - 10, 4, 10, '#2a1f3a');
    const sway = Math.sin(t * 1.2 + seed) * 1;
    rect(g, r.x + 1 + sway, r.y, r.w - 2, r.h - 8, ch ? '#1c3d4a' : '#17463f');
    rect(g, r.x + 4 + sway, r.y - 3, r.w - 8, 5, '#235a52');
    rect(g, r.x + 5, r.y + 6, 3, 3, '#2d7a6c');
    return;
  }
  rect(g, r.x, r.y, r.w, r.h, ch ? '#241c47' : '#1a2448');
  rect(g, r.x, r.y, r.w, 6, ch ? '#3a2d6b' : '#2a3566');
  rect(g, r.x - 1, r.y + 5, r.w + 2, 2, '#0a0f24');
  for (let wy = r.y + 12; wy < r.y + r.h - 8; wy += 14) {
    for (let wx = r.x + 6; wx < r.x + r.w - 8; wx += 12) {
      const on = hash(wx, wy + seed) > 0.62;
      rect(g, wx, wy, 6, 7, on ? C.lamp : '#0b1226');
      if (on) rect(g, wx, wy, 6, 1, '#fff2b0');
    }
  }
  rect(g, r.x + r.w / 2 - 4, r.y + r.h - 10, 8, 10, '#0a0f24');
}

function drawSpirit(g: CanvasRenderingContext2D, x: number, y: number, t: number, moving: boolean, f: number, cord: number) {
  const bob = Math.sin(t * 3) * 1.5;
  const px = Math.round(x - 8), py = Math.round(y - 14 + bob);
  g.globalAlpha = 0.9;
  // tail wisp
  for (let i = 0; i < 4; i++) rect(g, px + 4 + i * 2 - f * i, py + 20 + i + Math.sin(t * 5 + i) * 1, 6 - i, 2, C.teal);
  rect(g, px + 3, py + 9, 10, 11, '#e9f3f6');
  rect(g, px + 2, py + 12, 12, 7, '#cfe2ea');
  rect(g, px + 4, py + 2, 8, 8, C.skin);
  rect(g, px + 3, py + 1, 10, 4, '#14102a');
  rect(g, px + 3, py + 4, 2, 7, '#14102a');
  rect(g, px + 7 + f, py + 6, 1, 2, '#14102a');
  rect(g, px + 10 + f - (f > 0 ? 0 : 3), py + 6, 1, 2, '#14102a');
  const a = moving ? Math.sin(t * 12) * 2 : 0;
  rect(g, px + 1, py + 11 + a, 2, 5, '#cfe2ea');
  rect(g, px + 13, py + 11 - a, 2, 5, '#cfe2ea');
  g.globalAlpha = 0.35 + Math.sin(t * 4) * 0.1;
  rect(g, px - 1, py - 1, 18, 1, C.teal);
  g.globalAlpha = 1;
  if (cord < 30) {
    g.globalAlpha = 0.5;
    rect(g, px + 6, py - 4, 4, 1, C.blood);
    g.globalAlpha = 1;
  }
}

function drawGhost(g: CanvasRenderingContext2D, x: number, y: number, t: number, attack: number) {
  const px = Math.round(x), py = Math.round(y + Math.sin(t * 2 + x) * 2);
  g.globalAlpha = 0.8;
  rect(g, px - 7, py - 12, 14, 18, '#2a1d4d');
  rect(g, px - 5, py - 15, 10, 5, '#2a1d4d');
  for (let i = 0; i < 4; i++) rect(g, px - 7 + i * 4, py + 6 + (i % 2) * 3 + Math.sin(t * 6 + i), 3, 4, '#2a1d4d');
  rect(g, px - 4, py - 9, 3, 4, attack > 0 ? C.blood : C.mist);
  rect(g, px + 1, py - 9, 3, 4, attack > 0 ? C.blood : C.mist);
  if (attack > 0) {
    // reaching claws
    for (let i = 0; i < 3; i++) rect(g, px - 12 - i * 3, py - 2 + i * 3 + Math.sin(t * 30) * 1, 6, 2, '#5b3a8c');
  }
  g.globalAlpha = 1;
}

export function render(g: CanvasRenderingContext2D, game: Game, t: number) {
  const s = game.state;
  const a = game.area;
  g.imageSmoothingEnabled = false;
  const ch = s.chapter;
  if (!a || s.status === 'menu') {
    // title backdrop
    rect(g, 0, 0, VW, VH, C.ink);
    for (let i = 0; i < 40; i++) rect(g, hash(i, 1) * VW, (hash(i, 2) * VH + t * 90) % VH, 1, 4, 'rgba(120,160,200,.4)');
    for (let i = 0; i < 6; i++) { rect(g, i * 56 + 6, 100 - hash(i, 5) * 40, 40, 90, '#141c3e'); rect(g, i * 56 + 14, 108, 6, 7, hash(i, Math.floor(t / 3)) > 0.5 ? C.lamp : '#0b1226'); }
    return;
  }
  const ex = s.x, ey = s.y;
  const camX = Math.max(0, Math.min(a.width - VW, Math.round(ex - VW / 2)));
  const camY = Math.max(0, Math.min(a.height - VH, Math.round(ey - VH / 2)));
  g.save();
  g.translate(-camX, -camY);

  if (ch === 2) {
    drawHome(g, t);
  } else if (ch === 3) {
    drawHospital(g, t);
  } else if (ch === 4) {
    drawIcu(g, t, s.objects.includes('monitor-icu'));
  } else {
  // ground
  rect(g, 0, 0, a.width, a.height, ch ? '#101a38' : C.grass);
  for (let ty = 0; ty < a.height; ty += 16) for (let tx = 0; tx < a.width; tx += 16) {
    const h = hash(tx, ty);
    if ((tx / 16 + ty / 16) % 2 === 0) rect(g, tx, ty, 16, 16, ch ? '#121e40' : C.grass2);
    if (h > 0.9) rect(g, tx + 4, ty + 6, 2, 3, ch ? '#1d2c5a' : '#1c4a50');
  }
  // road band through the middle
  const ry = a.height / 2 - 24;
  rect(g, 0, ry, a.width, 48, C.road);
  rect(g, 0, ry, a.width, 2, C.roadL);
  rect(g, 0, ry + 46, a.width, 2, C.roadL);
  for (let x = 0; x < a.width; x += 32) rect(g, x + 4, ry + 23, 16, 2, '#8d86a8');
  // puddles
  for (let i = 0; i < 14; i++) {
    const px = hash(i, 9) * a.width, py = hash(i, 3) * a.height;
    rect(g, px, py, 14, 3, 'rgba(63,167,160,.22)');
    const rp = (t * 2 + i) % 2;
    if (rp < 1) rect(g, px + 5 - rp * 4, py, 4 + rp * 8, 1, 'rgba(185,207,224,.3)');
  }
  // road crash scene (chapter 1)
  if (ch === 0) {
    const cx = a.spawn.x - 70, cy = a.spawn.y - 10;
    rect(g, cx, cy, 44, 18, '#3b2a5c'); rect(g, cx + 8, cy - 8, 24, 9, '#2b2050');
    rect(g, cx + 10, cy - 6, 8, 6, '#6aa7b5'); rect(g, cx + 22, cy - 6, 8, 6, '#6aa7b5');
    rect(g, cx + 4, cy + 16, 8, 4, C.ink); rect(g, cx + 32, cy + 16, 8, 4, C.ink);
    rect(g, cx + 40, cy + 6, 6, 4, Math.sin(t * 6) > 0 ? C.lamp : '#7a6730');
    for (let i = 0; i < 6; i++) rect(g, cx + 50 + hash(i, 1) * 24, cy + 6 + hash(i, 2) * 14, 2, 1, '#8fc4d4');
    for (let i = 0; i < 4; i++) rect(g, cx + 20 + Math.sin(t + i) * 4, cy - 14 - ((t * 8 + i * 6) % 24), 3, 3, 'rgba(150,160,190,.3)');
    rect(g, cx - 14, cy + 22, 12, 4, '#26366a');
  }
  }
  // blessed ground
  for (const [bi, b] of a.blessed.entries()) {
    if (!isBlessedActive(s.chapter, bi, s.objects)) continue;
    g.globalAlpha = 0.28 + Math.sin(t * 2) * 0.08;
    rect(g, b.x, b.y, b.w, b.h, C.teal);
    g.globalAlpha = 0.6;
    rect(g, b.x, b.y, b.w, 1, C.teal); rect(g, b.x, b.y + b.h - 1, b.w, 1, C.teal);
    rect(g, b.x, b.y, 1, b.h, C.teal); rect(g, b.x + b.w - 1, b.y, 1, b.h, C.teal);
    g.globalAlpha = 1;
    for (let i = 0; i < Math.max(2, (b.w * b.h) / 400); i++)
      rect(g, b.x + hash(i, b.x) * b.w, b.y + ((hash(i, b.y) * b.h - t * 6 + 1000) % b.h), 1, 1, '#d6fff8');
  }
  // exit (in the ICU the exit is the bed, which is drawn with the room)
  const e = a.exit;
  if (ch < 4) {
    g.globalAlpha = 0.35 + Math.sin(t * 3) * 0.15;
    rect(g, e.x, e.y, e.w, e.h, C.lamp);
    g.globalAlpha = 1;
    rect(g, e.x + e.w / 2 - 1, e.y + e.h / 2 - 6 + Math.sin(t * 4) * 2, 2, 8, C.lamp);
    rect(g, e.x + e.w / 2 - 3, e.y + e.h / 2 + Math.sin(t * 4) * 2, 6, 2, C.lamp);
  } else if (s.objects.includes('monitor-icu')) {
    g.globalAlpha = 0.12 + Math.sin(t * 3) * 0.06;
    rect(g, e.x, e.y, e.w, e.h, C.lamp);
    g.globalAlpha = 1;
  }
  // walls (phaseable: slightly translucent)
  if (ch < 2) for (const w of a.walls) { g.globalAlpha = 0.92; building(g, w, t, ch); g.globalAlpha = 1; }
  // lamp posts
  for (const l of a.lights) {
    rect(g, l.x - 1, l.y - 4, 2, 18, '#0a0f24');
    rect(g, l.x - 3, l.y - 7, 6, 4, C.lamp);
    rect(g, l.x - 3, l.y - 8, 6, 1, '#fff2b0');
  }
  // objects
  for (const o of a.objects) {
    const on = s.objects.includes(o.id);
    if (o.type === 'radio') {
      rect(g, o.x - 6, o.y - 5, 12, 9, '#3b2a5c'); rect(g, o.x - 4, o.y - 3, 5, 5, on ? C.lamp : '#14102a');
      rect(g, o.x + 3, o.y - 2, 2, 2, C.teal); rect(g, o.x + 3, o.y - 9, 1, 4, C.mist);
      if (on) for (let i = 0; i < 2; i++) rect(g, o.x + 8 + i * 3, o.y - 4 - i, 1, 6 + i * 2, 'rgba(246,207,98,.5)');
    } else if (o.type === 'monitor') {
      drawMonitorObject(g, o.x, o.y, t, on);
    } else if (o.type === 'clock') {
      drawWallClock(g, o.x, o.y, t, on);
    } else if (o.type === 'door') {
      rect(g, o.x + 3, o.y - 32, 10, 64, '#654454');
      rect(g, o.x + 5, o.y - 30, 6, 60, on ? '#182b3a' : '#38293b');
      if (!on) rect(g, o.x + 6, o.y - 1, 2, 3, C.lamp);
    } else {
      rect(g, o.x - 1, o.y - 8, 2, 14, '#0a0f24');
      rect(g, o.x - 4, o.y - 12, 8, 6, on ? C.lamp : '#4b3a6b');
      if (on) rect(g, o.x - 4, o.y - 13, 8, 1, '#fff2b0');
    }
  }
  // npcs
  for (const n of a.npcs) {
    if (n.id === 'nurse-hospital') {
      const p = getNpcPosition(n, s);
      drawNurse(g, p.x, p.y, t, Math.cos(s.elapsed * 0.55) >= 0 ? 1 : -1);
      continue;
    }
    if (n.id === 'mother-icu') { drawMother(g, n.x, n.y, t); continue; }
    if (n.id === 'cat-home') {
      const p = getNpcPosition(n, s);
      drawCat(g, p.x, p.y, t, s.objects.includes('radio-home') && s.catProgress < 1);
      continue;
    }
    const b = Math.sin(t * 2 + n.x) * 1;
    g.globalAlpha = 0.85;
    rect(g, n.x - 5, n.y - 8 + b, 10, 14, '#7b8fb8');
    rect(g, n.x - 4, n.y - 14 + b, 8, 7, C.skin);
    rect(g, n.x - 4, n.y - 15 + b, 8, 3, '#2a2a40');
    g.globalAlpha = 1;
  }
  // fragments
  for (const f of a.fragments) {
    if (s.fragments.includes(f.id) || s.objects.includes(`spent-${f.id}`)) continue;
    const fy = f.y + Math.sin(t * 3 + f.x) * 3;
    g.globalAlpha = 0.25; rect(g, f.x - 8, fy - 8, 16, 16, C.lamp);
    g.globalAlpha = 1;
    rect(g, f.x - 1, fy - 5, 2, 10, '#fff2b0'); rect(g, f.x - 3, fy - 3, 6, 6, C.lamp); rect(g, f.x - 5, fy - 1, 10, 2, '#fff2b0');
  }
  // cord
  const cordN = Math.max(0, Math.min(1, s.cord / 100));
  const sx = a.spawn.x, sy = a.spawn.y;
  g.globalAlpha = 0.4 + cordN * 0.6;
  const segs = Math.max(6, Math.min(40, Math.hypot(ex - sx, ey - sy) / 6));
  for (let i = 0; i <= segs; i++) {
    const k = i / segs;
    const x = sx + (ex - sx) * k, y = sy + (ey - sy) * k + Math.sin(k * Math.PI) * 10 + Math.sin(t * 3 + k * 8) * 1.5 * (1 - cordN + 0.3);
    if (i % 2 === 0 || cordN > 0.3) rect(g, x, y, 2, 2, cordN > 0.3 ? C.lamp : C.blood);
  }
  g.globalAlpha = 1;
  // ghosts
  const el = s.elapsed;
  for (const gh of a.ghosts) {
    const gx = gh.x + (gh.axis === 'x' ? Math.sin(el * gh.speed) * gh.range : 0);
    const gy = gh.y + (gh.axis === 'y' ? Math.sin(el * gh.speed) * gh.range : 0);
    drawGhost(g, gx, gy, t, s.attack);
  }
  // player
  if (Math.abs(ex - lastX) > 0.05) facing = ex > lastX ? 1 : -1;
  const moving = Math.abs(ex - lastX) > 0.05;
  lastX = ex;
  drawSpirit(g, ex, ey, t, moving, facing, s.cord);
  // attack ring
  if (s.attack > 0) {
    for (let i = 0; i < 3; i++) {
      const r = 6 + ((t * 40 + i * 8) % 24);
      g.globalAlpha = 0.5;
      rect(g, ex - r, ey - 2, r * 2, 1, C.blood);
      rect(g, ex - 1, ey - r, 1, r * 2, C.violet);
    }
    g.globalAlpha = 1;
  }
  g.restore();

  // Rain stays outside; the home chapter is sheltered.
  if (ch < 2) {
  // rain
  g.fillStyle = 'rgba(160,200,230,.45)';
  for (let i = 0; i < 70; i++) {
    const x = (hash(i, 7) * (VW + 40) - ((t * 60 + i) % 12)) % VW;
    const y = (hash(i, 8) * VH + t * 220 * (0.7 + hash(i, 4) * 0.6)) % VH;
    g.fillRect(Math.round(x < 0 ? x + VW : x), Math.round(y), 1, 4);
  }
  }

  // darkness with lamp cut-outs
  if (!dark) { dark = document.createElement('canvas'); dark.width = VW; dark.height = VH; }
  const d = dark.getContext('2d')!;
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, VW, VH);
  d.fillStyle = ch === 2 ? 'rgba(18,10,25,.34)' : ch === 3 ? 'rgba(8,18,30,.5)' : ch === 4 ? 'rgba(6,14,26,.5)' : ch ? 'rgba(6,6,24,.62)' : 'rgba(5,10,28,.55)';
  d.fillRect(0, 0, VW, VH);
  d.globalCompositeOperation = 'destination-out';
  const hole = (x: number, y: number, r: number, k: number) => {
    const gr = d.createRadialGradient(x - camX, y - camY, 2, x - camX, y - camY, r);
    gr.addColorStop(0, `rgba(0,0,0,${k})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = gr; d.fillRect(x - camX - r, y - camY - r, r * 2, r * 2);
  };
  for (const l of a.lights) hole(l.x, l.y - 4, 46 + Math.sin(t * 5 + l.x) * 2, 0.95);
  for (const o of a.objects) if (s.objects.includes(o.id)) hole(o.x, o.y - 6, 40, 0.9);
  hole(ex, ey - 4, 26 + cordN * 14, 0.7);
  g.drawImage(dark, 0, 0);
  // lamp warmth
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.1;
  for (const l of a.lights) {
    g.fillStyle = C.lamp;
    g.beginPath(); g.arc(l.x - camX, l.y - camY - 4, 22, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  // low-cord vignette & attack flash
  if (s.cord < 30 || s.attack > 0) {
    g.globalAlpha = s.attack > 0 ? 0.25 + Math.sin(t * 30) * 0.08 : 0.18 * (1 - s.cord / 30);
    rect(g, 0, 0, VW, 6, C.blood); rect(g, 0, VH - 6, VW, 6, C.blood); rect(g, 0, 0, 6, VH, C.blood); rect(g, VW - 6, 0, 6, VH, C.blood);
    g.globalAlpha = 1;
  }
}
