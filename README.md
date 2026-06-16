# RoyalPlus

RoyalPlus is an original browser UI demo for a real-time card battle tower-defense prototype. It is inspired by the genre interaction pattern, but uses original names, UI direction, and generated/code-created assets.

## Demo

Open `index.html` directly or serve the folder as static files.

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Current Features

- Battle arena with two sides, towers, lanes, bridge/river area, HUD, timer, hand cards, and energy bar.
- Four playable cards: Guard Recruit, Ember Archer, Iron Boar, and Stone Warden.
- Card selection, valid deployment zone feedback, energy cost gating, and deployment.
- Local scripted opponent AI.
- Units move, acquire targets, attack, and show health/damage feedback.
- Original generated visual reference asset included under `public/assets/generated/`.

## Docs

- `docs/requirements.md`
- `docs/architecture.md`
- `docs/development-plan.md`

