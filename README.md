# Tali Perak

A browser-playable complete five-chapter game based on the supplied PRD. Indonesian story,
code-drawn Canvas pixel art, original Web Audio, and three local save slots.

Product requirements: [docs/PRD.md](docs/PRD.md). Game source: `artifacts/tali-perak/`.

## Play

Choose **Mulai baru**, enter a name, select a slot and choose **Berangkat**.
WASD/arrows move; Z/Space interact; Esc pauses.
Ordinary walls are phaseable. Glowing salt barriers are solid. Yellow lamps
restore the silver cord. Collect two memories in each chapter, and interact
with the exit. In chapter two, possess the gate lamp first.
In chapter three, possess the bedroom radio, follow the cat, talk to it at the
back door, then possess the door. Find at least two family memories before leaving.

## Scope

Chapters 1–5, fifteen memories, radio/lamp/clock/door/monitor possession, a child, lost spirit, cat and patrolling nurse,
patrolling ghosts, three endings (going home, letting go, lost), pause/journal/audio controls, local saves.
Earlier chapter-two, -three and -four completion saves resume into the next chapter without losing
the name, collected memories, elapsed time, or chosen slot.
The current compact levels do not yet establish the PRD's 20–30-minute session
target; pacing and player testing are still needed. 60 FPS is the render target,
not a benchmark claim.

## Structure and data model

`artifacts/tali-perak/src/game/engine.ts`: player, areas, collisions, puzzles, fragments and save logic.
`artifacts/tali-perak/src/game/story.ts`: centralized Indonesian narrative and fragment text.
`artifacts/tali-perak/src/game/render.ts`: code-drawn pixel scenery, sprites, camera, cord and effects.
`artifacts/tali-perak/src/game/home-art.ts`: indoor furnishings and the animated cat sprite.
`artifacts/tali-perak/src/game/hospital-art.ts`: hospital interior, nurse and clock sprites.
`artifacts/tali-perak/src/game/icu-art.ts`: ICU room, monitor and mother sprites.
`artifacts/tali-perak/src/game/audio.ts`: browser-generated ambience, music and effects.
`artifacts/tali-perak/src/App.tsx`: menus, name/slot selection, HUD, journal, settings and game loop.

Area owns walls/layers, fragments, objects and NPCs; fragments link to memory
scenes; object state and fragment count satisfy puzzle conditions. Player state
is recorded by SaveGame (one browser-local record per slot); collected fragment
IDs connect saves to memories. Endings are cord loss, and the going-home or
letting-go choice at the end of chapter five. No SQL database or network service is used.

The core uses Canvas and Web Audio without a game engine. React/Vite provide the
hosting/menu shell within the supplied project scaffold. Save slots are local
to this browser/origin, not synchronized between devices. Browser storage
failures are shown to the player.

Run through the configured Tali Perak workflow.
Type check: `pnpm --filter @workspace/tali-perak run typecheck`.