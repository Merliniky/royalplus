# RoyalPlus UI Demo Requirements

## 1. Project Goal

RoyalPlus is a browser-based real-time card battle tower-defense demo inspired by the interaction model of lane-based arena battlers. The first milestone is a playable UI prototype rather than a complete commercial game.

The demo should show:

- A polished arena screen with two sides, towers, lanes, hand cards, elixir/energy, timer, and basic battle HUD.
- Original generated/placeholder UI assets and visual identity. Do not copy commercial game artwork, names, card art, icons, fonts, audio, or branding.
- Basic user interaction: selecting a card, previewing valid placement, deploying a unit/spell, spending energy, and seeing simple combat feedback.
- Enough game loop behavior to evaluate the feel of the interface.

## 2. Non-Goals For First Demo

- Online multiplayer.
- Account system, matchmaking, ranking, shop, clans, season pass, or monetization.
- Complete card collection and balance system.
- Production-grade anti-cheat or replay system.
- Exact reproduction of any proprietary assets, names, UI copy, character designs, or animations.

## 3. Target Platform

- Desktop browser first.
- Responsive enough for common mobile viewport checks, but mobile controls can be simplified in the first demo.
- Local development via a frontend dev server.

## 4. Core Demo Scope

### 4.1 Main Screen

The first screen should be the battle interface, not a marketing landing page.

Required UI regions:

- Top battle HUD: player/opponent names, crown/score indicators, match timer, pause/settings button.
- Arena: two halves, central river/bridge area, two lanes, friendly and enemy towers.
- Deployment layer: card placement cursor/ghost, valid and invalid zone feedback.
- Bottom hand bar: four active cards, next card indicator, energy meter, card cost badges.
- Event feedback: damage numbers, small status tags, tower health bars.

### 4.2 Battle Interaction

Minimum interactions:

- Click/tap a card to select it.
- Click/tap valid friendly arena space to deploy.
- Energy decreases by card cost.
- Energy regenerates over time.
- Invalid placement gives clear UI feedback.
- Units move toward enemy towers and attack using simplified logic.
- Towers auto-attack nearby enemy units.
- Match timer counts down.

### 4.3 Cards For Demo

Use 6-8 original cards with clear archetypes:

- Low-cost melee troop.
- Ranged troop.
- Tank troop.
- Flying or fast troop, if implementation time allows.
- Small area spell.
- Building/defensive structure, if implementation time allows.

Each card needs:

- Name.
- Cost.
- Type: troop, spell, building.
- Short stat block.
- Original icon/thumbnail asset.
- Distinct color/accent shape for quick recognition.

### 4.4 Game Rules For Demo

Simplified rules are acceptable:

- One local player versus scripted AI.
- AI deploys cards on a timer with simple heuristics.
- Unit pathing can use fixed lanes and target priority instead of full navmesh.
- Collision can be approximate.
- Win condition: more towers destroyed when timer ends, or immediate win after king tower destruction.

### 4.5 Visual Direction

RoyalPlus should feel like a premium fantasy arena game without copying existing IP.

Direction:

- Clear, saturated fantasy UI with metal, stone, banner, gem, and parchment accents.
- Arena assets should communicate lanes, river/bridge, tower ownership, and deployable regions.
- Cards should be readable at small sizes.
- Use icons and concise labels rather than long instructional text inside the UI.
- Avoid one-note palettes. The arena, hand bar, and HUD should use distinct material/color groups.

### 4.6 Accessibility And Usability

- UI text must remain legible on desktop and mobile viewport checks.
- Buttons need hover/focus states.
- Card selected state must be visually obvious.
- Energy and unavailable card states must be readable without relying on color alone.
- Avoid overlapping UI elements.

## 5. Acceptance Criteria For First Demo

The first UI demo is acceptable when:

- It runs locally in a browser.
- The battle screen is visible immediately.
- At least four cards are visible and selectable.
- At least two troop types can be deployed.
- Energy regeneration and cost gating work.
- Friendly and enemy units/towers show basic health feedback.
- The UI uses original generated or code-created assets.
- A desktop and mobile viewport screenshot have been checked for obvious layout breakage.

