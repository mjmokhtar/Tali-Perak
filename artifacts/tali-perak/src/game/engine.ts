import { STORY } from './story';

export type Rect = { x: number; y: number; w: number; h: number };
export type Ending = 'home' | 'letgo';
export type Fragment = { id: string; x: number; y: number; title: string; text: string };
export type Area = {
  id: string; name: string; subtitle: string; width: number; height: number;
  spawn: { x: number; y: number }; walls: Rect[]; blessed: Rect[];
  lights: { x: number; y: number }[]; fragments: Fragment[];
  objects: { id: string; type: 'radio' | 'lamp' | 'door' | 'clock' | 'monitor'; x: number; y: number; label: string }[];
  npcs: { id: string; x: number; y: number; label: string }[];
  exit: Rect;
  ghosts: { x: number; y: number; axis: 'x' | 'y'; range: number; speed: number }[];
};
export type State = {
  name: string; slot: number; chapter: 0 | 1 | 2 | 3 | 4; x: number; y: number; cord: number;
  fragments: string[]; objects: string[];
  status: 'menu' | 'playing' | 'paused' | 'dialogue' | 'choice' | 'lost' | 'complete';
  dialogue: { title: string; text: string } | null;
  attack: number; elapsed: number; notice: string; catProgress: number;
  ending: Ending | null;
};
type Save = { version: 1; state: State; savedAt: string };
export const MEMORIES = STORY.memories;
const fragment = (id: string, x: number, y: number): Fragment => ({
  ...MEMORIES.find(m => m.id === id)!, x, y,
});
export const AREAS: Area[] = [
  {
    id: 'crash', name: 'Lokasi Kecelakaan', subtitle: 'Bab I · Malam yang terhenti',
    width: 640, height: 360, spawn: { x: 120, y: 212 },
    walls: [
      { x: 32, y: 32, w: 144, h: 96 }, { x: 256, y: 32, w: 160, h: 96 },
      { x: 448, y: 32, w: 144, h: 112 }, { x: 32, y: 272, w: 176, h: 64 },
      { x: 304, y: 264, w: 112, h: 72 },
    ],
    blessed: [{ x: 228, y: 16, w: 8, h: 152 }, { x: 228, y: 244, w: 8, h: 100 }],
    lights: [{ x: 112, y: 160 }, { x: 368, y: 224 }, { x: 556, y: 176 }],
    fragments: [fragment('rain', 104, 80), fragment('call', 338, 304), fragment('impact', 500, 84)],
    objects: [{ id: 'radio-crash', type: 'radio', x: 182, y: 216, label: 'Radio mobil' }],
    npcs: [{ id: 'bima-crash', x: 400, y: 184, label: 'Bima' }],
    exit: { x: 592, y: 176, w: 32, h: 64 }, ghosts: [],
  },
  {
    id: 'city', name: 'Jalan Kota', subtitle: 'Bab II · Jalan yang mengingat',
    width: 640, height: 360, spawn: { x: 48, y: 208 },
    walls: [
      { x: 32, y: 32, w: 128, h: 96 }, { x: 256, y: 32, w: 144, h: 112 },
      { x: 464, y: 32, w: 144, h: 96 }, { x: 48, y: 272, w: 128, h: 64 },
      { x: 280, y: 272, w: 128, h: 64 }, { x: 480, y: 272, w: 128, h: 64 },
    ],
    blessed: [
      { x: 208, y: 16, w: 8, h: 160 }, { x: 208, y: 256, w: 8, h: 88 },
      { x: 432, y: 16, w: 8, h: 248 }, { x: 572, y: 156, w: 8, h: 96 },
    ],
    lights: [{ x: 128, y: 192 }, { x: 320, y: 224 }, { x: 512, y: 224 }],
    fragments: [fragment('work', 96, 80), fragment('friend', 340, 304), fragment('home', 544, 80)],
    objects: [{ id: 'lamp-city', type: 'lamp', x: 520, y: 248, label: 'Lampu gerbang' }],
    npcs: [{ id: 'bima-city', x: 164, y: 212, label: 'Bima' }, { id: 'lost-spirit', x: 368, y: 160, label: 'Arwah tersesat' }],
    exit: { x: 592, y: 176, w: 32, h: 64 },
    ghosts: [{ x: 306, y: 184, axis: 'x', range: 62, speed: 0.75 }, { x: 476, y: 168, axis: 'y', range: 56, speed: 0.85 }],
  },
  {
    id: 'house', name: 'Rumah Laras', subtitle: 'Bab III · Rumah yang menunggu',
    width: 640, height: 360, spawn: { x: 48, y: 212 },
    walls: [{ x: 224, y: 16, w: 8, h: 156 }, { x: 16, y: 168, w: 400, h: 8 }],
    blessed: [{ x: 420, y: 0, w: 8, h: 360 }],
    lights: [{ x: 92, y: 240 }, { x: 300, y: 224 }, { x: 520, y: 224 }],
    fragments: [fragment('family-table', 96, 96), fragment('cat-blanket', 304, 128), fragment('promise', 312, 304)],
    objects: [
      { id: 'radio-home', type: 'radio', x: 280, y: 96, label: 'Radio kamar' },
      { id: 'lamp-home', type: 'lamp', x: 92, y: 240, label: 'Lampu meja' },
      { id: 'door-home', type: 'door', x: 416, y: 212, label: 'Pintu belakang' },
    ],
    npcs: [{ id: 'cat-home', x: 160, y: 212, label: 'Kucingmu' }],
    exit: { x: 592, y: 176, w: 32, h: 64 }, ghosts: [],
  },
  {
    id: 'hospital', name: 'Rumah Sakit Harapan', subtitle: 'Bab IV · Jam kunjungan',
    width: 640, height: 360, spawn: { x: 48, y: 212 },
    walls: [],
    blessed: [{ x: 444, y: 0, w: 8, h: 360 }],
    lights: [{ x: 92, y: 240 }, { x: 300, y: 150 }, { x: 520, y: 224 }],
    fragments: [fragment('waiting-room', 70, 120), fragment('unsaid', 330, 312), fragment('hands', 540, 92)],
    objects: [
      { id: 'clock-hospital', type: 'clock', x: 170, y: 84, label: 'Jam besar' },
      { id: 'door-hospital', type: 'door', x: 436, y: 212, label: 'Pintu ICU' },
    ],
    npcs: [{ id: 'nurse-hospital', x: 350, y: 212, label: 'Perawat jaga' }],
    exit: { x: 592, y: 176, w: 32, h: 64 },
    ghosts: [{ x: 200, y: 130, axis: 'y', range: 50, speed: 0.8 }, { x: 330, y: 262, axis: 'x', range: 70, speed: 0.9 }],
  },
  {
    id: 'icu', name: 'Ruang Intensif', subtitle: 'Bab V · Pilihan',
    width: 640, height: 360, spawn: { x: 48, y: 212 },
    walls: [],
    blessed: [{ x: 380, y: 0, w: 8, h: 360 }],
    lights: [{ x: 92, y: 240 }, { x: 300, y: 220 }, { x: 520, y: 250 }],
    fragments: [fragment('icu-machine', 70, 110), fragment('mother-voice', 250, 310), fragment('last-wish', 590, 110)],
    objects: [{ id: 'monitor-icu', type: 'monitor', x: 330, y: 108, label: 'Monitor detak' }],
    npcs: [{ id: 'mother-icu', x: 500, y: 244, label: 'Ibu' }],
    // The exit rectangle is the bed: reaching it starts the final choice.
    exit: { x: 478, y: 150, w: 130, h: 64 },
    ghosts: [{ x: 250, y: 160, axis: 'y', range: 60, speed: 0.8 }, { x: 560, y: 300, axis: 'x', range: 50, speed: 0.9 }],
  },
];
/** Memories needed (found or shared) before the player may choose to go home. */
export const HOME_MEMORY_REQUIREMENT = 12;
export function countMemories(state: Pick<State, 'fragments' | 'objects'>) {
  const spent = state.objects.filter(o => o.startsWith('spent-')).map(o => o.slice('spent-'.length));
  return MEMORIES.filter(m => state.fragments.includes(m.id) || spent.includes(m.id)).length;
}
const fresh = (): State => ({
  name: 'Laras', slot: 1, chapter: 0, x: 120, y: 212, cord: 100,
  fragments: [], objects: [], status: 'menu', dialogue: null, attack: 0, elapsed: 0, notice: '', catProgress: 0, ending: null,
});
const key = (slot: number) => `tali-perak-save-${slot}`;
const near = (a: { x: number; y: number }, b: { x: number; y: number }, radius: number) =>
  Math.hypot(a.x - b.x, a.y - b.y) < radius;
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
function readSave(slot: number): Save | null {
  try {
    const raw = localStorage.getItem(key(slot));
    if (!raw) return null;
    const data = JSON.parse(raw) as Save;
    const s = data.state;
    if (data.version !== 1 || !s || typeof s.name !== 'string' || ![0, 1, 2, 3, 4].includes(s.chapter) ||
      !Number.isFinite(s.x) || !Number.isFinite(s.y) || !Number.isFinite(s.cord) ||
      !Number.isFinite(s.elapsed) || !Array.isArray(s.fragments) || !s.fragments.every(f => typeof f === 'string') ||
      !Array.isArray(s.objects) || !s.objects.every(o => typeof o === 'string') ||
      typeof data.savedAt !== 'string') return null;
    return data;
  } catch { return null; }
}
export function getSaves() {
  return [1, 2, 3].map(slot => {
    const save = readSave(slot);
    return save ? { slot, name: save.state.name, chapter: save.state.chapter, cord: save.state.cord, savedAt: save.savedAt } : null;
  });
}

/** Memory ids a slot has found, including ones later shared with the lost spirit. */
export function getCollectedMemories(slot: number): string[] {
  const s = readSave(slot)?.state;
  if (!s) return [];
  const spent = s.objects.filter(o => o.startsWith('spent-')).map(o => o.slice('spent-'.length));
  return MEMORIES.map(m => m.id).filter(id => s.fragments.includes(id) || spent.includes(id));
}

/** Shared by interactions and drawing, so the cat can never appear away from its hitbox. */
export function getNpcPosition(npc: Area['npcs'][number], state: State) {
  if (npc.id === 'nurse-hospital') return { x: npc.x + NURSE_RANGE * Math.sin(state.elapsed * 0.55), y: npc.y };
  if (npc.id !== 'cat-home') return { x: npc.x, y: npc.y };
  return { x: npc.x + 230 * clamp(state.catProgress, 0, 1), y: npc.y };
}
const NURSE_RANGE = 70;
/** The nurse blocks the ICU door while she is standing close to it. */
export const NURSE_GUARD_DISTANCE = 70;
export function isBlessedActive(chapter: State['chapter'], index: number, objects: string[]) {
  if (chapter === 1 && index === 3 && objects.includes('lamp-city')) return false;
  if (chapter === 2 && index === 0 && objects.includes('door-home')) return false;
  if (chapter === 3 && index === 0 && objects.includes('door-hospital')) return false;
  if (chapter === 4 && index === 0 && objects.includes('monitor-icu')) return false;
  return true;
}

export class Game {
  state = fresh();
  private publishTime = 0;
  private saveTime = 0;
  private invulnerable = 0;
  private offeredTrade = false;
  private pausedDialogue = false;
  constructor(private onChange: (state: State) => void) {}
  get area() { return AREAS[this.state.chapter]; }
  getSaves() { return getSaves(); }
  private publish() { this.onChange({ ...this.state, fragments: [...this.state.fragments], objects: [...this.state.objects] }); }
  private say(title: string, text: string) {
    this.state.dialogue = { title, text };
    this.state.status = 'dialogue';
    this.publish();
  }
  start(name: string, slot: number) {
    this.state = { ...fresh(), name: name.trim().slice(0, 24) || 'Laras', slot: clamp(Math.round(slot), 1, 3) };
    this.invulnerable = 0;
    this.offeredTrade = false;
    this.saveTime = 0;
    this.say(STORY.intro.title, STORY.intro.text);
    this.save();
  }
  load(slot: number) {
    const saved = readSave(slot);
    if (!saved) { this.state.notice = 'Simpanan tidak tersedia atau tidak dapat dibaca.'; this.publish(); return false; }
    const s = saved.state;
    this.state = {
      ...fresh(), ...s, slot, name: s.name.slice(0, 24),
      x: clamp(s.x, 8, 632), y: clamp(s.y, 14, 350), cord: clamp(s.cord, 1, 100),
      fragments: s.fragments.filter(id => MEMORIES.some(m => m.id === id)),
      objects: s.objects.filter(id => ['radio-crash', 'lamp-city', 'spirit-trade', 'radio-home', 'lamp-home', 'door-home', 'cat-guided', 'clock-hospital', 'door-hospital', 'monitor-icu'].includes(id) || MEMORIES.some(m => id === `spent-${m.id}`)),
      ending: s.ending === 'home' || s.ending === 'letgo' ? s.ending : null,
      elapsed: Math.max(0, s.elapsed), status: s.status === 'complete' && (s.chapter < AREAS.length - 1 || s.ending === 'home' || s.ending === 'letgo') ? 'complete' : 'playing',
      dialogue: null, attack: 0, notice: 'Perjalanan dilanjutkan.',
      catProgress: Number.isFinite(s.catProgress) ? clamp(s.catProgress, 0, 1) : 0,
    };
    this.invulnerable = 3;
    this.offeredTrade = false;
    // Old MVP completions become the next chapter without discarding collected memories.
    if (s.status === 'complete' && s.chapter < AREAS.length - 1) {
      this.enterNextChapter();
      this.save();
      return true;
    }
    this.publish();
    return true;
  }
  save(): boolean {
    if (this.state.status === 'menu' || this.state.status === 'lost') return false;
    try {
      const save: Save = { version: 1, state: { ...this.state }, savedAt: new Date().toISOString() };
      localStorage.setItem(key(this.state.slot), JSON.stringify(save));
      return true;
    } catch {
      this.state.notice = 'Browser tidak mengizinkan penyimpanan. Progres belum tersimpan.';
      this.publish();
      return false;
    }
  }
  setPaused(paused: boolean) {
    if (paused && (this.state.status === 'playing' || this.state.status === 'dialogue')) {
      this.pausedDialogue = this.state.status === 'dialogue';
      this.state.status = 'paused'; this.save();
    } else if (!paused && this.state.status === 'paused') {
      this.state.status = this.pausedDialogue && this.state.dialogue ? 'dialogue' : 'playing';
      this.pausedDialogue = false;
    }
    this.publish();
  }
  closeDialogue() {
    if (this.state.status !== 'dialogue') return;
    this.state.dialogue = null;
    this.state.status = 'playing';
    this.publish();
  }
  canGoHome() { return countMemories(this.state) >= HOME_MEMORY_REQUIREMENT; }
  cancelChoice() {
    if (this.state.status !== 'choice') return;
    this.state.dialogue = null;
    this.state.status = 'playing';
    this.publish();
  }
  chooseEnding(ending: Ending) {
    const s = this.state;
    if (s.status !== 'choice') return false;
    if (ending === 'home' && !this.canGoHome()) return false;
    s.ending = ending;
    s.dialogue = null;
    s.status = 'complete';
    this.save();
    this.publish();
    return true;
  }
  private enterNextChapter() {
    const s = this.state;
    s.chapter = (s.chapter + 1) as State['chapter'];
    Object.assign(s, this.area.spawn);
    s.cord = Math.max(s.cord, 65);
    s.attack = 0;
    s.notice = '';
    this.invulnerable = 3;
    const intro = [STORY.intro, STORY.chapter2, STORY.chapter3, STORY.chapter4, STORY.chapter5][s.chapter];
    this.say(intro.title, intro.text);
  }
  act() {
    const s = this.state;
    if (s.status === 'dialogue') { this.closeDialogue(); return; }
    if (s.status !== 'playing') return;
    const npc = this.area.npcs
      .filter(n => near(s, getNpcPosition(n, s), 28))
      .sort((a, b) => {
        const pa = getNpcPosition(a, s), pb = getNpcPosition(b, s);
        return Math.hypot(s.x - pa.x, s.y - pa.y) - Math.hypot(s.x - pb.x, s.y - pb.y);
      })[0];
    const object = this.area.objects
      .filter(o => near(s, o, 28) && (!npc ||
        Math.hypot(s.x - o.x, s.y - o.y) < Math.hypot(s.x - getNpcPosition(npc, s).x, s.y - getNpcPosition(npc, s).y)))
      .sort((a, b) => Math.hypot(s.x - a.x, s.y - a.y) - Math.hypot(s.x - b.x, s.y - b.y))[0];
    if (object) {
      if (object.id === 'door-home' && !s.objects.includes('cat-guided')) {
        this.say(object.label, STORY.doorLocked);
        return;
      }
      if (object.id === 'door-hospital') {
        const nurse = this.area.npcs[0], pos = getNpcPosition(nurse, s);
        if (!s.objects.includes('clock-hospital')) { this.say(object.label, STORY.icuLocked); return; }
        if (!s.objects.includes(object.id) && Math.hypot(pos.x - object.x, pos.y - object.y) < NURSE_GUARD_DISTANCE) {
          this.say(object.label, STORY.nurseGuarding);
          return;
        }
      }
      if (!s.objects.includes(object.id)) s.objects.push(object.id);
      const text = object.id === 'monitor-icu' ? STORY.icuMonitor : object.id === 'clock-hospital' ? STORY.hospitalClock :
        object.id === 'door-hospital' ? STORY.icuDoor : object.id === 'radio-home' ? STORY.homeRadio :
        object.id === 'lamp-home' ? STORY.homeLamp :
        object.id === 'door-home' ? STORY.homeDoor : object.type === 'radio' ? STORY.radio : STORY.lamp;
      this.say(object.label, text);
      this.save();
      return;
    }
    if (npc) {
      if (npc.id === 'mother-icu') {
        this.say(npc.label, STORY.motherIcu);
      } else if (npc.id === 'nurse-hospital') {
        this.say(npc.label, s.objects.includes('clock-hospital') ? STORY.nurseAfterClock : STORY.nurseBeforeClock);
      } else if (npc.id === 'cat-home') {
        if (!s.objects.includes('radio-home')) this.say(npc.label, STORY.catWaiting);
        else if (s.catProgress < 1) this.say(npc.label, STORY.catWalking);
        else {
          if (!s.objects.includes('cat-guided')) s.objects.push('cat-guided');
          this.say(npc.label, STORY.catReady);
          this.save();
        }
      } else if (npc.id === 'lost-spirit') {
        if (s.objects.includes('spirit-trade')) this.say(npc.label, STORY.spiritHint);
        else if (this.offeredTrade && s.fragments.length > 0) {
          // Trade a local fragment first, leaving earlier chapter records intact.
          const local = this.area.fragments.find(f => s.fragments.includes(f.id));
          const id = local?.id ?? s.fragments[s.fragments.length - 1];
          s.fragments = s.fragments.filter(f => f !== id);
          s.objects.push(`spent-${id}`);
          s.objects.push('spirit-trade');
          this.say(npc.label, STORY.spiritHint);
          this.save();
        } else { this.offeredTrade = true; this.say(npc.label, STORY.lostSpirit); }
      } else this.say(npc.label, s.chapter === 0 ? STORY.crashChild : STORY.cityChild);
      return;
    }
    const player = { x: s.x - 6, y: s.y - 10, w: 12, h: 20 };
    if (overlaps(player, this.area.exit)) {
      const count = this.area.fragments.filter(f => s.fragments.includes(f.id)).length;
      if (count < 2) { this.say('Serpihan ingatan', STORY.notEnough); return; }
      if (s.chapter === 1 && !s.objects.includes('lamp-city')) { this.say('Gerbang terlindung', STORY.needsLamp); return; }
      if (s.chapter === 2 && !s.objects.includes('door-home')) { this.say('Pintu belakang', STORY.needsHomeDoor); return; }
      if (s.chapter === 3 && !s.objects.includes('door-hospital')) { this.say('Pintu ICU', STORY.needsIcuDoor); return; }
      if (s.chapter === 4 && !s.objects.includes('monitor-icu')) { this.say('Monitor detak', STORY.needsMonitor); return; }
      if (s.chapter < AREAS.length - 1) {
        this.enterNextChapter();
      } else {
        // Final chapter: the player decides how the story ends.
        s.dialogue = STORY.choice;
        s.status = 'choice';
        this.publish();
      }
      this.save();
    }
  }
  update(dt: number, keys: Set<string>) {
    const s = this.state;
    if (s.status !== 'playing') return;
    dt = clamp(dt, 0, 0.05);
    s.elapsed += dt;
    if (s.chapter === 2 && s.objects.includes('radio-home')) s.catProgress = Math.min(1, s.catProgress + dt / 8);
    s.attack = Math.max(0, s.attack - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    let dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
    let dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
    if (dx || dy) { const norm = Math.hypot(dx, dy); dx /= norm; dy /= norm; }
    const blocked = (x: number, y: number) => this.area.blessed.some((wall, index) =>
      isBlessedActive(s.chapter, index, s.objects) &&
      overlaps({ x: x - 5, y: y - 6, w: 10, h: 12 }, wall));
    const nx = clamp(s.x + dx * 56 * dt, 8, this.area.width - 8);
    const ny = clamp(s.y + dy * 56 * dt, 14, this.area.height - 10);
    if (!blocked(nx, s.y)) s.x = nx;
    if (!blocked(s.x, ny)) s.y = ny;
    const resting = this.area.lights.some(l => near(s, l, 25));
    s.cord = clamp(s.cord + (resting ? 6 : -0.32) * dt, 0, 100);
    for (const ghost of this.area.ghosts) {
      const pos = {
        x: ghost.x + (ghost.axis === 'x' ? Math.sin(s.elapsed * ghost.speed) * ghost.range : 0),
        y: ghost.y + (ghost.axis === 'y' ? Math.sin(s.elapsed * ghost.speed) * ghost.range : 0),
      };
      if (!resting && this.invulnerable === 0 && near(s, pos, 15)) {
        s.cord = Math.max(0, s.cord - 18);
        s.attack = 1.2;
        this.invulnerable = 3;
        s.notice = 'Bayangan mengikis tali perak. Berlindunglah dekat cahaya.';
        this.publish();
      }
    }
    if (s.cord <= 0) { s.status = 'lost'; s.dialogue = null; this.publish(); return; }
    const found = this.area.fragments.find(f => !s.fragments.includes(f.id) && !s.objects.includes(`spent-${f.id}`) && near(s, f, 12));
    if (found) {
      s.fragments.push(found.id);
      s.cord = Math.min(100, s.cord + 8);
      this.say(found.title, found.text);
      this.save();
      return;
    }
    this.saveTime += dt;
    if (this.saveTime >= 10) { this.saveTime = 0; this.save(); }
    this.publishTime += dt;
    if (this.publishTime >= 0.1) { this.publishTime = 0; this.publish(); }
  }
  destroy() { this.save(); }
}