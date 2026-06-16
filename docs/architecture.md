# RoyalPlus Architecture

## 1. Architecture Overview

RoyalPlus will be built as a client-only web game demo. The first version should optimize for fast iteration, clear separation between UI and game simulation, and easy replacement of placeholder assets.

Recommended stack:

- Vite for local development and bundling.
- TypeScript for game state correctness.
- React for HUD, card hand, overlays, menus, and componentized UI.
- Canvas or PixiJS for arena rendering and animated game entities.
- Zustand or a small custom store for UI-facing state.

For the first demo, Canvas with lightweight TypeScript systems is sufficient. PixiJS can be introduced if sprite batching, richer effects, or more complex animation becomes valuable.

## 2. High-Level Modules

```text
royalplus/
  docs/
  public/
    assets/
      cards/
      ui/
      arena/
  src/
    app/
      App.tsx
      routes.ts
    game/
      engine/
        GameLoop.ts
        Simulation.ts
        systems/
      data/
        cards.ts
        units.ts
        towers.ts
      model/
        types.ts
        constants.ts
      ai/
        SimpleOpponent.ts
    ui/
      battle/
        BattleScreen.tsx
        Hud.tsx
        ArenaCanvas.tsx
        CardHand.tsx
        EnergyBar.tsx
      components/
    assets/
      assetManifest.ts
    styles/
      globals.css
```

## 3. Runtime Data Flow

```text
User input
  -> React UI event
  -> Command validation
  -> Simulation command queue
  -> Fixed-step simulation update
  -> Snapshot/state store
  -> Canvas render + React HUD render
```

Key principle: the simulation should not depend on React components. React displays snapshots and sends commands.

## 4. Game Loop

Use a fixed simulation step for deterministic-feeling behavior:

- `requestAnimationFrame` drives rendering.
- Accumulate elapsed time.
- Run simulation updates at a fixed tick, for example 20 or 30 ticks per second.
- Render using the latest state snapshot.

Initial systems:

- Energy regeneration system.
- Unit movement system.
- Target acquisition system.
- Attack/cooldown system.
- Projectile or instant damage system.
- Death/despawn system.
- Timer and win condition system.
- AI deployment system.

## 5. Core Domain Model

Important entities:

- `MatchState`: timer, phase, score, energy, entities, selected card, command queue.
- `PlayerState`: side, energy, hand, deck pointer, towers.
- `CardDefinition`: id, name, cost, category, deployment rules, spawn behavior, UI asset.
- `Entity`: id, owner, type, position, lane, hp, target id, behavior state.
- `UnitDefinition`: movement speed, range, attack rate, damage, target filters.
- `TowerDefinition`: hp, range, damage, attack rate.
- `Command`: deploy card, cast spell, pause/resume, restart.

## 6. Rendering Architecture

### 6.1 React UI Layer

React owns:

- HUD and timer.
- Card hand.
- Energy bar.
- Pause/settings overlay.
- Selection state chrome.
- Non-world UI feedback.

### 6.2 Arena Render Layer

Canvas owns:

- Arena background.
- Towers.
- Units.
- Projectiles/effects.
- Placement preview.
- Damage/status floating text.

The canvas component receives:

- Immutable-ish simulation snapshot.
- Selected card and pointer state.
- Callback for deployment commands.

## 7. Asset Strategy

All assets should be original.

For the UI demo:

- Prefer generated bitmap assets for card thumbnails, banners, arena textures, and tower silhouettes.
- Use CSS and Canvas shapes for simple bars, outlines, indicators, and placement zones.
- Store generated assets under `public/assets/`.
- Keep an `assetManifest.ts` mapping stable asset ids to paths.

Asset categories:

- `arena`: battlefield background, bridge/river details, tower bases.
- `cards`: card portraits/icons.
- `ui`: badges, banners, frames, resource icons.
- `fx`: small hit, heal, burst, deploy effects.

## 8. AI Architecture

The first opponent can be deterministic and simple:

- Maintains its own energy.
- Every few seconds evaluates available cards.
- Picks a lane with fewer friendly units or more enemy pressure.
- Deploys a random affordable card from a small scripted hand.

This keeps the demo moving without requiring real strategy.

## 9. State Management

Use two levels of state:

- Simulation state inside the game engine.
- UI store for selected card, hovered tile/position, pause state, and latest snapshot.

Avoid making every unit a React component. Entity-heavy rendering should stay in Canvas for performance and simpler animation.

## 10. Responsiveness

The arena should scale with a fixed logical coordinate system:

- Logical world: `900 x 1200` units.
- Friendly side at bottom, enemy side at top.
- Canvas scales to available viewport while preserving aspect ratio.
- HUD and hand bar use CSS layout around the canvas.

Mobile:

- Keep hand bar at bottom.
- Reduce card detail text.
- Use icons/cost/name only.
- Preserve touch target sizes.

## 11. Testing And Verification

Initial verification:

- TypeScript build.
- Unit tests for simulation functions where practical.
- Manual browser checks for:
  - card selection;
  - valid/invalid deployment;
  - energy spend/regeneration;
  - unit movement/combat;
  - desktop and mobile layout.

If the project grows:

- Add Playwright smoke tests for battle screen rendering and basic deployment.
- Add deterministic simulation tests with seeded AI.

## 12. Known Technical Risks

- UI can become unreadable if Canvas and DOM overlays do not share the same coordinate conversion.
- Hand/card layout may overflow on small screens unless dimensions are fixed and responsive.
- Too many generated assets can slow iteration; start with a small asset set.
- A clone-like request must be handled as a mechanically inspired original game, not an asset/name copy.

