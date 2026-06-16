const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");
const cardHand = document.getElementById("cardHand");
const energyFill = document.getElementById("energyFill");
const energyLabel = document.getElementById("energyLabel");
const timerLabel = document.getElementById("timer");
const toast = document.getElementById("toast");
const resultPanel = document.getElementById("matchResult");
const resultTitle = document.getElementById("resultTitle");
const restartButton = document.getElementById("restartButton");
const playAgainButton = document.getElementById("playAgainButton");
const playerCrowns = document.getElementById("playerCrowns");
const enemyCrowns = document.getElementById("enemyCrowns");
const versionLabel = document.getElementById("versionLabel");

const W = canvas.width;
const H = canvas.height;
const DEPLOY_Y = 605;
const MAX_ENERGY = 10;
const VERSION = "0.1.2";

const cards = [
  {
    id: "guard",
    name: "Guard Recruit",
    icon: "⚔",
    type: "melee",
    cost: 2,
    color: ["#74d1ff", "#163a55"],
    attackKind: "melee",
    unit: { hp: 110, damage: 16, range: 48, speed: 54, radius: 19, cooldown: 0.9 }
  },
  {
    id: "archer",
    name: "Ember Archer",
    icon: "◇",
    type: "ranged",
    cost: 3,
    color: ["#ffb25f", "#5d2419"],
    attackKind: "projectile",
    unit: { hp: 72, damage: 13, range: 145, speed: 44, radius: 16, cooldown: 0.75 }
  },
  {
    id: "boar",
    name: "Iron Boar",
    icon: "◆",
    type: "rush",
    cost: 4,
    color: ["#a7f06d", "#264b2f"],
    attackKind: "melee",
    unit: { hp: 150, damage: 22, range: 42, speed: 78, radius: 22, cooldown: 1.1 }
  },
  {
    id: "warden",
    name: "Stone Warden",
    icon: "⬟",
    type: "tank",
    cost: 5,
    color: ["#c6ced8", "#343d4a"],
    attackKind: "melee",
    unit: { hp: 280, damage: 24, range: 46, speed: 32, radius: 28, cooldown: 1.35 }
  }
];

let state;
let selectedCardId = null;
let pointer = { x: 0, y: 0, active: false };
let lastTime = performance.now();
let toastTimer = 0;

function resetGame() {
  state = {
    phase: "playing",
    timeLeft: 180,
    playerEnergy: 5,
    enemyEnergy: 5,
    playerCrowns: 0,
    enemyCrowns: 0,
    entities: [],
    projectiles: [],
    effects: [],
    floaters: [],
    towers: [
      tower("enemy-left", "enemy", 260, 188, 980, false),
      tower("enemy-right", "enemy", 640, 188, 980, false),
      tower("enemy-king", "enemy", 450, 95, 1500, true),
      tower("player-left", "player", 260, 1012, 980, false),
      tower("player-right", "player", 640, 1012, 980, false),
      tower("player-king", "player", 450, 1105, 1500, true)
    ],
    aiTimer: 1.5
  };
  selectedCardId = null;
  resultPanel.hidden = true;
  renderCards();
}

function tower(id, owner, x, y, hp, king) {
  return { id, owner, x, y, hp, maxHp: hp, king, range: king ? 185 : 165, damage: king ? 30 : 24, cooldown: 0, radius: king ? 42 : 34 };
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1200);
}

function renderCards() {
  cardHand.innerHTML = "";
  cards.forEach((card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `card ${selectedCardId === card.id ? "selected" : ""}`;
    button.style.setProperty("--card-main", card.color[0]);
    button.style.setProperty("--card-deep", card.color[1]);
    button.disabled = state.playerEnergy + 0.01 < card.cost || state.phase !== "playing";
    button.innerHTML = `
      <span class="cost">${card.cost}</span>
      <span class="portrait"><span>${card.icon}</span></span>
      <span class="card-info">
        <span class="card-name">${card.name}</span>
        <span class="card-type">${card.type}</span>
      </span>
    `;
    button.addEventListener("click", () => {
      if (state.playerEnergy < card.cost) {
        showToast("Energy is still charging");
        return;
      }
      selectedCardId = selectedCardId === card.id ? null : card.id;
      renderCards();
    });
    cardHand.appendChild(button);
  });
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H
  };
}

canvas.addEventListener("pointermove", (event) => {
  pointer = { ...getCanvasPoint(event), active: true };
});

canvas.addEventListener("pointerleave", () => {
  pointer.active = false;
});

canvas.addEventListener("pointerdown", (event) => {
  if (state.phase !== "playing") return;
  const card = cards.find((item) => item.id === selectedCardId);
  if (!card) {
    showToast("Select a card first");
    return;
  }
  const point = getCanvasPoint(event);
  if (point.y < DEPLOY_Y || point.y > 1135) {
    showToast("Deploy on your side");
    return;
  }
  if (state.playerEnergy < card.cost) {
    showToast("Not enough energy");
    return;
  }
  deployUnit("player", card, point.x, point.y);
  state.playerEnergy -= card.cost;
  selectedCardId = null;
  renderCards();
});

restartButton.addEventListener("click", resetGame);
playAgainButton.addEventListener("click", resetGame);

function deployUnit(owner, card, x, y) {
  const laneX = x < W / 2 ? 292 : 608;
  const spawnX = Math.max(96, Math.min(804, (x + laneX) / 2));
  const unit = {
    id: `${owner}-${card.id}-${Math.random().toString(16).slice(2)}`,
    owner,
    cardId: card.id,
    name: card.name,
    icon: card.icon,
    color: card.color[0],
    deepColor: card.color[1],
    attackKind: card.attackKind,
    x: spawnX,
    y,
    laneX,
    hp: card.unit.hp,
    maxHp: card.unit.hp,
    damage: card.unit.damage,
    range: card.unit.range,
    speed: card.unit.speed,
    radius: card.unit.radius,
    cooldown: 0,
    attackRate: card.unit.cooldown
  };
  state.entities.push(unit);
  addFloater("Deploy", spawnX, y - 26, owner === "player" ? "#9dddff" : "#ff9b9b");
}

function addFloater(text, x, y, color) {
  state.floaters.push({ text, x, y, color, ttl: 0.85, life: 0.85 });
}

function update(dt) {
  if (state.phase !== "playing") return;

  state.timeLeft = Math.max(0, state.timeLeft - dt);
  state.playerEnergy = Math.min(MAX_ENERGY, state.playerEnergy + dt * 0.72);
  state.enemyEnergy = Math.min(MAX_ENERGY, state.enemyEnergy + dt * 0.62);
  state.aiTimer -= dt;

  if (state.aiTimer <= 0) {
    runAi();
    state.aiTimer = 2.4 + Math.random() * 1.8;
  }

  updateTowers(dt);
  updateUnits(dt);
  updateProjectiles(dt);
  updateEffects(dt);
  updateFloaters(dt);
  removeDead();
  checkEnd();
}

function runAi() {
  const affordable = cards.filter((card) => card.cost <= state.enemyEnergy);
  if (!affordable.length) return;
  const card = affordable[Math.floor(Math.random() * affordable.length)];
  const pressureLeft = state.entities.filter((entity) => entity.owner === "player" && entity.x < W / 2).length;
  const pressureRight = state.entities.filter((entity) => entity.owner === "player" && entity.x >= W / 2).length;
  const laneX = pressureLeft > pressureRight ? 292 : pressureRight > pressureLeft ? 608 : Math.random() > 0.5 ? 292 : 608;
  deployUnit("enemy", card, laneX + (Math.random() * 90 - 45), 265 + Math.random() * 170);
  state.enemyEnergy -= card.cost;
}

function updateTowers(dt) {
  for (const currentTower of state.towers) {
    if (currentTower.hp <= 0) continue;
    currentTower.cooldown = Math.max(0, currentTower.cooldown - dt);
    const target = nearestEnemy(currentTower, state.entities, currentTower.range);
    if (target && currentTower.cooldown <= 0) {
      addProjectile({
        owner: currentTower.owner,
        x: currentTower.x,
        y: currentTower.y - 34,
        target,
        damage: currentTower.damage,
        speed: currentTower.king ? 520 : 470,
        radius: currentTower.king ? 9 : 7,
        color: currentTower.owner === "player" ? "#8fd9ff" : "#ff9a8f",
        trail: currentTower.owner === "player" ? "rgba(89, 194, 255, 0.32)" : "rgba(255, 120, 103, 0.32)",
        hitColor: "#ffe29a"
      });
      currentTower.cooldown = currentTower.king ? 0.85 : 1.05;
    }
  }
}

function updateUnits(dt) {
  for (const unit of state.entities) {
    unit.cooldown = Math.max(0, unit.cooldown - dt);
    const enemyUnits = state.entities.filter((entity) => entity.owner !== unit.owner && entity.hp > 0);
    const enemyTowers = state.towers.filter((item) => item.owner !== unit.owner && item.hp > 0);
    const target = nearestEnemy(unit, [...enemyUnits, ...enemyTowers], unit.range);

    if (target) {
      if (unit.cooldown <= 0) {
        if (unit.attackKind === "projectile") {
          addProjectile({
            owner: unit.owner,
            x: unit.x,
            y: unit.y - unit.radius * 0.35,
            target,
            damage: unit.damage,
            speed: 430,
            radius: 6,
            color: "#ffcf7a",
            trail: "rgba(255, 156, 78, 0.36)",
            hitColor: unit.owner === "player" ? "#bfe8ff" : "#ffc2c2"
          });
        } else {
          applyDamage(target, unit.damage, unit.owner === "player" ? "#bfe8ff" : "#ffc2c2");
          addMeleeEffect(unit, target);
        }
        unit.cooldown = unit.attackRate;
      }
      continue;
    }

    const direction = unit.owner === "player" ? -1 : 1;
    const goalY = unit.owner === "player" ? 100 : 1100;
    unit.x += (unit.laneX - unit.x) * Math.min(1, dt * 2.8);
    unit.y += direction * unit.speed * dt;
    if ((direction < 0 && unit.y < goalY) || (direction > 0 && unit.y > goalY)) {
      unit.y = goalY;
    }
  }
}


function addProjectile(projectile) {
  state.projectiles.push({
    id: `p-${Math.random().toString(16).slice(2)}`,
    vx: 0,
    vy: 0,
    ttl: 1.2,
    ...projectile
  });
}

function addMeleeEffect(source, target) {
  const angle = Math.atan2(target.y - source.y, target.x - source.x);
  state.effects.push({
    type: "slash",
    owner: source.owner,
    x: target.x,
    y: target.y,
    angle,
    radius: Math.max(36, source.radius + 24),
    ttl: 0.22,
    life: 0.22,
    color: source.owner === "player" ? "#c8ecff" : "#ffd0c9"
  });
}

function addImpactEffect(target, color) {
  state.effects.push({
    type: "impact",
    x: target.x,
    y: target.y,
    radius: (target.radius || 34) + 18,
    ttl: 0.28,
    life: 0.28,
    color
  });
}

function applyDamage(target, damage, color) {
  if (!target || target.hp <= 0) return;
  target.hp -= damage;
  addFloater("-" + damage, target.x, target.y - (target.radius || 32) - 8, color);
}

function updateProjectiles(dt) {
  for (const projectile of state.projectiles) {
    projectile.ttl -= dt;
    if (!projectile.target || projectile.target.hp <= 0) {
      projectile.ttl = 0;
      continue;
    }
    const targetX = projectile.target.x;
    const targetY = projectile.target.y - (projectile.target.radius || 30) * 0.2;
    const dx = targetX - projectile.x;
    const dy = targetY - projectile.y;
    const distance = Math.hypot(dx, dy) || 1;
    const travel = projectile.speed * dt;
    projectile.vx = dx / distance;
    projectile.vy = dy / distance;

    if (distance <= travel + projectile.radius + 4) {
      projectile.x = targetX;
      projectile.y = targetY;
      applyDamage(projectile.target, projectile.damage, projectile.hitColor);
      addImpactEffect(projectile.target, projectile.color);
      projectile.ttl = 0;
    } else {
      projectile.x += projectile.vx * travel;
      projectile.y += projectile.vy * travel;
    }
  }
  state.projectiles = state.projectiles.filter((projectile) => projectile.ttl > 0);
}

function updateEffects(dt) {
  for (const effect of state.effects) {
    effect.ttl -= dt;
  }
  state.effects = state.effects.filter((effect) => effect.ttl > 0);
}

function nearestEnemy(source, candidates, range) {
  let best = null;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    if (candidate.owner === source.owner || candidate.hp <= 0) continue;
    const distance = Math.hypot(candidate.x - source.x, candidate.y - source.y);
    if (distance <= range && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function updateFloaters(dt) {
  for (const floater of state.floaters) {
    floater.ttl -= dt;
    floater.y -= dt * 42;
  }
  state.floaters = state.floaters.filter((floater) => floater.ttl > 0);
}

function removeDead() {
  const destroyed = state.towers.filter((towerItem) => towerItem.hp <= 0 && !towerItem.counted);
  destroyed.forEach((towerItem) => {
    towerItem.counted = true;
    if (towerItem.owner === "enemy") state.playerCrowns += towerItem.king ? 3 : 1;
    if (towerItem.owner === "player") state.enemyCrowns += towerItem.king ? 3 : 1;
    addFloater("Tower down", towerItem.x, towerItem.y - 50, "#f7c85f");
  });
  state.entities = state.entities.filter((entity) => entity.hp > 0);
}

function checkEnd() {
  const playerKing = state.towers.find((towerItem) => towerItem.id === "player-king");
  const enemyKing = state.towers.find((towerItem) => towerItem.id === "enemy-king");
  if (playerKing.hp <= 0 || enemyKing.hp <= 0 || state.timeLeft <= 0) {
    state.phase = "ended";
    const title = state.playerCrowns > state.enemyCrowns ? "Victory" : state.playerCrowns < state.enemyCrowns ? "Defeat" : "Draw";
    resultTitle.textContent = title;
    resultPanel.hidden = false;
  }
}

function render() {
  drawArena();
  drawTowers();
  drawProjectiles();
  drawUnits();
  drawEffects();
  drawPointerPreview();
  drawFloaters();
  updateHud();
}

function drawArena() {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#5b2430");
  grd.addColorStop(0.48, "#334253");
  grd.addColorStop(0.52, "#224d63");
  grd.addColorStop(1, "#1c3d60");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  drawStoneTiles();

  ctx.fillStyle = "rgba(33, 116, 154, 0.82)";
  ctx.fillRect(0, 560, W, 82);
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  for (let x = 0; x < W; x += 44) {
    ctx.fillRect(x, 596 + Math.sin(x) * 4, 26, 4);
  }

  drawBridge(248, 538);
  drawBridge(564, 538);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 18]);
  ctx.beginPath();
  ctx.moveTo(292, 0);
  ctx.lineTo(292, H);
  ctx.moveTo(608, 0);
  ctx.lineTo(608, H);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(84, 169, 255, 0.08)";
  ctx.fillRect(0, DEPLOY_Y, W, H - DEPLOY_Y);
  ctx.fillStyle = "rgba(255, 107, 107, 0.08)";
  ctx.fillRect(0, 0, W, DEPLOY_Y - 82);
}

function drawStoneTiles() {
  ctx.save();
  ctx.globalAlpha = 0.16;
  for (let y = 0; y < H; y += 80) {
    for (let x = (y / 80) % 2 ? -45 : 0; x < W; x += 90) {
      ctx.fillStyle = y < H / 2 ? "#ffd2bd" : "#bce2ff";
      roundRect(x + 7, y + 10, 72, 48, 7, true);
    }
  }
  ctx.restore();
}

function drawBridge(x, y) {
  const grd = ctx.createLinearGradient(x, y, x, y + 124);
  grd.addColorStop(0, "#b7844a");
  grd.addColorStop(1, "#6b4328");
  ctx.fillStyle = grd;
  roundRect(x, y, 88, 124, 6, true);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 8, y + 8, 72, 108);
}

function drawTowers() {
  state.towers.forEach((towerItem) => {
    const alive = towerItem.hp > 0;
    ctx.save();
    ctx.globalAlpha = alive ? 1 : 0.35;

    const accent = towerItem.owner === "player" ? "#3e9bff" : "#e65656";
    const sideLight = towerItem.owner === "player" ? "#93d6ff" : "#ffaaa2";
    const body = towerItem.king ? "#f4c45d" : "#cbd4df";
    const baseRadius = towerItem.king ? 50 : 42;

    ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
    ctx.beginPath();
    ctx.ellipse(towerItem.x + 10, towerItem.y + 45, baseRadius, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const base = ctx.createLinearGradient(towerItem.x - baseRadius, towerItem.y, towerItem.x + baseRadius, towerItem.y + 52);
    base.addColorStop(0, sideLight);
    base.addColorStop(0.48, accent);
    base.addColorStop(1, "#172131");
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(towerItem.x, towerItem.y + 16, baseRadius, baseRadius * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    const towerBody = ctx.createLinearGradient(towerItem.x - 32, towerItem.y - 70, towerItem.x + 35, towerItem.y + 26);
    towerBody.addColorStop(0, "#fff7d7");
    towerBody.addColorStop(0.22, body);
    towerBody.addColorStop(0.72, "#777f8c");
    towerBody.addColorStop(1, "#222b39");
    ctx.fillStyle = towerBody;
    roundRect(towerItem.x - 31, towerItem.y - 56, 62, 74, 10, true);

    ctx.fillStyle = accent;
    roundRect(towerItem.x - 23, towerItem.y - 71, 46, 28, 7, true);
    ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
    roundRect(towerItem.x - 17, towerItem.y - 66, 18, 8, 4, true);

    if (towerItem.king) {
      ctx.fillStyle = "#ffe278";
      ctx.beginPath();
      ctx.moveTo(towerItem.x - 22, towerItem.y - 74);
      ctx.lineTo(towerItem.x - 10, towerItem.y - 98);
      ctx.lineTo(towerItem.x, towerItem.y - 76);
      ctx.lineTo(towerItem.x + 10, towerItem.y - 98);
      ctx.lineTo(towerItem.x + 22, towerItem.y - 74);
      ctx.closePath();
      ctx.fill();
    }

    drawHealth(towerItem.x - 46, towerItem.y + 58, 92, towerItem.hp / towerItem.maxHp, towerItem.owner);
    ctx.restore();
  });
}

function drawUnits() {
  state.entities.forEach((unit) => {
    ctx.save();
    const r = unit.radius;
    const accent = unit.owner === "player" ? "#2c8be8" : "#d94444";

    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.beginPath();
    ctx.ellipse(unit.x + 7, unit.y + r * 0.72, r * 1.25, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "rgba(0,0,0,0.42)";
    ctx.shadowBlur = 12;
    const body = ctx.createRadialGradient(unit.x - r * 0.36, unit.y - r * 0.55, r * 0.2, unit.x, unit.y, r * 1.12);
    body.addColorStop(0, "#ffffff");
    body.addColorStop(0.22, unit.color);
    body.addColorStop(0.72, unit.deepColor);
    body.addColorStop(1, "#111827");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(unit.x, unit.y, r, r * 1.08, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(unit.x, unit.y, r + 3, Math.PI * 0.13, Math.PI * 0.87);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.44)";
    ctx.beginPath();
    ctx.ellipse(unit.x - r * 0.32, unit.y - r * 0.42, r * 0.28, r * 0.16, -0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#10131b";
    ctx.font = `900 ${Math.max(18, r)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(unit.icon, unit.x, unit.y + 1);
    drawHealth(unit.x - 30, unit.y - r - 18, 60, unit.hp / unit.maxHp, unit.owner);
    ctx.restore();
  });
}

function drawProjectiles() {
  state.projectiles.forEach((projectile) => {
    ctx.save();
    ctx.strokeStyle = projectile.trail;
    ctx.lineWidth = projectile.radius * 1.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(projectile.x - projectile.vx * 32, projectile.y - projectile.vy * 32);
    ctx.lineTo(projectile.x, projectile.y);
    ctx.stroke();

    const glow = ctx.createRadialGradient(projectile.x - 2, projectile.y - 2, 1, projectile.x, projectile.y, projectile.radius * 2.4);
    glow.addColorStop(0, "#fffbe0");
    glow.addColorStop(0.36, projectile.color);
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius * 2.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff7cb";
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawEffects() {
  state.effects.forEach((effect) => {
    const progress = 1 - effect.ttl / effect.life;
    const alpha = Math.max(0, effect.ttl / effect.life);
    ctx.save();
    ctx.globalAlpha = alpha;

    if (effect.type === "slash") {
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle);
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 8 * alpha + 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, effect.radius * (0.72 + progress * 0.35), -0.92, 0.92);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, effect.radius * (0.56 + progress * 0.32), -0.68, 0.72);
      ctx.stroke();
    } else {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 7 * alpha + 1;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * progress, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * 0.36 * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawPointerPreview() {
  if (!selectedCardId || !pointer.active || state.phase !== "playing") return;
  const valid = pointer.y >= DEPLOY_Y && pointer.y <= 1135;
  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = valid ? "#7fe092" : "#ff6b6b";
  ctx.fillStyle = valid ? "rgba(127, 224, 146, 0.18)" : "rgba(255, 107, 107, 0.18)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFloaters() {
  state.floaters.forEach((floater) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, floater.ttl / floater.life);
    ctx.fillStyle = floater.color;
    ctx.font = "700 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(floater.text, floater.x, floater.y);
    ctx.restore();
  });
}

function drawHealth(x, y, width, ratio, owner) {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  roundRect(x, y, width, 8, 3, true);
  ctx.fillStyle = owner === "player" ? "#54a9ff" : "#ff6b6b";
  roundRect(x, y, width * safeRatio, 8, 3, true);
}

function roundRect(x, y, width, height, radius, fill) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  if (fill) ctx.fill();
}

function updateHud() {
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = Math.floor(state.timeLeft % 60);
  timerLabel.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  energyFill.style.width = `${(state.playerEnergy / MAX_ENERGY) * 100}%`;
  energyLabel.textContent = `${state.playerEnergy.toFixed(1)} / ${MAX_ENERGY}`;
  playerCrowns.textContent = state.playerCrowns;
  enemyCrowns.textContent = state.enemyCrowns;
  if (versionLabel) versionLabel.textContent = `v${VERSION}`;
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  render();
  if (Math.floor(now / 120) !== Math.floor((now - dt * 1000) / 120)) {
    renderCards();
  }
  requestAnimationFrame(loop);
}

resetGame();
requestAnimationFrame(loop);
