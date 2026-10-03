---
name: Chapter expansion saves
description: Backward compatibility when extending the playable story.
---
Completed MVP saves should continue into a newly added chapter, retaining the player's name, memories, slot and elapsed time. Do not require a restart or discard existing browser saves.

**Why:** Chapters are being delivered incrementally; players who finish an earlier release should be able to continue the same journey.

**How to apply:** When adding a chapter, check old completion saves as well as active saves. Completion at the current last playable chapter must still stay complete rather than advancing to an unavailable area.