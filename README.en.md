# Tali Perak

[Bahasa Indonesia](README.md) · **English**

A browser-playable, complete five-chapter pixel-art spirit adventure based on the product requirements
([PRD](docs/PRD.en.md)). Indonesian story, code-drawn Canvas pixel art, original Web Audio, and three local save slots.
Game source: `artifacts/tali-perak/`.

## Play

Choose **Mulai baru**, enter a name, select a slot and choose **Berangkat**.
WASD/arrows move; Z/Space/Enter interact; Esc pauses.
Ordinary walls can be phased through. Glowing salt barriers are solid. Yellow lamps restore the silver cord.
Collect at least two memories in each chapter, then interact with the exit.

- **Chapter 2:** possess the gate lamp first.
- **Chapter 3:** possess the bedroom radio, follow the cat, talk to it at the back door, then possess the door.
- **Chapter 4:** possess the big clock, wait until the nurse walks away from the ICU door, then possess the door.
- **Chapter 5:** possess the monitor to dissolve the salt curtain, then approach the bed and choose an ending.

## Endings

- **Going home:** needs at least 12 of the 15 memories.
- **Letting go:** always available.
- **Lost (Terlupakan):** the silver cord runs out.

## Scope

Chapters 1–5, fifteen memories, radio/lamp/clock/door/monitor possession, a child, a lost spirit, a cat, a patrolling nurse,
patrolling ghosts, three endings, pause/journal/audio controls and local saves.
Earlier completion saves resume into the next chapter without losing the name, collected memories, elapsed time or chosen slot.

Not yet done: the compact levels do not establish the PRD's 20–30-minute session target (pacing and player testing are
still needed), and 60 FPS is the render target, not a measured benchmark.

## Structure

- `artifacts/tali-perak/src/game/engine.ts`: player, areas, collisions, puzzles, fragments, endings and save logic.
- `artifacts/tali-perak/src/game/story.ts`: centralized Indonesian narrative and memory text.
- `artifacts/tali-perak/src/game/render.ts`: code-drawn pixel scenery, sprites, camera, cord and effects.
- `artifacts/tali-perak/src/game/home-art.ts`: indoor furnishings and the animated cat.
- `artifacts/tali-perak/src/game/hospital-art.ts`: hospital interior, nurse and clock.
- `artifacts/tali-perak/src/game/icu-art.ts`: ICU room, monitor and mother.
- `artifacts/tali-perak/src/game/audio.ts`: browser-generated ambience, music and effects.
- `artifacts/tali-perak/src/App.tsx`: menus, name/slot selection, HUD, journal, settings and game loop.

Each area owns its walls, fragments, objects and NPCs. Fragments link to memory scenes; object state and fragment
count satisfy puzzle conditions. Player state is stored in browser localStorage, one record per slot.
No SQL database or network service is used.

The core uses Canvas and Web Audio without a game engine; React/Vite provide the menu shell.
Save slots are local to the browser and origin, and are not synchronized between devices.
Browser storage failures are shown to the player.

## Development

Run through the configured Tali Perak workflow.
Type check: `pnpm --filter @workspace/tali-perak run typecheck`.
