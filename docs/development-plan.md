# RoyalPlus Development Plan

## Phase 0: Documentation

Status: complete after this document set is committed to the project folder.

Deliverables:

- Requirements document.
- Architecture document.
- Development plan.

## Phase 1: Project Scaffold

Deliverables:

- Vite + React + TypeScript app.
- Base CSS theme and layout tokens.
- Battle screen route as the first visible screen.
- Local dev command.

Definition of done:

- App starts locally.
- Empty battle layout renders.
- No console errors on first load.

## Phase 2: Static UI Demo

Deliverables:

- Arena layout with two sides, towers, lanes, bridge/river area.
- HUD with timer, player labels, score/crown indicators.
- Bottom card hand with at least four cards.
- Energy bar and card cost states.
- Generated or code-created placeholder UI assets.

Definition of done:

- Screenshot looks like a real game interface rather than a wireframe.
- Desktop and mobile layouts have no obvious overlap.

## Phase 3: Interactive Prototype

Deliverables:

- Card selection state.
- Placement preview.
- Valid/invalid deployment zones.
- Energy cost validation.
- Spawn at least two troop archetypes.

Definition of done:

- User can select a card and deploy a unit.
- Unaffordable cards are disabled.
- Invalid placement is visibly rejected.

## Phase 4: Basic Battle Simulation

Deliverables:

- Unit movement along lanes.
- Tower targeting and damage.
- Unit attacks and health bars.
- Simple opponent AI.
- Match timer and win condition.

Definition of done:

- The demo can run for a full short match.
- Units and towers exchange damage.
- End state appears when the match finishes.

## Phase 5: Visual Polish

Deliverables:

- Generated card thumbnails and UI accents.
- Small deploy, hit, and destruction effects.
- Better tower and arena artwork.
- Button/card hover and pressed states.
- Sound hooks, if time allows.

Definition of done:

- The UI feels coherent and original.
- Key interactions have immediate feedback.

## First Implementation Target

The next development step should implement Phases 1 and 2 together:

1. Scaffold the web app.
2. Build the static battle screen.
3. Generate or create a minimal original asset set.
4. Start the local dev server.
5. Verify the screen in browser screenshots.

## Suggested Initial Card Set

| Card | Type | Cost | Demo Role |
| --- | --- | ---: | --- |
| Guard Recruit | Troop | 2 | Cheap melee unit |
| Ember Archer | Troop | 3 | Ranged support |
| Iron Boar | Troop | 4 | Fast lane pressure |
| Stone Warden | Troop | 5 | High-health tank |
| Spark Flask | Spell | 3 | Small area damage |
| Banner Post | Building | 4 | Defensive structure |

Names and art are placeholders for RoyalPlus and should remain distinct from existing commercial card names.

