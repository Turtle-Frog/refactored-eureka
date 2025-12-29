// ==========================
// DREAMS — FULL GAME
// ==========================

let gameState = "story"; // story, play, win, lose
let levelIndex = 0;
let storyIndex = 0;

let gravity = 0.8;
let groundY;

let player;
let enemies = [];
let boss = null;

// ==========================
// LEVEL DATA
// ==========================

let levels = [
  {
    title: "Dream I: Whispers",
    story: ["The dream is quiet.", "Small fears begin to move."],
    enemies: 2,
    boss: false
  },
  {
    title: "Dream II: The Doubter",
    story: ["A voice questions you.", "It sounds like your own."],
    enemies: 0,
    boss: true,
    bossName: "The Doubter"
  },
  {
    title: "Dream III: Pressure",
    story: ["The air feels heavy.", "Running no longer helps."],
    enemies: 3,
    boss: false
  },
  {
    title: "Dream IV: The Watcher",
    story: ["Something watches.", "It knows your fears."],
    enemies: 0,
    boss: true,
    bossName: "The Watcher"
  },
  {
    title: "Dream V: Collapse",
    story: ["Everything feels fragile.", "One mistake could end it."],
    enemies: 4,
    boss: false
  },
  {
    title: "Dream VI: Reflection",
    story: ["The final dream.", "You face yourself."],
    enemies: 0,
    boss: true,
    bossName: "Reflection"
  }
];

// ==========================
// SETUP / DRAW
// ==========================

function setup() {
  createCanvas(900, 420);
  groundY = height - 60;
  startLevel();
}

function draw() {
  background(10 + levelIndex * 10, 10, 30);

  if (gameState === "story") drawStory();
  if (gameState === "play") {
    drawWorld();
    updateGame();
  }
  if (gameState === "win") drawEnd("You wake up.\nYour dreams still live.");
  if (gameState === "lose") drawEnd("The dream shattered.\nPress ENTER to try again.");
}

// ==========================
// LEVEL CONTROL
// ==========================

function startLevel() {
  storyIndex = 0;
  enemies = [];
  boss = null;
  player = new Player();

  if (levels[levelIndex].boss) {
    boss = new Boss(levels[levelIndex].bossName);
  } else {
    spawnEnemies(levels[levelIndex].enemies);
  }

  gameState = "story";
}

function nextLevel() {
  levelIndex++;
  if (levelIndex >= levels.length) {
    gameState = "win";
  } else {
    startLevel();
  }
}

// ==========================
// STORY
// ==========================

function drawStory() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(26);
  text(levels[levelIndex].title, width / 2, height / 2 - 60);

  textSize(18);
  text(levels[levelIndex].story[storyIndex], width / 2, height / 2);

  textSize(14);
  text("Press ENTER", width / 2, height - 40);
}

// ==========================
// WORLD
// ==========================

function drawWorld() {
  fill(30, 70, 110);
  rect(0, groundY, width, height);

  player.draw();

  enemies.forEach(e => e.draw());
  if (boss) boss.draw();

  drawUI();
}

function updateGame() {
  player.update();

  enemies.forEach(e => {
    e.update();
    if (player.hits(e)) e.health -= player.damage;
    if (e.hits(player)) player.health -= 0.04;
  });

  enemies = enemies.filter(e => e.health > 0);

  if (boss) {
    boss.update();
    if (player.hits(boss)) boss.health -= player.damage;
    if (boss.hits(player)) player.health -= 0.06;
  }

  if (enemies.length === 0 && !boss) nextLevel();
  if (boss && boss.health <= 0) nextLevel();
  if (player.health <= 0) gameState = "lose";
}

// ==========================
// PLAYER — DREAM KNIGHT
// ==========================

class Player {
  constructor() {
    this.x = 120;
    this.y = groundY;
    this.w = 28;
    this.h = 50;
    this.vy = 0;

    this.health = 6;
    this.stamina = 100;

    this.attackTimer = 0;
    this.combo = 0;
    this.damage = 1;
    this.facing = 1;
  }

  update() {
    if (keyIsDown(65)) { this.x -= 4; this.facing = -1; }
    if (keyIsDown(68)) { this.x += 4; this.facing = 1; }

    if (keyIsDown(87) && this.y === groundY) this.vy = -12;

    this.y += this.vy;
    this.vy += gravity;

    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
    }

    if (this.attackTimer > 0) this.attackTimer--;
    else this.combo = 0;

    this.stamina = min(100, this.stamina + 0.4);
  }

  draw() {
    push();
    translate(this.x, this.y);

    noStroke();
    fill(120, 160, 255, 40);
    ellipse(0, -25, 60, 80);

    fill(40, 80, 160);
    triangle(-10, 0, 10, 0, -this.facing * 30, -20);

    fill(180, 200, 255);
    rect(-this.w / 2, -this.h, this.w, this.h, 5);

    fill(255);
    ellipse(this.facing * 5, -35, 5);

    if (this.attackTimer > 0) {
      stroke(200, 220, 255);
      strokeWeight(4);
      noFill();
      arc(this.facing * 10, -30, 60, 60, -PI / 4, PI / 4);
    }

    pop();
  }

  attack() {
    if (this.stamina > 15) {
      this.attackTimer = 10;
      this.combo++;
      this.damage = this.combo;
      this.stamina -= 15;
    }
  }

  hits(target) {
    return this.attackTimer > 0 &&
           abs(this.x - target.x) < 45 &&
           abs(this.y - target.y) < 40;
  }
}

// ==========================
// ENEMY — SHADOW FEAR
// ==========================

class Enemy {
  constructor(x) {
    this.x = x;
    this.y = groundY;
    this.health = 3;
    this.float = random(TWO_PI);
  }

  update() {
    this.x += player.x < this.x ? -1.2 : 1.2;
    this.float += 0.05;
  }

  draw() {
    push();
    translate(this.x, this.y - 30);

    noStroke();
    fill(80, 0, 120, 50);
    ellipse(0, sin(this.float) * 5, 50, 60);

    fill(90, 0, 140);
    rect(-15, -30, 30, 40, 6);

    fill(255, 100, 200);
    ellipse(-5, -15, 4);
    ellipse(5, -15, 4);

    pop();
  }

  hits(player) {
    return abs(this.x - player.x) < 25;
  }
}

// ==========================
// BOSS — NIGHTMARE
// ==========================

class Boss {
  constructor(name) {
    this.name = name;
    this.x = width - 200;
    this.y = groundY;
    this.health = 18;
    this.attackCooldown = 0;
    this.pulse = 0;
  }

  update() {
    this.pulse += 0.05;

    if (this.attackCooldown > 0) this.attackCooldown--;
    else {
      this.x += player.x < this.x ? -3 : 3;
      this.attackCooldown = 60;
    }
  }

  draw() {
    push();
    translate(this.x, this.y);

    noStroke();
    fill(200, 50, 50, 50);
    ellipse(0, -40, 120 + sin(this.pulse) * 10, 140);

    fill(120, 0, 0);
    rect(-30, -80, 60, 80, 10);

    fill(255, 50, 50);
    ellipse(-10, -55, 6);
    ellipse(10, -55, 6);

    fill(255);
    textAlign(CENTER);
    text(this.name, 0, -95);

    pop();
  }

  hits(player) {
    return abs(this.x - player.x) < 40;
  }
}

// ==========================
// UI & HELPERS
// ==========================

function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push(new Enemy(400 + i * 100));
  }
}

function drawUI() {
  fill(255, 0, 0);
  rect(20, 20, player.health * 30, 8);

  fill(0, 200, 255);
  rect(20, 35, player.stamina * 2, 6);
}

function drawEnd(msg) {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(26);
  text(msg, width / 2, height / 2);
}

// ==========================
// INPUT
// ==========================

function keyPressed() {
  if (keyCode === ENTER && gameState === "story") {
    storyIndex++;
    if (storyIndex >= levels[levelIndex].story.length) {
      gameState = "play";
    }
  }

  if (key === " ") player.attack();

  if (keyCode === ENTER && gameState === "lose") location.reload();
}
