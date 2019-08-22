const mainMenuId = "menu";
const gameScreenId = "game";
const aboutScreenId = "about";

var mouse;
var mouseClicked;

class Game {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.delta;
        this.lastUpdate = Date.now();

        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");

        this.backBufferCanvas = document.createElement("canvas");
        this.backBufferContext = this.backBufferCanvas.getContext("2d");

        document.body.appendChild(this.backBufferCanvas);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.backBufferCanvas.width = this.width;
        this.backBufferCanvas.height = this.height;

        this.currentScreenId = gameScreenId;
        this.camera = new Camera(this.context);
        this.c_updateFps = 0;
        this.fps = 0;

        this.alpha = 1;

        document.title = "Geometry Shoot";

        window.addEventListener("resize", () => {
            if (window.innerWidth < this.width) {
                this.canvas.width = window.innerWidth;
                this.backBufferCanvas.width = window.innerWidth;
            } else {
                this.canvas.width = this.width;
                this.backBufferCanvas.width = this.width;
            }
            if (window.innerHeight < this.height) {
                this.canvas.height = window.innerHeight;
                this.backBufferCanvas.height = window.innerHeight;
            } else {
                this.canvas.height = this.height;
                this.backBufferCanvas.height = this.height;
            }
        });

        document.addEventListener('mousedown', () => {
            mouseClicked = true;
        });

        document.addEventListener('mouseup', () => {
            mouseClicked = false;
        });

        document.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            return false;
        }, false);

        window.onmousemove = this.mouseMove;
    }

    tick() {
        let now = Date.now();
        this.delta = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;
    }

    run() {
        requestAnimationFrame(() => {
            return this.run();
        });

        this.tick();


        this.backgroundColor = `rgb(172, 172, 252, ${this.alpha})`;

        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.width, this.height);


        if (this.c_updateFps < 0) {
            this.fps = (1 / this.delta).toFixed(2);

            document.getElementById("debug").textContent = `FPS: ${this.fps} | MS: ${(this.delta * 1000).toFixed(0)}`;
            this.c_updateFps = 0.02;
        } else {
            this.c_updateFps -= this.delta;
        }

        switch (this.currentScreenId) {
            case mainMenuId:
                MainMenuScreen.update();
                MainMenuScreen.draw();
                break;
            case gameScreenId:
                GameScreen.update();
                GameScreen.draw();
                break;
            case aboutScreenId:
                AboutScreen.update();
                AboutScreen.draw();
                break;
        }
        //this.context.drawImage(assets['backgroundHexagons'], 0, 0);
        this.backBufferContext.drawImage(this.canvas, 0, 0);
    }

    mouseMove(e) {
        e = event || window.event;
        let mousePos = { x: e.clientX, y: e.clientY };
        let rect = game.backBufferCanvas.getBoundingClientRect();
        let x = mousePos.x - rect.x;
        let y = mousePos.y - rect.y;
        if (x < 0) {
            x = 0;
        }
        if (x > this.width) {
            x = this.width;
        }
        if (y < 0) {
            y = 0;
        }
        if (y > this.height) {
            y = this.height;
        }
        mouse = new Vector2(x, y);
    }
}

// const textColor = "white";
const textColor = "rgb(39, 40, 68)";

class Button {
    constructor(pos, w, h, text, onClick) {
        this.rectangle = rectFromPosition(pos, w, h);
        this.text = text;
        this.onClick = onClick;
        this.textColor = textColor;
        this.font = "60px Abel";
        this.clicked = false;
        this.color = 'rgb(0, 0, 0, 0)';
        // this.color = 'rgb(170, 170, 255)';
    }

    update() {
        if (this.rectangle.includes(mouse) && mouseClicked) {
            this.clicked = true;
        }

        window.addEventListener('mouseup', () => {
            if (this.rectangle.includes(mouse) && this.clicked) {
                this.clicked = false;
                this.onClick();
            }
        });
    }

    draw() {
        if (this.rectangle.includes(mouse)) {
            game.context.strokeStyle = textColor;
        } else {
            game.context.strokeStyle = this.color;
        }

        game.context.fillStyle = this.color;
        game.context.lineWidth = 3;
        Helper.roundRect(game.context, this.rectangle.x, this.rectangle.y, this.rectangle.w, this.rectangle.h, 25, false, true);

        game.context.fillStyle = this.textColor;
        game.context.font = this.font;
        game.context.textAlign = "center";
        game.context.fillText(this.text, this.rectangle.center().x, this.rectangle.center().y + this.rectangle.w / 15);
    }
}


var particles = {
    Settings: function () {
        this.density;
        this.lifespan;
        this.size;
        this.accX = new Size(-100, 100);
        this.accY = new Size(-100, 100);
        this.speed;
        this.velocity;
        this.textures;
        this.onetime;
        this.systemLifetime;
        this.increaseRotation;
    },

    Particle: function (settings, position) {
        this.position = position;
        this.size = settings.size.rand();
        this.speed = settings.speed.rand();
        this.lifespan = settings.lifespan.rand();
        this.initialLifespan = this.lifespan;
        this.acceleration = new Vector2(settings.accX.rand(), settings.accY.rand());
        this.texture = settings.textures[Math.floor(Math.random() * settings.textures.length)];
        this.increaseRotation = settings.increaseRotation;
        this.dir = random(0, 100) < 5 ? -1 : 1;
        this.dead = false;
        this.rotation = 0;

        this.update = function () {
            if (!this.dead) {
                this.acceleration.normalize();
                this.acceleration.mult(this.speed * game.delta);
                this.position.add(this.acceleration);
                this.lifespan -= game.delta;

                if (this.lifespan < 0) {
                    this.dead = true;
                }

                if (this.increaseRotation) {
                    this.rotation = mapValue(this.lifespan, 0, this.initialLifespan, 0, Math.PI * 2) * this.dir;
                }

                this.position.toInt();
            }
        }

        this.draw = function () {
            game.context.drawImage(this.texture, this.position.x, this.position.y, this.size, this.size);
        }
    },

    System: function (rectangle, settings) {
        this.enabled = true;
        this.settings = settings;
        this.rectangle = rectangle;
        this.particles = [];
        this.onetime = settings.onetime;
        this.lifetime = settings.systemLifetime;
        this.finished = false;

        this.update = function () {
            if (this.enabled) {
                if (this.lifetime <= 0 && this.finished) {
                    this.enabled = false;
                } else {
                    if (this.lifetime > 0) {
                        for (let i = 0; i < this.settings.density; i++) {
                            let pos = Helper.randomPointInRect(this.rectangle);
                            this.particles.push(new particles.Particle(this.settings, pos));
                        }

                        this.lifetime -= game.delta;
                    }

                    if (this.particles.length == 0) {
                        this.finished = true;
                    }

                    for (let i = 0; i < this.particles.length; i++) {
                        if (this.particles[i].dead) {
                            this.particles.splice(i, 1);
                        } else {
                            this.particles[i].update();
                        }
                    }
                }
            }
        }

        this.draw = function () {
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].draw();
            }
        }
    },

    effects: [],

    new: function (rectangle, settings) {
        particles.effects.push(new particles.System(rectangle, settings));
    },

    reset: function () {
        particles.effects.length = 0;
    },

    update: function () {
        for (let i = 0; i < particles.effects.length; i++) {
            let e = particles.effects[i];
            if (e.enabled) {
                e.update();
            } else {
                particles.effects.splice(i, 1);
            }
        }
    },

    draw: function () {
        for (let i = 0; i < particles.effects.length; i++) {
            particles.effects[i].draw();
        }
    },

    configs: {
        scoutExplosion: function () {
            let settings = new particles.Settings();

            settings.density = 10;
            settings.increaseRotation = true;
            settings.lifespan = new Size(0.005, 0.01);
            settings.onetime = true;
            settings.size = new Size(7, 13);
            settings.speed = new Size(500, 800);
            settings.systemLifetime = 0.02;
            settings.textures = [
                assets['circle_purple'],
                assets['circle_purple_dark']
            ];

            return settings;
        },

        kamikazeExplosion: function () {
            let settings = particles.configs.scoutExplosion();
            settings.textures = [
                premadeAssets.dark_red_circle,
                premadeAssets.red_bullet
            ];
            return settings
        },

        turretExplosion: function () {
            let settings = particles.configs.kamikazeExplosion();
            settings.textures = [
                premadeAssets.black_bullet,
                premadeAssets.dark_red_circle
            ];
            return settings;
        }
    }
}

function log(object) {
    console.log(object);
}

var assetNames = [
    'player',
    'circle',
    'scout',
    'circle_purple',
    'circle_purple_dark',
    'kamikaze',
    'turretBase',
    'turretCannon',
    'dangerSign',
    'pentagon',

    'Hex(1)',
    'Hex(2)',
    'Hex(3)',
    'Hex(4)',
    'Hex(5)',
    'Hex(6)',
    'Hex(7)',
    'Hex(8)',
    'Hex(9)',
];


var assets = {};
let assetsLoaded = 0;
function loadAssets() {

    for (let i = 0; i < assetNames.length; i++) {
        let asset = new Image();
        asset.src = "assets/" + assetNames[i] + ".png";
        asset.onload = () => {
            assetsLoaded++;
        }
        assets[assetNames[i]] = asset;
    }
}

var game = new Game();

loadAssets();

window.onload = () => {
    premadeAssets.init();

    MainMenuScreen.init();
    AboutScreen.init();
    GameScreen.init();

    document.getElementById("loading").innerText = `Loading: ${assetsLoaded}/${assetNames.length}`;

    if (assetsLoaded == assetNames.length) {
        document.getElementById("loading").style.display = "none";
        game.run();
        console.log("Game started ...")
    }
}

const premadeAssets = {
    bullet: document.createElement('canvas'),
    red_bullet: document.createElement('canvas'),
    dark_red_circle: document.createElement('canvas'),
    black_bullet: document.createElement('canvas'),

    init: function () {
        this.bullet.width = 20;
        this.bullet.height = 20;
        let ctx = this.bullet.getContext('2d');
        ctx.fillStyle = textColor;
        ctx.beginPath();
        ctx.arc(10, 10, 10, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        this.red_bullet.width = 20;
        this.red_bullet.height = 20;
        ctx = this.red_bullet.getContext('2d');
        ctx.fillStyle = 'rgb(128, 38, 86)';
        ctx.beginPath();
        ctx.arc(10, 10, 10, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        this.dark_red_circle.width = 20;
        this.dark_red_circle.height = 20;
        ctx = this.red_bullet.getContext('2d');
        ctx.fillStyle = 'rgb(118, 30, 70)';
        ctx.beginPath();
        ctx.arc(10, 10, 10, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        this.black_bullet.width = 20;
        this.black_bullet.height = 20;
        ctx = this.black_bullet.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(10, 10, 10, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    },
}

const projectile = {
    Bullet: function (position, direction) {
        this.position = Vector2.copy(position);
        this.direction = Vector2.copy(direction);
        this.speed = 600;
        this.size = 12;
        this.dead = false;
        this.lifetime = 2;
        this.texture = premadeAssets.bullet;

        this.update = function () {
            this.lifetime -= game.delta;
            this.direction.normalize();
            this.direction.mult(game.delta * this.speed);
            this.position.add(this.direction);
            if (this.lifetime < 0) {
                this.dead = true;
            }
            this.position.toInt();
        }

        this.draw = function () {
            game.context.drawImage(this.texture, this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
        }
    },

    bombFragment: function (position, direction) {
        this.position = Vector2.copy(position);
        this.direction = Vector2.copy(direction);
        this.speed = 1400;
        this.size = 18;
        this.dead = false;
        this.lifetime = 0.05;
        this.initialLifetime = this.lifetime;
        this.texture = assets['pentagon'];
        this.rotation = 0;

        this.update = function () {
            this.lifetime -= game.delta;
            this.direction.normalize();
            this.direction.mult(game.delta * this.speed);
            this.position.add(this.direction);
            if (this.lifetime < 0) {
                this.dead = true;
            }
            this.position.toInt();

            this.rotation += mapValue(this.lifetime, this.initialLifetime, 0, 0, Math.PI * 2);
        }

        this.draw = function () {
            Helper.drawImage(game.context, this.texture, this.position.x, this.position.y, this.size, this.size, this.rotation);
        }
    }
}

const enemy = {
    Scout: function (position) {
        this.position = position;
        this.direction;
        this.speed = 125;
        this.size = 30;
        this.rotation = 0;
        this.dead = false;
        this.bullets = [];

        this.c_shootingCooldown = 0.75;

        this.shoot = function () {
            let shootingCooldown = 0.75;

            if (this.c_shootingCooldown < 0) {
                let b = new projectile.Bullet(this.position, this.direction);
                b.damage = 5;
                b.speed = 250;
                this.bullets.push(b);

                this.c_shootingCooldown = shootingCooldown;
            } else {
                this.c_shootingCooldown -= game.delta;
            }
        }

        this.checkCollisionWithPlayerBullets = function () {
            for (let i = 0; i < player.bullets.length; i++) {
                if (Helper.distance(this.position, player.bullets[i].position) < this.size / 2 + player.bullets[i].size / 2) {
                    player.bullets[i].dead = true;
                    player.score += player.rewards.scout;
                    let rect = rectFromPosition(this.position, 10, 10);
                    particles.new(rectFromPosition(rect, this.size, this.size), particles.configs.scoutExplosion());
                    this.dead = true;
                }
            }

            if (Helper.distance(this.position, player.position) < this.size / 2 + player.size / 2) {
                this.dead = true;
            }
        }

        this.update = function () {
            this.direction = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
            this.direction.normalize();
            this.direction.mult(game.delta * this.speed);
            this.position.add(this.direction);

            let a = player.position.y - this.position.y;
            let b = player.position.x - this.position.x;
            this.rotation = Math.atan2(a, b) + Math.PI / 2;

            if (game.camera.rectangle.includes(this.position)) {
                this.checkCollisionWithPlayerBullets();
                this.shoot();
            }

            this.position.toInt();

            for (let i = 0; i < this.bullets.length; i++) {
                if (this.bullets[i].dead) {
                    this.bullets.splice(i, 1);
                } else {
                    this.bullets[i].update();

                    if (player.rectangle.includes(this.bullets[i].position)) {
                        player.health -= 1;
                        player.damaged = true;
                        this.bullets.splice(i, 1);
                    }
                }
            }
        }

        this.draw = function () {
            Helper.drawImage(game.context, assets['scout'], this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size, this.rotation);

            for (let i = 0; i < this.bullets.length; i++) {
                this.bullets[i].draw();
            }
        }
    },

    Kamikaze: function (position) {
        this.position = position;
        this.size = 30;
        this.iSize = this.size;
        this.rotation;
        this.dir = random(0, 100) < 50 ? -1 : 1;
        this.checkPoint = position;
        this.angle = 0;
        this.lifetime = random(1, 3);
        this.iLifetime = this.lifetime;
        this.speed = 100;
        this.unit = 1;

        this.checkCollisionWithPlayerBullets = function () {
            for (let i = 0; i < player.bullets.length; i++) {
                if (Helper.distance(this.position, player.bullets[i].position) < this.size / 2 + player.bullets[i].size / 2) {
                    player.bullets[i].dead = true;
                    player.score += player.rewards.kamikaze;
                    let rect = rectFromPosition(this.position, 10, 10);
                    particles.new(rectFromPosition(rect, this.size, this.size), particles.configs.kamikazeExplosion());
                    this.dead = true;
                }
            }

            if (Helper.distance(this.position, player.position) < this.size / 2 + player.size / 2) {
                this.dead = true;
            }
        }

        this.shoot = function () {
            for (let i = 0; i < 360; i += 15) {
                let x = this.position.x + Math.cos(i);
                let y = this.position.y + Math.sin(i);
                let dir = new Vector2(x - this.position.x, y - this.position.y);
                dir.normalize();
                let b = new projectile.Bullet(new Vector2(this.position.x, this.position.y), dir);
                b.speed = 150;
                b.texture = premadeAssets.red_bullet;
                enemy.projectiles.push(b);
            }
        }

        this.update = function () {

            if (game.camera.rectangle.includes(this.position)) {
                this.lifetime -= game.delta;
            }

            if (this.lifetime < 0) {
                this.shoot();
                this.dead = true;
            }

            if (this.lifetime < this.iLifetime / 2) {
                this.pulse();
            }

            if (Helper.distance(this.checkPoint == null || this.checkPoint, this.position) < 50) {
                let radius = 250;
                let x = player.position.x + Math.cos(this.angle) * radius;
                let y = player.position.y + Math.sin(this.angle) * radius;

                this.checkPoint = new Vector2(x, y);
                this.angle += this.dir * 5;
            }

            let direction = new Vector2(this.checkPoint.x - this.position.x, this.checkPoint.y - this.position.y);
            direction.normalize();
            direction.mult(this.speed * game.delta);
            this.position.add(direction);

            this.rotation = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x) + Math.PI / 2;

            this.checkCollisionWithPlayerBullets();

            this.position.toInt();
        }

        this.pulse = function () {
            let i = mapValue(this.lifetime, this.iLifetime, 0, 1, 3);
            this.size += this.unit * i / 2;

            if (this.size > this.iSize * 1.25 || this.size < this.iSize * 0.75) {
                this.unit *= -1;
            }
        }

        this.draw = function () {
            Helper.drawImage(game.context, assets['kamikaze'], this.position.x, this.position.y, this.size, this.size, this.rotation);
        }
    },

    Turret: function (position) {
        this.position = position;
        this.rotation = 0;
        this.speed = 225;
        this.baseSize = 40;
        this.dead = false;
        this.checkPoint = this.position;
        this.c_shootingCooldown = 1;
        this.c_standingCooldown;

        this.checkCollisionWithPlayerBullets = function () {
            for (let i = 0; i < player.bullets.length; i++) {
                let contactPoint = new Vector2(this.position.x + this.baseSize / 2, this.position.y + this.baseSize / 2);
                if (Helper.distance(contactPoint, player.bullets[i].position) < this.baseSize / 2 + player.bullets[i].size / 2) {
                    player.bullets[i].dead = true;
                    player.score += player.rewards.turret;
                    let rect = rectFromPosition(this.position, this.baseSize, this.baseSize);
                    particles.new(rect, particles.configs.turretExplosion());
                    this.dead = true;
                    popup.popups.push(new popup.Popup("+" + player.rewards.turret, this.position));
                }
            }

            if (Helper.distance(this.position, player.position) < this.size / 2 + player.size / 2) {
                this.dead = true;
            }
        }

        this.shoot = function () {

            if (this.bulletDirection == null) {
                this.bulletDirection = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
            }

            let shootingCooldown = 0.2;

            if (this.c_shootingCooldown < 0) {
                let pos = new Vector2(this.position.x + this.baseSize / 2, this.position.y + this.baseSize / 2);
                let b = new projectile.Bullet(pos, this.bulletDirection);
                b.lifetime = 2;
                b.speed = 200;
                b.texture = premadeAssets.black_bullet;
                enemy.projectiles.push(b);
                this.c_shootingCooldown = shootingCooldown;
            } else {
                this.c_shootingCooldown -= game.delta;
                this.bulletDirection = null;
            }
        }

        this.update = function () {
            this.checkCollisionWithPlayerBullets();

            if (Helper.distance(this.checkPoint, this.position) < 100 || !game.camera.rectangle.includes(this.position)) {
                let standingCooldown = 1.5;
                if (this.c_standingCooldown > 0) {
                    this.shoot();
                    this.c_standingCooldown -= game.delta;
                } else {
                    this.c_standingCooldown = standingCooldown;
                    this.checkPoint = Helper.randomPointInRect(rectFromPosition(player.position, game.width / 2, game.height / 2));
                }
            }

            let direction = new Vector2(this.checkPoint.x - this.position.x, this.checkPoint.y - this.position.y);

            direction.normalize();
            direction.mult(game.delta * this.speed);
            this.position.add(direction);
            this.position.toInt();
        }

        this.draw = function () {
            Helper.drawImage(game.context, assets['turretBase'], this.position.x, this.position.y, this.baseSize, this.baseSize, this.rotation);
        }
    },

    Bomb: function (position, target) {
        this.position = position;
        this.target = Vector2.copy(target);
        this.distanceToTarget = Math.floor(Helper.distance(position, this.target));
        this.speed = 300;
        this.rotation = 0;
        this.size = 40;
        this.cooldown = 2;
        this.dangerSize = this.size;
        this.unit = 1;
        this.dead = false;

        this.explode = function () {

            for (let i = 0; i < 360; i += 10) {
                let x = this.position.x + Math.cos(i);
                let y = this.position.y + Math.sin(i);
                let dir = new Vector2(x - this.position.x, y - this.position.y);
                dir.normalize();
                let b = new projectile.bombFragment(new Vector2(this.position.x, this.position.y), dir);
                enemy.projectiles.push(b);
            }

            this.dead = true;
        }

        this.update = function () {
            if (this.cooldown < 0) {
                let direction = new Vector2(this.target.x - position.x, this.target.y - position.y);
                direction.normalize();
                direction.mult(this.speed * game.delta);
                this.position.add(direction);

                this.position.toInt();

                this.rotation = mapValue(Helper.distance(this.position, this.target), this.distanceToTarget, 0, 0, 2 * Math.PI);

                if (Helper.distance(this.position, this.target) < 10) {
                    this.explode();
                }

            } else {
                if (this.dangerSize > this.size * 1.25 || this.dangerSize < this.size * 0.75) {
                    this.unit *= -1;
                }
                this.dangerSize += this.unit;

                this.cooldown -= game.delta;
            }
        }

        this.draw = function () {
            if (this.cooldown < 0) {
                Helper.drawImage(game.context, assets['pentagon'], this.position.x, this.position.y, this.size, this.size, this.rotation);
            } else {
                Helper.drawImage(game.context, assets['dangerSign'], this.target.x, this.target.y, this.dangerSize, this.dangerSize);
            }
        }
    },

    enemies: [],
    projectiles: [],

    reset: function () {
        this.enemies = [];
        this.projectiles = [];
        this.c_spawnCooldown = 2;
    },

    kamikazeUnlocked: false,
    turretUnlocked: false,
    bombUnlocked: false,

    c_spawnCooldown: 1,

    maxEnemyCount: 4,

    c_enemyCountIncreaseCD: 3,

    bombSpawnCD: 3,

    update: function () {

        if (player.score > 80 && this.bombUnlocked == false) {
            this.bombUnlocked = true;
        }

        if (player.score > 50 && this.kamikazeUnlocked == false) {
            this.kamikazeUnlocked = true;
        }

        if (player.score > 120 && this.turretUnlocked == false) {
            this.turretUnlocked = true;
        }

        if (this.c_enemyCountIncreaseCD < 0) {
            this.maxEnemyCount++;
            this.c_enemyCountIncreaseCD = random(this.maxEnemyCount / 2, this.maxEnemyCount);
        } else {
            this.c_enemyCountIncreaseCD -= game.delta;
        }

        if (this.c_spawnCooldown < 0 && this.enemies.length == 0) {

            let pos = this.chooseSpawnPos();

            if (this.enemies.length < this.maxEnemyCount) {
                this.spawnEnemy(pos);
            }

            let spawnCooldown = random(0.5, 2);
            this.c_spawnCooldown = spawnCooldown;
        } else {
            this.c_spawnCooldown -= game.delta;
        }

        if (this.bombSpawnCD < 0 && this.bombUnlocked) {
            this.projectiles.push(new this.Bomb(this.chooseSpawnPos(), player.position));
            this.bombSpawnCD = random(1, 4);
        } else {
            this.bombSpawnCD -= game.delta;
        }

        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].dead) {
                this.enemies.splice(i, 1);
            } else {
                this.enemies[i].update();
            }
        }

        for (let i = 0; i < this.projectiles.length; i++) {
            if (this.projectiles[i].dead) {
                this.projectiles.splice(i, 1);
            } else {
                this.projectiles[i].update();

                if (player.rectangle.includes(this.projectiles[i].position)) {
                    player.health -= 1;
                    player.damaged = true;
                    this.projectiles.splice(i, 1);
                }
            }
        }
    },

    draw: function () {
        for (let i = 0; i < this.enemies.length; i++) {
            if (game.camera.rectangle.includes(this.enemies[i].position)) {
                this.enemies[i].draw();
            }
        }

        for (let i = 0; i < this.projectiles.length; i++) {
            if (game.camera.rectangle.includes(this.projectiles[i].position)) {
                this.projectiles[i].draw();
            }
        }
    },

    chooseSpawnPos() {
        let angle = random(0, 360).toFixed(0);
        let radius = random(game.width / 2, game.height / 2);
        let x = player.position.x + Math.cos(angle) * radius;
        let y = player.position.y + Math.sin(angle) * radius;
        let pos = new Vector2(x, y);
        return pos;
    },

    spawnEnemy(pos) {
        let e;

        let rand = random(0, 100);

        if (rand < 20) {
            if (this.turretUnlocked) {
                e = new this.Turret(pos);
            } else {
                this.spawnEnemy(pos);
            }
        } else if (rand < 60) {
            e = new this.Scout(pos);
        } else {
            if (this.kamikazeUnlocked) {
                e = new this.Kamikaze(pos);
            } else {
                this.spawnEnemy(pos);
            }
        }

        if (e) {
            this.enemies.push(e);
        }
    }
}

class Player {
    constructor() {
        this.position = new Vector2(0, 0);
        this.rotation = 0;
        this.health = 3;
        this.speed = 200;
        this.direction = new Vector2(0, 0);
        this.size = 40;
        this.idleCheckpoint = this.position;
        this.dead = false;
        this.score = 0;
        this.camPos = this.position;
        this.bullets = [];
        this.c_shootingCooldown = 0;
        this.damaged = false;
        this.spaceBarClicked = false;

        this.addDashCooldown = 2;
        this.addHealthCooldown = 5;

        this.joystick = {
            position: new Vector2(0, 0),
            center: new Vector2(0, 0),
            a: 0,
            hasValue: false,

            update: function () {
                if (mouseClicked) {
                    if (!this.hasValue) {
                        this.center = mouse;
                        this.hasValue = true;
                    }
                    this.position = mouse;
                } else {
                    this.position = this.center;
                }

                if (!mouseClicked) {
                    this.hasValue = false;
                }
            },

            direction() {
                let d = new Vector2(this.position.x - this.center.x, this.position.y - this.center.y);
                d.normalize();
                return d;
            },

            draw() {
                if (this.hasValue) {
                    game.context.fillStyle = textColor;

                    game.context.globalAlpha = 0.1;
                    game.context.beginPath();
                    game.context.arc(this.center.x, this.center.y, 60, 0, 2 * Math.PI);
                    game.context.closePath();
                    game.context.fill();

                    if (Helper.distance(this.center, this.position) < 50) {
                        game.context.beginPath();
                        game.context.globalAlpha = 0.2;
                        game.context.arc(this.position.x, this.position.y, 20, 0, 2 * Math.PI);
                        game.context.closePath();
                        game.context.fill();
                        game.context.globalAlpha = 1;
                    } else {
                        let a = this.position.y - this.center.y;
                        let b = this.position.x - this.center.x;

                        let angle = Math.atan2(a, b);

                        let x = this.center.x + Math.cos(angle) * 50;
                        let y = this.center.y + Math.sin(angle) * 50;

                        game.context.beginPath();
                        game.context.globalAlpha = 0.2;
                        game.context.arc(x, y, 20, 0, 2 * Math.PI);
                        game.context.closePath();
                        game.context.fill();
                        game.context.globalAlpha = 1;
                    }
                }
            }
        }

        this.rewards = {
            scout: 5,
            kamikaze: 10,
            turret: 15
        };

        window.addEventListener('keydown', (e) => {
            if (e.keyCode == 32 && this.dashes > 0 && !this.dashing && this.joystick.hasValue && !this.spaceBarClicked) {
                this.dashes--;
                this.dashing = true;
                this.spaceBarClicked = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.keyCode == 32) {
                this.spaceBarClicked = false;
            }
        })
    }

    reset() {
        this.position = new Vector2(0, 0);
        this.camPos = this.position;
        this.rotation = 0;
        this.health = 3;
        this.direction = new Vector2(0, 0);
        this.dead = false;
        this.bullets = [];
        this.score = 0;

        this.damaged = false;
        this.dmgCooldown = 0.12;

        this.dashing = false;
        this.dashDuration = 0.4;
        this.c_dashDuration = this.dashDuration;
        this.dashes = 3;

        this.rectangle = rectFromPosition(this.position, this.size, this.size);

        this.camSpeed = 0.03;
    }

    dash() {
        if (this.dashDirection == null) {
            this.dashDirection = this.joystick.direction();
        }
        if (this.c_dashDuration > 0) {
            this.dashDirection.normalize();
            this.dashDirection.mult(this.speed * 6 * game.delta);
            player.position.add(this.dashDirection);
            this.c_dashDuration -= game.delta;
        } else {
            this.dashing = false;
            this.dashDirection = null;
            this.c_dashDuration = this.dashDuration;
        }
    }

    update() {
        if (!this.dead) {

            if (this.addHealthCooldown < 0) {
                this.health++;
                this.addHealthCooldown = 10;
            } else if (this.health < 3) {
                this.addHealthCooldown -= game.delta;
            }

            if (this.addDashCooldown < 0) {
                this.dashes++;
                this.addDashCooldown = 4;
            } else if (this.dashes < 3) {
                this.addDashCooldown -= game.delta;
            }

            if (this.damaged) {
                this.dmgCooldown -= game.delta;

                if (this.dmgCooldown < 0) {
                    this.damaged = false;
                    this.dmgCooldown = 0.05;
                }
            }

            if (this.dashing) {
                this.dash();
            } else if (this.joystick.hasValue) {

                this.direction = this.joystick.direction();
                this.direction.normalize();
                this.direction.mult(this.speed * game.delta);
                this.position.add(this.direction);

                this.rectangle = rectFromPosition(this.position, this.size, this.size);

                let a = this.joystick.position.y - this.joystick.center.y;
                let b = this.joystick.position.x - this.joystick.center.x;
                this.rotation = Math.atan2(a, b) + 90 * Math.PI / 180;

                this.shoot();

                this.position.toInt();
            }


            for (let i = 0; i < this.bullets.length; i++) {
                if (this.bullets[i].dead) {
                    this.bullets.splice(i, 1);
                } else {
                    this.bullets[i].update();
                }
            }

            if (this.dashing) {
                this.camPos = Vector2.lerp(this.camPos, this.position, 0.1);
            } else {
                //this.camPos = Vector2.lerp(this.camPos, this.position, this.camSpeed);
                this.camPos = this.position;
            }
            game.camera.moveTo(this.camPos.x, this.camPos.y);

            if (this.health < 1) {
                this.dead = true;
            }
        }
    }

    shoot() {
        let shootingCooldown = 0.3;

        if (this.c_shootingCooldown < 0 && (this.direction.x != 0 && this.direction.y != 0)) {
            let bullet = new projectile.Bullet(this.position, this.direction);
            this.bullets.push(bullet);
            this.c_shootingCooldown = shootingCooldown;
        } else {
            this.c_shootingCooldown -= game.delta;
        }
    }

    draw() {

        if (!this.dead) {
            for (let i = 0; i < this.bullets.length; i++) {
                if (game.camera.rectangle.includes(this.bullets[i].position)) {
                    this.bullets[i].draw();
                }
            }
        }

        Helper.drawImage(game.context, assets['player'], this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size, this.rotation);

        // game.context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        // game.context.fillRect(this.rectangle.x, this.rectangle.y, this.rectangle.w, this.rectangle.h);
    }

    updateIdleState() {
        if (Helper.distance(this.position, this.idleCheckpoint) < 20) {
            this.idleCheckpoint = Helper.randomPointInRect(new Rectangle(-game.width / 2, -game.height / 2, game.width / 2, game.height / 2));
        }

        let dir = new Vector2(this.idleCheckpoint.x - this.position.x, this.idleCheckpoint.y - this.position.y);
        dir.normalize();
        dir.mult(this.speed / 2 * game.delta);
        this.position.add(dir);

        let a = this.idleCheckpoint.y - this.position.y;
        let b = this.idleCheckpoint.x - this.position.y;
        this.rotation = Math.atan2(a, b) + Math.PI / 2;
    }
}

var popup = {
    Popup: function (text, position) {
        this.text = text;
        this.position = position;
        this.duration = 0.4;
        this.iDuration = this.duration;
        this.font = "35px Abel";
        this.color = new Color(39, 40, 68, 1);
        this.dead = false;

        this.update = function () {
            this.duration -= game.delta;

            if (this.duration < 0) {
                this.dead = true;
            }
        }

        this.draw = function () {
            this.color.a = mapValue(this.duration, this.iDuration, 0, 1, 0);
            game.context.font = this.font;
            game.context.fillStyle = this.color;
            game.context.textAlign = 'center';
            game.context.fillText(this.text, this.position.x, this.position.y);
            game.context.globalAlpha = 1;
        }
    },

    popups: [],

    update: function () {
        for (let i = 0; i < this.popups.length; i++) {
            if (this.popups[i].dead) {
                this.popups.splice(i, 1);
            } else {
                this.popups[i].update();
            }
        }
    },

    draw: function () {
        for (let i = 0; i < this.popups.length; i++) {
            this.popups[i].draw();
        }
    }
}

const player = new Player();

var MainMenuScreen = {

    playButton: new Button(new Vector2(game.width / 2, game.height / 2 + 75), 300, 100, "PLAY", () => {
        player.reset();
        game.currentScreenId = gameScreenId;
    }),

    aboutButton: new Button(new Vector2(game.width / 2, game.height / 2 + 200), 300, 100, "ABOUT", () => {
        game.currentScreenId = aboutScreenId;
    }),

    init: function () {

    },

    update: function () {
        player.updateIdleState();
        this.playButton.update();
        this.aboutButton.update();
    },

    bigText: false,
    bigTextCooldown: 0.25,
    c_bigTextCooldown: 0,

    draw: function () {

        game.camera.begin();
        player.draw();
        game.camera.end();

        game.context.fillStyle = game.backgroundColor;
        game.context.globalAlpha = 0.2;
        game.context.fillRect(0, 0, game.width, game.height);
        game.context.globalAlpha = 1;

        if (this.c_bigTextCooldown < 0) {

            if (this.bigText) {
                this.bigText = false;
            } else {
                this.bigText = true;
            }

            this.c_bigTextCooldown = this.bigTextCooldown;
        } else {
            this.c_bigTextCooldown -= game.delta;
        }

        if (this.bigText) {
            game.context.font = "102px Abel";
        } else {
            game.context.font = "100px Abel";
        }

        game.context.fillStyle = textColor;
        game.context.fillText("GEOMETRY SHOOT", game.width / 2, 200);

        this.playButton.draw();
        this.aboutButton.draw();
    }
};

let gamePaused = false;
function resetGameScreen() {
    player.reset();
    enemy.reset();
    gamePaused = false;
    game.showTip = true;
    game.tipCooldown = 1.4;
    background.elements.length = 0;
}
var GameScreen = {

    pauseButton: new Button(new Vector2(game.width - 85, 30), 150, 50, "PAUSE", () => {
        if (gamePaused) {
            gamePaused = false;
        } else {
            gamePaused = true;
        }
    }),

    menuButton: new Button(new Vector2(game.width / 2, game.height / 2 + 125), 150, 50, "MENU", () => {
        resetGameScreen();
        game.currentScreenId = mainMenuId;
    }),

    restartButton: new Button(new Vector2(game.width / 2, game.height / 2 + 200), 150, 50, "RESTART", () => {
        resetGameScreen();
    }),

    showTip: true,
    tipCooldown: 1,

    init: function () {
        resetGameScreen();
        this.pauseButton.font = "30px Abel";
        this.menuButton.font = "30px Abel";
        this.restartButton.font = "30px Abel";
    },

    update: function () {
        background.update();
        this.pauseButton.update();
        player.joystick.update();

        if (gamePaused == false && !player.dead) {
            player.update();
            enemy.update();
            particles.update();
            popup.update();
        } else {
            this.menuButton.update();
            this.restartButton.update();
        }

        if (player.dead) {
            this.menuButton.update();
            this.restartButton.update();
        }
    },

    draw: function () {
        game.camera.begin();
        background.draw();
        particles.draw();
        player.draw();
        enemy.draw();
        popup.draw();
        game.camera.end();

        if (this.showTip && this.tipCooldown > 0) {
            game.context.fillStyle = textColor;
            game.context.font = "40px Abel";
            if (this.tipCooldown < 0.7) {
                game.context.globalAlpha = mapValue(this.tipCooldown, 0.7, 0, 1, 0);
            }
            game.context.fillText("Hold and move mouse", game.width / 2, game.height / 10 * 3);
            game.context.globalAlpha = 1;
            this.tipCooldown -= game.delta;
        } else {
            this.showTip = false;
        }

        if (!gamePaused) {
            player.joystick.draw();
        }

        if (gamePaused) {
            game.context.globalAlpha = 0.5;
            game.context.fillStyle = game.backgroundColor;
            game.context.fillRect(0, 0, game.width, game.height);
            game.context.globalAlpha = 1;

            game.context.fillStyle = textColor;
            game.context.font = "40px Abel";
            game.context.fillText("Press PAUSE button", game.width / 2, game.height / 2);
            game.context.fillText("again to continue", game.width / 2, game.height / 2 + 50);

            this.menuButton.draw();
            this.restartButton.draw();
        }

        if (player.dead) {

            game.context.fillStyle = textColor;
            game.context.font = "40px Abel";
            game.context.fillText("You have been slain!", game.width / 2, game.height / 2);
            game.context.fillText("Score: " + player.score, game.width / 2, game.height / 2 + 50);

            this.restartButton.draw();
            this.menuButton.draw();
        } else {
            this.drawPlayerHealthAndDashes();
            this.pauseButton.draw();

            game.context.font = "40px Abel";
            game.context.fillStyle = textColor;
            game.context.fillText(player.score, game.width / 2, 40);
        }

    },

    drawPlayerHealthAndDashes: function () {
        if (player.health > 0) {
            for (let i = 0; i < player.health; i++) {
                let x = 35 + (i * 35);
                game.context.fillStyle = textColor;
                game.context.lineWidth = 2;
                game.context.beginPath();
                game.context.arc(x, 25, 10, 0, Math.PI * 2);
                game.context.closePath();
                game.context.fill();
            }
        }

        if (player.dashes > 0) {
            for (let i = 0; i < player.dashes; i++) {
                let x = 35 * 5 + (i * 35);

                game.context.strokeStyle = textColor;
                game.context.lineWidth = 7;
                game.context.beginPath();
                game.context.moveTo(x, 25 + 10);
                game.context.lineTo(x + 10, 25 - 10);
                game.context.closePath();
                game.context.stroke();
            }
        }
    }
};

var AboutScreen = {

    backButton: new Button(new Vector2(game.width / 2, game.height - 100), 200, 50, "BACK", () => {
        game.currentScreenId = mainMenuId;
    }),

    init: function () {
        this.backButton.font = "40px Abel";
    },

    update: function () {
        this.backButton.update();
    },

    draw: function () {
        game.context.font = "120px Abel";
        game.context.fillStyle = textColor;
        game.context.fillText("ABOUT", game.width / 2, 200);

        game.context.font = "30px Abel";
        game.context.fillText("Game made by Mihai Solomon,", game.width / 2, game.height / 2);
        game.context.fillText("feel free to contact me at", game.width / 2, game.height / 2 + 35);
        game.context.fillText("solomonmihai10@gmail.com", game.width / 2, game.height / 2 + 70);
        this.backButton.draw();
    }
}

var background = {

    Element: function(position) {
        this.position = position;
        this.rotationIncrement = random(0, 100) < 50 ? -Math.PI / 180 / 4 : Math.PI / 180 / 4;
        this.texture = assets[`Hex(${Math.floor(random(1, 9))})`];
        this.speed = random(25, 75);
        this.scale = Math.floor(random(0.3, 0.9));
        this.dead = false;
        this.rotation = Math.floor(random(0, 360)) * Math.PI / 180;

        this.update = function() {
            let playerArea = rectFromPosition(player.position, game.camera.rectangle.w * 1.5, game.camera.rectangle.h * 1.5);
            if (playerArea.includes(this.position) == false) {
                this.dead = false;
            }
            let playerDir = player.joystick.direction();
            this.direction = new Vector2(-playerDir.x, -playerDir.y);
            this.direction.normalize();
            this.direction.mult(game.delta * this.speed);
            this.position.add(this.direction);
            this.rotation += this.rotationIncrement;
        }

        this.draw = function() {
            Helper.drawImage(game.context, this.texture, this.position.x, this.position.y, this.texture.width * this.scale, this.texture.height * this.scale, this.rotation);
        }
    },

    chooseSpawnPosition() {
        let playerArea = rectFromPosition(player.position, game.camera.rectangle.w * 1.5, game.camera.rectangle.h * 1.5);
        let pos = Helper.randomPointInRect(playerArea);
        if (game.camera.rectangle.includes(pos)) {
            return this.chooseSpawnPosition();
        } else {
            return pos;
        }
    },

    elements: [],
    elementsLimit: 75,
    spawnCooldown: 0.1,

    update: function() {

        if (this.spawnCooldown < 0 && this.elements.length < this.elementsLimit) {
            this.elements.push(new this.Element(this.chooseSpawnPosition()));
            this.spawnCooldown = 1;
        } else {
            this.spawnCooldown -= game.delta;
        }

        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].dead) {
                this.elements.splice(i, 1);
            } else {
                this.elements[i].update();
            }
        }
    },

    draw: function() {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].draw();
        }
    }
}
