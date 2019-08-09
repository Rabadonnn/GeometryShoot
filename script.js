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
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.backgroundColor = "rgb(191, 192, 255)";
        this.currentScreenId = gameScreenId;
        this.camera = new Camera(this.context);
        this.c_updateFps = 0;
        this.fps = 0;

        window.addEventListener("resize", () => {
            if (window.innerWidth < this.width) {
                this.canvas.width = window.innerWidth;
            } else {
                this.canvas.width = this.width;
            }
            if (window.innerHeight < this.height) {
                this.canvas.height = window.innerHeight;
            } else {
                this.canvas.height = this.height;
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


        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.width, this.height);

        if (this.c_updateFps < 0) {
            this.fps = Math.floor(1 / this.delta)
            this.c_updateFps = 0.1;
        } else {
            this.c_updateFps -= this.delta;
        }

        this.context.fillStyle = textColor;
        this.context.font = "15px Arial";
        this.context.fillText("FPS: " + this.fps, 28, game.height - 20);

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
    }

    mouseMove(e) {
        e = event || window.event;
        let mousePos = { x: e.clientX, y: e.clientY };
        let rect = game.canvas.getBoundingClientRect();
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

const textColor = "rgb(39, 40, 68)";

class Button {
    constructor(pos, w, h, text, onClick) {
        this.rectangle = rectFromPosition(pos, w, h);
        this.text = text;
        this.onClick = onClick;
        this.textColor = textColor;
        this.font = "60px Abel";
        this.clicked = false;
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
            game.context.strokeStyle = 'rgb(170, 170, 255)';
        }

        game.context.fillStyle = 'rgb(170, 170, 255)';
        game.context.lineWidth = 2;
        Helper.roundRect(game.context, this.rectangle.x, this.rectangle.y, this.rectangle.w, this.rectangle.h, 25, true, true);

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
            settings.lifespan = new Size(0.01, 0.05);
            settings.onetime = true;
            settings.size = new Size(7, 13);
            settings.speed = new Size(500, 800);
            settings.systemLifetime = 0.05;
            settings.textures = [
                assets['circle_purple'],
                assets['circle_purple_dark']
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
    'kamikaze'
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

    MainMenuScreen.init();
    AboutScreen.init();
    GameScreen.init();

    premadeAssets.init();

    if (assetsLoaded == assetNames.length) {
        document.getElementById("loading").style.display = "none";
        game.run();
        console.log("Game started ...")
    }
}

const premadeAssets = {
    bullet: document.createElement('canvas'),

    init: function () {
        this.bullet.width = 20;
        this.bullet.height = 20;
        let ctx = this.bullet.getContext('2d');
        ctx.fillStyle = textColor;
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
        this.damage;

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
            game.context.drawImage(premadeAssets.bullet, this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
        }
    }
}

const enemy = {
    Scout: function (position) {
        this.position = position;
        this.direction;
        this.speed = 125;
        this.size = 30;
        this.bullets = [];
        this.rotation = 0;
        this.dead = false;
        this.damage = 10;

        this.c_shootingCooldown = 0.75;

        this.shoot = function () {
            let shootingCooldown = 0.75;

            if (this.c_shootingCooldown < 0) {

                let b = new projectile.Bullet(this.position, this.direction);
                b.damage = 10;
                b.speed = 200;
                enemy.projectiles.push(b);

                this.c_shootingCooldown = shootingCooldown;
            } else {
                this.c_shootingCooldown -= game.delta;
            }
        }

        this.checkCollisionWithPlayerBullets = function () {
            for (let i = 0; i < player.bullets.length; i++) {
                if (Helper.distance(this.position, player.bullets[i].position) < this.size / 2) {
                    player.bullets[i].dead = true;
                    player.score += player.rewards.kamikaze[0];
                    player.fuel += player.rewards.kamikaze[1];
                    let rect = rectFromPosition(this.position, 10, 10);
                    particles.new(rectFromPosition(rect, this.size, this.size), particles.configs.scoutExplosion());
                    this.dead = true;
                }
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

            this.checkCollisionWithPlayerBullets();
            this.shoot();

            this.position.toInt();
        }

        this.draw = function () {
            Helper.drawRotatedImage(game.context, assets['scout'], this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size, this.rotation);
        }
    },

    Kamikaze: function(position) {
        this.position = position;
        this.size = 30;
        this.iSize = this.size;
        this.rotation;
        this.dir = random(0, 100) < 50 ? -1 : 1;
        this.checkPoint;
        this.angle = 0;
        this.lifetime = random(1, 3);
        this.iLifetime = this.lifetime;
        this.speed = 100;
        this.unit = 1;

        this.checkCollisionWithPlayerBullets = function () {
            for (let i = 0; i < player.bullets.length; i++) {
                if (Helper.distance(this.position, player.bullets[i].position) < this.size / 2) {
                    player.bullets[i].dead = true;
                    player.score += player.rewards.scout[0];
                    player.fuel += player.rewards.scout[1];
                    let rect = rectFromPosition(this.position, 10, 10);
                    particles.new(rectFromPosition(rect, this.size, this.size), particles.configs.scoutExplosion());
                    this.dead = true;
                }
            }
        }

        this.shoot = function() {

        }

        this.update = function() {

            this.lifetime -= game.delta;

            if (this.lifetime < 0) {
                this.shoot();
                this.dead = true;
            }

            if (this.lifetime < this.iLifetime / 2) {
                this.pulse();
            }

            if (Helper.distance(this.checkPoint, this.position) < 50 || checkPoint == null) {
                let radius = 250;
                let x = player.position.x + Math.cos(this.angle) * radius;
                let y = player.position.y + Math.sin(this.angle) * radius;

                this.checkPoint = new Vector2(x, y);
                angle += dir * 5;
            }

            let direction = new Vector2(this.checkPoint.x - this.position.x, this.checkPoint.y - this.position.y);
            direction.normalize();
            direction.mult(this.speed * game.delta);
            this.position.add(this.direction);

            this.rotation = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x) + Math.PI / 2;
        
            this.checkCollisionWithPlayerBullets();
        }

        this.pulse = function() {
            let i = mapValue(this.lifetime, this.iLifetime, 0, 1, 3);
            this.size += this.unit * i;

            if (this.size > this.iSize * 1.25 || this.size < this.iSize * 0.75) {
                this.unit *= -1;
            }
        }

        this.draw = function() {
            Helper.drawRotatedImage(game.context, assets['kamikaze'], this.position.x, this.position.y, this.size, this.size, this.rotation);
        }
    },

    enemies: [],
    projectiles: [],

    reset: function () {
        this.enemies = [];
        this.c_spawnCooldown = 2;
    },

    c_spawnCooldown: 2,

    update: function () {

        let spawnCooldown = 2;

        if (this.c_spawnCooldown < 0 && this.enemies.length == 0) {
            let e = new this.Scout(new Vector2(0, 0));
            this.enemies.push(e);
            this.c_spawnCooldown = spawnCooldown;
        } else {
            this.c_spawnCooldown -= game.delta;
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

                if (Helper.distance(this.projectiles[i].position, player.position) < player.size / 2) {
                    player.fuel -= this.projectiles[i].damage;
                    this.projectiles.splice(i, 1);
                }
            }
        }
    },

    draw: function () {
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].draw();
        }

        for (let i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].draw();
        }
    }
}

class Player {
    constructor() {
        this.rectangle;
        this.position = new Vector2(0, 0);
        this.rotation = 0;
        this.fuel = 100;
        this.speed = 300;
        this.direction = new Vector2(0, 0);
        this.size = 40;
        this.idleCheckpoint = this.position;
        this.dead = false;
        this.score = 0;
        this.camPos = this.position;
        this.bullets = [];
        this.c_shootingCooldown = 0;

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
            scout: [
                10,
                5
            ],
            kamikaze: [
                15, 
                7
            ]
        }
    }

    reset() {
        this.position = new Vector2(0, 0);
        this.camPos = this.position;
        this.rotation = 0;
        this.fuel = 100;
        this.speed = 300;
        this.direction = new Vector2(0, 0);
        this.dead = false;
        this.bullets = [];
        this.score = 0;
    }

    update() {
        if (!this.dead) {
            if (this.joystick.hasValue) {

                this.direction = this.joystick.direction();
                this.direction.mult(this.speed * game.delta);
                this.position.add(this.direction);

                this.rectangle = rectFromPosition(this.position, this.size, this.size);

                let a = this.joystick.position.y - this.joystick.center.y;
                let b = this.joystick.position.x - this.joystick.center.x;
                this.rotation = Math.atan2(a, b) + 90 * Math.PI / 180;

                this.fuel -= 4 * game.delta;

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

            this.camPos = Vector2.lerp(this.camPos, this.position, 0.01);
            //game.camera.moveTo(this.camPos.x, this.camPos.y);

            if (this.fuel < 1) {
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
                this.bullets[i].draw();
            }
        }

        Helper.drawRotatedImage(game.context, assets['player'], this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size, this.rotation);


        // game.context.fillStyle = "black";
        // game.context.beginPath();
        // game.context.arc(this.position.x, this.position.y, 10, 0, Math.PI * 2);
        // game.context.closePath();
        // game.context.fill();
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
        this.pauseButton.update();
        player.joystick.update();

        if (gamePaused == false && !player.dead) {
            player.update();
            enemy.update();
            particles.update();
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
        particles.draw();
        player.draw();
        enemy.draw();
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
            game.context.fillText("You ran out of Fuel!", game.width / 2, game.height / 2);
            game.context.fillText("Score: " + player.score, game.width / 2, game.height / 2 + 50);

            this.restartButton.draw();
            this.menuButton.draw();
        } else {
            this.drawPlayerFuel();
            this.pauseButton.draw();

            game.context.font = "40px Abel";
            game.context.fillStyle = textColor;
            game.context.fillText(player.score, game.width / 2, game.height / 10 * 1.5);
        }
    },

    drawPlayerFuel: function () {
        if (player.fuel > 0) {
            let w = mapValue(player.fuel, 100, 0, 600, 0);
            game.context.fillStyle = textColor;
            Helper.roundRect(game.context, 25, 20, w, 18, 10, true, false);
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