import assert from 'node:assert/strict';
import { Game, AREAS, MEMORIES, getNpcPosition, isBlessedActive, getCollectedMemories } from './engine';

const storage = new Map<string, string>();
globalThis.localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value); },
  removeItem: (key: string) => { storage.delete(key); },
  clear: () => { storage.clear(); },
  key: (index: number) => [...storage.keys()][index] ?? null,
  get length() { return storage.size; },
} as Storage;
const tick = (game: Game, seconds: number, keys = new Set<string>()) => {
  for (let i = 0; i < seconds * 60; i++) game.update(1 / 60, keys);
};
const at = (game: Game, x: number, y: number) => { Object.assign(game.state, { x, y }); };
const game = new Game(() => {});
game.start('Nara', 2);
game.closeDialogue();
Object.assign(game.state, {
  chapter: 1, x: 608, y: 208, fragments: ['rain', 'call', 'work', 'friend'], objects: ['lamp-city'],
});
game.act();
assert.equal(game.state.chapter, 2, 'chapter two exit must enter home');
assert.equal(game.state.status, 'dialogue');
assert.equal(game.state.name, 'Nara');
game.closeDialogue();

at(game, 416, 212);
game.act();
assert.equal(game.state.dialogue?.text.includes('Putar lagu'), true, 'door gives locked hint');
assert.equal(game.state.objects.includes('door-home'), false);
game.closeDialogue();
at(game, 410, 180);
tick(game, 1, new Set(['d']));
assert(game.state.x < 420, 'salt barrier blocks spirit before puzzle');
assert.equal(isBlessedActive(2, 0, game.state.objects), true);

at(game, 160, 212);
game.act();
assert.equal(game.state.objects.includes('cat-guided'), false, 'cat cannot solve puzzle before radio');
game.closeDialogue();
at(game, 280, 96);
game.act();
assert(game.state.objects.includes('radio-home'));
game.closeDialogue();
tick(game, 4);
const cat = AREAS[2].npcs[0];
assert(getNpcPosition(cat, game.state).x > 160 && getNpcPosition(cat, game.state).x < 390, 'cat moves progressively');
assert(game.save());
const loaded = new Game(() => {});
assert(loaded.load(2));
assert.equal(loaded.state.catProgress, game.state.catProgress, 'cat movement survives reload');
assert(loaded.state.objects.includes('radio-home'));
tick(loaded, 5);
assert.equal(loaded.state.catProgress, 1);
at(loaded, 390, 212);
loaded.act();
assert(loaded.state.objects.includes('cat-guided'), 'cat remains interactable beside locked door');
loaded.closeDialogue();
at(loaded, 416, 212);
loaded.act();
assert(loaded.state.objects.includes('door-home'));
assert.equal(isBlessedActive(2, 0, loaded.state.objects), false);
loaded.closeDialogue();
at(loaded, 410, 180);
tick(loaded, 1, new Set(['d']));
assert(loaded.state.x > 428, 'opened salt barrier permits passage');
at(loaded, 608, 208);
loaded.act();
assert.equal(loaded.state.status, 'dialogue', 'home exit still requires two family memories');
assert(loaded.state.dialogue?.text.includes('dua serpihan'));
loaded.closeDialogue();
for (const memory of AREAS[2].fragments.slice(0, 2)) {
  at(loaded, memory.x, memory.y);
  loaded.update(1 / 60, new Set());
  assert(loaded.state.fragments.includes(memory.id));
  loaded.closeDialogue();
}
at(loaded, 608, 208);
loaded.act();
assert.equal(loaded.state.chapter, 3, 'home exit enters the hospital');
assert.equal(loaded.state.status, 'dialogue');
loaded.closeDialogue();

// Chapter 4: ICU door needs the clock, then the nurse must be away from the door.
const hospital = loaded;
const door = AREAS[3].objects[1], nurse = AREAS[3].npcs[0];
const nurseAt = (seconds: number) => { hospital.state.elapsed = seconds; return getNpcPosition(nurse, hospital.state); };
at(hospital, 410, 190);
tick(hospital, 1, new Set(['d']));
assert(hospital.state.x < 444, 'ICU salt barrier blocks before the puzzle');
hospital.state.elapsed = 0;
at(hospital, door.x - 6, door.y);
hospital.act();
assert(hospital.state.dialogue?.text.includes('jam besar'), 'door requires visiting hours first');
hospital.closeDialogue();
assert.equal(hospital.state.objects.includes('door-hospital'), false);
at(hospital, 170, 84);
hospital.act();
assert(hospital.state.objects.includes('clock-hospital'));
hospital.closeDialogue();
const near = Math.PI / 2 / 0.55; // nurse at her closest to the door
const far = (3 * Math.PI) / 2 / 0.55;
assert(nurseAt(near).x > 400 && nurseAt(far).x < 300, 'nurse patrols along the corridor');
at(hospital, door.x - 6, door.y - 4);
hospital.state.elapsed = near;
hospital.act();
assert.equal(hospital.state.objects.includes('door-hospital'), false, 'nurse guard keeps the door shut');
hospital.closeDialogue();
hospital.state.elapsed = far;
at(hospital, door.x - 6, door.y);
hospital.act();
assert(hospital.state.objects.includes('door-hospital'), 'door opens when the nurse is away');
hospital.closeDialogue();
at(hospital, 410, 190);
tick(hospital, 1, new Set(['d']));
assert(hospital.state.x > 452, 'opened ICU barrier permits passage');
at(hospital, 592, 208);
hospital.act();
assert(hospital.state.dialogue?.text.includes('dua serpihan') || hospital.state.dialogue?.text.includes('setidaknya dua'), 'exit needs two regrets');
hospital.closeDialogue();
for (const memory of AREAS[3].fragments.slice(0, 2)) {
  at(hospital, memory.x, memory.y);
  hospital.update(1 / 60, new Set());
  assert(hospital.state.fragments.includes(memory.id));
  hospital.closeDialogue();
}
at(hospital, 592, 208);
hospital.act();
assert.equal(hospital.state.chapter, 4, 'hospital exit enters the ICU');
assert.equal(hospital.state.status, 'dialogue');
hospital.closeDialogue();

// Chapter 5: the monitor opens the salt curtain, then the bed starts the final choice.
const icu = hospital;
at(icu, 350, 200);
tick(icu, 1, new Set(['d']));
assert(icu.state.x < 380, 'ICU salt curtain blocks before the monitor');
at(icu, 330, 108);
icu.act();
assert(icu.state.objects.includes('monitor-icu'));
icu.closeDialogue();
assert.equal(isBlessedActive(4, 0, icu.state.objects), false);
at(icu, 350, 200);
tick(icu, 1, new Set(['d']));
assert(icu.state.x > 388, 'steady monitor permits passage');
at(icu, 480, 190);
icu.act();
assert(icu.state.dialogue?.text.includes('dua serpihan'), 'bed needs two memories first');
icu.closeDialogue();
for (const memory of AREAS[4].fragments.slice(0, 2)) {
  at(icu, memory.x, memory.y);
  icu.update(1 / 60, new Set());
  assert(icu.state.fragments.includes(memory.id));
  icu.closeDialogue();
}
at(icu, 500, 244);
icu.act();
assert(icu.state.dialogue?.text.includes('Ibu'), 'mother can be spoken to');
icu.closeDialogue();
at(icu, 480, 190);
icu.act();
assert.equal(icu.state.status, 'choice');
icu.cancelChoice();
assert.equal(icu.state.status, 'playing', 'choice can be postponed');
icu.act();
assert.equal(icu.state.status, 'choice');
// Fragments held: 2 + 2 + 2 + 2 + 2 (some shared/missing) must be below the home requirement.
Object.assign(icu.state, { fragments: ['rain', 'call'], objects: ['monitor-icu'] });
assert.equal(icu.canGoHome(), false);
assert.equal(icu.chooseEnding('home'), false, 'going home needs enough memories');
assert.equal(icu.state.status, 'choice');
assert.equal(icu.chooseEnding('letgo'), true);
assert.equal(icu.state.status, 'complete');
assert.equal(icu.state.ending, 'letgo');
const letGo = new Game(() => {});
assert(letGo.load(2));
assert.equal(letGo.state.status, 'complete', 'finished ending persists');
assert.equal(letGo.state.ending, 'letgo');
assert.equal(letGo.state.chapter, 4);

const homeGame = new Game(() => {});
homeGame.start('Sari', 1);
homeGame.closeDialogue();
Object.assign(homeGame.state, { chapter: 4, x: 480, y: 190, fragments: [...MEMORIES.slice(0, 10).map(m => m.id), 'icu-machine', 'mother-voice'], objects: ['monitor-icu'] });
homeGame.act();
assert.equal(homeGame.state.status, 'choice');
assert.equal(homeGame.canGoHome(), true);
assert.equal(homeGame.chooseEnding('home'), true);
assert.equal(homeGame.state.ending, 'home');
assert.equal(homeGame.state.status, 'complete');
// An interrupted choice resumes as normal play, not as a stuck menu.
Object.assign(homeGame.state, { status: 'choice', ending: null });
assert(homeGame.save());
const resumed = new Game(() => {});
assert(resumed.load(1));
assert.equal(resumed.state.status, 'playing');

// Old finished-home save resumes at the hospital.
const homeDone = { ...hospital.state, ending: null, chapter: 2, status: 'complete', name: 'Rina', objects: ['door-home'], fragments: ['rain', 'call', 'unsaid'] };
storage.set('tali-perak-save-3', JSON.stringify({ version: 1, state: homeDone, savedAt: new Date().toISOString() }));
const toHospital = new Game(() => {});
assert(toHospital.load(3));
assert.equal(toHospital.state.chapter, 3);
assert.equal(toHospital.state.status, 'dialogue');
assert.equal(toHospital.state.name, 'Rina');
assert.deepEqual(toHospital.state.fragments, homeDone.fragments);
assert.deepEqual(getCollectedMemories(3).includes('unsaid'), true);
// Old finished-hospital save resumes in the ICU.
const hospitalDone = { ...homeDone, chapter: 3, objects: ['clock-hospital', 'door-hospital'] };
storage.set('tali-perak-save-3', JSON.stringify({ version: 1, state: hospitalDone, savedAt: new Date().toISOString() }));
const toIcu = new Game(() => {});
assert(toIcu.load(3));
assert.equal(toIcu.state.chapter, 4);
assert.equal(toIcu.state.status, 'dialogue');
assert.equal(toIcu.state.ending, null);
assert.deepEqual(toIcu.state.fragments, hospitalDone.fragments);

// Simulate a save written by the previous two-chapter MVP, without catProgress.
const legacy = { ...game.state, chapter: 1, status: 'complete', elapsed: 240, name: 'Mira' };
delete (legacy as Partial<typeof legacy>).catProgress;
storage.set('tali-perak-save-1', JSON.stringify({ version: 1, state: legacy, savedAt: new Date().toISOString() }));
const migrated = new Game(() => {});
assert(migrated.load(1));
assert.equal(migrated.state.chapter, 2);
assert.equal(migrated.state.status, 'dialogue');
assert.equal(migrated.state.name, 'Mira');
assert.equal(migrated.state.slot, 1);
assert.equal(migrated.state.elapsed, 240);
assert.deepEqual(migrated.state.fragments, legacy.fragments);
assert.equal(migrated.state.catProgress, 0);
const activeLegacy = { ...legacy, status: 'playing' };
storage.set('tali-perak-save-3', JSON.stringify({ version: 1, state: activeLegacy, savedAt: new Date().toISOString() }));
assert(migrated.load(3));
assert.equal(migrated.state.chapter, 1, 'unfinished old saves must stay in their original chapter');
// Menu journal reads memories from saves, including ones shared with the lost spirit.
storage.set('tali-perak-save-2', JSON.stringify({ version: 1, savedAt: new Date().toISOString(), state: { ...game.state, fragments: ['rain'], objects: ['spent-call'] } }));
assert.deepEqual(getCollectedMemories(2), ['rain', 'call']);
assert.deepEqual(getCollectedMemories(3).length > 0, true);
storage.delete('tali-perak-save-2');
assert.deepEqual(getCollectedMemories(2), []);
console.log('Chapter 3-5 puzzles, endings, movement, memories, completion, persistence and legacy saves passed.');