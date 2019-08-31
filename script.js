const mainMenuId = "menu";
const gameScreenId = "game";
const aboutScreenId = "about";
const upgradesScreenId = "upgrades";

var mouse;
var mouseClicked;

class Game {
    constructor() {
        this.delta;
        this.lastUpdate = Date.now();

        this.canvas = document.createElement("canvas");
        this.backBufferCanvas = document.createElement("canvas");

        this.context = this.canvas.getContext("2d");
        this.backBufferContext = this.backBufferCanvas.getContext("2d");

        document.body.appendChild(this.backBufferCanvas);

        let setpixelated = (context) => {
            context['imageSmoothingEnabled'] = false;       /* standard */
            context['oImageSmoothingEnabled'] = false;      /* Opera */
            context['webkitImageSmoothingEnabled'] = false; /* Safari */
            context['msImageSmoothingEnabled'] = false;     /* IE */
        }

        setpixelated(this.context);
        setpixelated(this.backBufferContext);

        this.currentScreenId = mainMenuId;
        this.camera = new Camera(this.context);
        this.c_updateFps = 0;
        this.fps = 0;

        this.alpha = 1;
        this.aspectRatio = 16 / 9;
        this.inverseAspectRatio = 9 / 16;
        this.extraRectangle = this.camera.rectangle;

        this.resizeCallback = () => {
            this.width = window.innerWidth;
            this.height = this.width / this.aspectRatio;

            if (this.height > window.innerHeight) {
                this.height = window.innerHeight;
                this.width = this.height / this.inverseAspectRatio;
            }

            this.canvas.width = this.width;
            this.canvas.height = this.height;

            this.backBufferCanvas.width = this.width;
            this.backBufferCanvas.height = this.height;
        }

        this.resizeCallback();

        window.addEventListener("resize", () => {
            this.resizeCallback();
            MainMenuScreen.resize();
            GameScreen.resize();
            AboutScreen.resize();
            UpgradesScreen.resize();
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


        this.backgroundColor = `rgb(172, 172, 252)`;

        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.width, this.height);


        if (this.c_updateFps < 0) {
            this.fps = Math.floor((1 / this.delta));

            document.title = `FPS: ${this.fps} | MS: ${Math.floor((this.delta * 1000))}`;
            this.c_updateFps = 0.02;
        } else {
            this.c_updateFps -= this.delta;
        }

        if (this.currentScreenId == mainMenuId) {
            MainMenuScreen.update();
            MainMenuScreen.draw();
        } else if (this.currentScreenId == gameScreenId) {
            this.extraRectangle.x = this.camera.rectangle.x - 200;
            this.extraRectangle.y = this.camera.rectangle.y - 200;
            this.extraRectangle.w = this.camera.rectangle.w + 400;
            this.extraRectangle.h = this.camera.rectangle.h + 400;

            GameScreen.update();
            GameScreen.draw();

        } else if (this.currentScreenId == aboutScreenId) {
            AboutScreen.update();
            AboutScreen.draw();
        } else if (this.currentScreenId == upgradesScreenId) {
            UpgradesScreen.update();
            UpgradesScreen.draw();
        }

        if (player.damaged && !player.dead) {
            this.backBufferContext.filter = 'contrast(100)';
            this.backBufferContext.drawImage(this.canvas, 0, 0);
        } else {
            this.backBufferContext.filter = 'none';
            this.backBufferContext.drawImage(this.canvas, 0, 0);
        }
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
    constructor(pos, w, h, text, onClick, fontSize) {
        this.rectangle = rectFromPosition(pos, w, h);
        this.text = text;
        this.onClick = onClick;
        this.textColor = textColor;
        this.fontSize = fontSize;
        this.font = createFont(fontSize);
        this.clicked = false;
    }

    update() {
        if (this.rectangle.includes(mouse) && mouseClicked) {
            this.clicked = true;
        }

        if (this.rectangle.includes(mouse) == false && mouseClicked) {
            this.clicked = false;
        }

        window.addEventListener('mouseup', () => {
            if (this.rectangle.includes(mouse) && this.clicked) {
                this.clicked = false;
                this.onClick();
            }
        });
    }

    draw() {
        game.context.fillStyle = 'rgb(119, 119, 209)';

        if (this.rectangle.includes(mouse)) {
            let u = Math.floor(this.rectangle.w / 20);
            game.context.fillRect(this.rectangle.x - (u / 2), this.rectangle.y - (u / 2), this.rectangle.w + u, this.rectangle.h + u);
        } else {
            game.context.fillRect(this.rectangle.x, this.rectangle.y, this.rectangle.w, this.rectangle.h);
        }

        game.context.fillStyle = this.textColor;
        game.context.font = this.font;
        game.context.textAlign = "center";
        game.context.fillText(this.text, this.rectangle.center().x, this.rectangle.center().y + this.fontSize / 3);
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
        this.iSize = this.size;
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
                if (!this.speed == 0) {
                    this.acceleration.normalize();
                    this.acceleration.mult(this.speed * game.delta);
                    this.position.add(this.acceleration);
                }

                this.lifespan -= game.delta;
                this.size = Math.floor(mapValue(this.lifespan, this.initialLifespan, 0, this.iSize, 0));

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
        this.shouldAdd = true;

        this.update = function () {
            if (this.enabled) {
                if (this.lifetime <= 0 && this.finished) {
                    this.enabled = false;
                } else {
                    if (this.lifetime > 0 && this.shouldAdd) {
                        for (let i = 0; i < this.settings.density; i++) {
                            let pos = Helper.randomPointInRect(this.rectangle);
                            this.particles.push(new particles.Particle(this.settings, pos));
                        }

                        if (this.settings.onetime) {
                            this.lifetime -= game.delta;
                        }
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
                if (game.camera.rectangle.includes(this.particles[i].position)) {
                    this.particles[i].draw();
                }
            }
        }
    },

    effects: [],
    trail: null,

    new: function (rectangle, settings) {
        particles.effects.push(new particles.System(rectangle, settings));
    },

    reset: function () {
        particles.effects.length = 0;
        particles.trail = new this.System(player.rectangle, particles.configs.playerTrail());
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

        if (player.joystick.hasValue) {
            particles.trail.rectangle.x = player.position.x - player.size / 4;
            particles.trail.rectangle.y = player.position.y - player.size / 4;
            particles.trail.rectangle.w = 2;
            particles.trail.rectangle.h = 2;
            particles.trail.shouldAdd = true;
        } else {
            particles.trail.shouldAdd = false;
        }

        particles.trail.update();
    },

    draw: function () {
        for (let i = 0; i < particles.effects.length; i++) {
            particles.effects[i].draw();
        }
        particles.trail.draw();
    },

    configs: {

        playerTrail: function () {
            let settings = new particles.Settings();

            settings.density = 1;
            settings.increaseRotation = false;
            settings.lifespan = new Size(0.04, 0.1);
            settings.onetime = false;
            settings.size = new Size(10, 20);
            settings.speed = new Size(0.001, 0.01);
            settings.systemLifetime = 0.2;
            settings.textures = [
                assets['circle_purple'],
                assets['circle_purple_dark']
            ]

            return settings;
        },

        scoutTrail: function () {
            let settings = particles.configs.playerTrail();

            settings.speed = new Size(0, 0);
            settings.size = new Size(5, 15);
            settings.textures = [
                premadeAssets.scout_trail
            ];

            return settings;
        },

        scoutExplosion: function () {
            let settings = new particles.Settings();

            settings.density = 10;
            settings.increaseRotation = false;
            settings.lifespan = new Size(0.005, 0.01);
            settings.onetime = true;
            settings.size = new Size(15, 30);
            settings.speed = new Size(500, 800);
            settings.systemLifetime = 0.02;
            settings.textures = [
                premadeAssets.scout_trail,
                assets['circle_purple_dark']
            ];

            return settings;
        },

        kamikazeExplosion: function () {
            let settings = particles.configs.scoutExplosion();
            settings.density = 20;
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
    'scout',
    'circle_purple',
    'circle_purple_dark',
    'kamikaze',
    'turret',
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
    UpgradesScreen.init();

    document.getElementById('loading').textContent = `Loading: ${Math.floor((assetsLoaded / assetNames.length) * 100)}%`;

    stats.load();

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
    scout_trail: document.createElement('canvas'),
    kamikaze_trail: document.createElement('canvas'),

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

        this.scout_trail.width = 20;
        this.scout_trail.height = 20;
        ctx = this.scout_trail.getContext('2d');
        ctx.fillStyle = 'rgb(44, 19, 94)';
        ctx.beginPath();
        ctx.arc(10, 10, 10, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        this.kamikaze_trail.width = 20;
        this.kamikaze_trail.height = 20;
        ctx = this.kamikaze_trail.getContext('2d');
        ctx.fillStyle = 'rgb(128, 41, 19)';
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
        this.speed = 100;
        this.size = 30;
        this.rotation = 0;
        this.dead = false;
        this.bullets = [];
        this.asset = assets['scout'];
        this.rect = new Rectangle(0, 0, 0, 0);
        this.trail = new particles.System(this.rect, particles.configs.scoutTrail());


        this.c_shootingCooldown = 0.9;

        this.shoot = function () {
            let shootingCooldown = 0.75;

            if (this.c_shootingCooldown < 0) {
                let b = new projectile.Bullet(this.position, this.direction);
                b.damage = 5;
                b.speed = 350;
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
                    let rect = rectFromPosition(this.position, 10, 10);
                    this.dead = true;
                    player.addScore(player.rewards.scout, this.position);
                }
            }

            if (Helper.distance(this.position, player.position) < this.size / 2 + player.size / 2) {
                this.dead = true;
            }
        }

        this.update = function () {
            this.direction = new Vector2(player.position.x - this.position.x, player.position.y - this.position.y);
            this.direction.normalize();
            if (game.camera.rectangle.includes(this.position) == false) {
                this.direction.mult(game.delta * this.speed * 10);
            } else {
                this.direction.mult(game.delta * this.speed);
            }
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
                        player.hit();
                        player.damaged = true;
                        this.bullets.splice(i, 1);
                    }
                }
            }

            this.rect.x = this.position.x - this.size / 4;
            this.rect.y = this.position.y - this.size / 4;
            this.rect.w = 2;
            this.rect.h = 2;
            this.trail.rectangle = this.rect;

            this.trail.update();
        }

        this.draw = function () {
            this.trail.draw();

            Helper.drawImage(game.context, this.asset, this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size, this.rotation);

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
        this.rect = new Rectangle(0, 0, 0, 0);
        let s = particles.configs.scoutTrail();
        s.size = new Size(10, 20);
        s.textures = [
            premadeAssets.kamikaze_trail
        ];
        this.trail = new particles.System(this.rect, s);

        this.checkCollisionWithPlayerBullets = function () {
            for (let i = 0; i < player.bullets.length; i++) {
                if (Helper.distance(this.position, player.bullets[i].position) < this.iSize / 1.5) {
                    player.bullets[i].dead = true;
                    this.dead = true;
                    player.addScore(player.rewards.kamikaze, this.position);
                }
            }

            if (Helper.distance(this.position, player.position) < this.size / 2 + player.size / 2) {
                this.dead = true;
                player.hit();
            }
        }

        this.shoot = function () {
            for (let i = 0; i < 360; i += 15) {
                let x = this.position.x + Math.cos(i);
                let y = this.position.y + Math.sin(i);
                let dir = new Vector2(x - this.position.x, y - this.position.y);
                dir.normalize();
                let b = new projectile.Bullet(new Vector2(this.position.x, this.position.y), dir);
                b.speed = 250;
                b.size = 20;
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
            if (game.extraRectangle.includes(this.position) == false) {
                direction.mult(game.delta * this.speed * 10);
            } else {
                direction.mult(game.delta * this.speed);
            }
            this.position.add(direction);

            this.rotation = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x) + Math.PI / 2;

            this.checkCollisionWithPlayerBullets();

            this.position.toInt();

            this.rect.x = this.position.x + this.iSize / 4;
            this.rect.y = this.position.y + this.iSize / 4;
            this.rect.w = 2;
            this.rect.h = 2;
            this.trail.rectangle = this.rect;

            this.trail.update();
        }

        this.pulse = function () {
            let i = mapValue(this.lifetime, this.iLifetime, 0, 1, 3);
            this.size += this.unit * i / 2;

            if (this.size > this.iSize * 1.25 || this.size < this.iSize * 0.75) {
                this.unit *= -1;
            }
        }

        this.draw = function () {
            this.trail.draw();
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
        let s = particles.configs.scoutTrail();
        this.rect = new Rectangle(0, 0, 0, 0);
        s.size = new Size(10, 20);
        s.textures = [
            premadeAssets.black_bullet
        ];
        this.trail = new particles.System(this.rect, s);

        this.checkCollisionWithPlayerBullets = function () {
            for (let i = 0; i < player.bullets.length; i++) {
                let contactPoint = new Vector2(this.position.x + this.baseSize / 2, this.position.y + this.baseSize / 2);
                if (Helper.distance(contactPoint, player.bullets[i].position) < this.baseSize / 2 + player.bullets[i].size / 2) {
                    player.bullets[i].dead = true;
                    this.dead = true;
                    player.addScore(player.rewards.turret, this.position)
                }
            }

            if (Helper.distance(this.position, player.position) < this.size / 2 + player.size / 2) {
                this.dead = true;
                player.hit();
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
                b.speed = 400;
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
            if (game.extraRectangle.includes(this.position) == false) {
                direction.mult(game.delta * this.speed * 10);
            } else {
                direction.mult(game.delta * this.speed);
            }
            this.position.add(direction);
            this.position.toInt();

            this.rect.x = this.position.x + this.baseSize / 4;
            this.rect.y = this.position.y + this.baseSize / 4;
            this.rect.w = 2;
            this.rect.h = 2;
            this.trail.rectangle = this.rect;

            this.trail.update();
        }

        this.draw = function () {
            this.trail.draw();
            Helper.drawImage(game.context, assets['turret'], this.position.x, this.position.y, this.baseSize, this.baseSize, this.rotation);
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
        this.unit = 1;
        this.dead = false;
        this.target.toInt();
        let s = particles.configs.scoutTrail();
        s.textures = [
            assets['pentagon']
        ];
        s.size = new Size(15, 25);
        this.rect = new Rectangle(0, 0, 0, 0);
        this.trail = new particles.System(this.rect, s);
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

                this.position.toInt();

                this.rect.x = this.position.x + this.size / 4;
                this.rect.y = this.position.y + this.size / 4;
                this.rect.w = 2;
                this.rect.h = 2;
                this.trail.rectangle = this.rect;

                this.trail.update();

            }
        }

        this.draw = function () {
            if (this.cooldown < 0) {
                this.trail.draw();
                Helper.drawImage(game.context, assets['pentagon'], this.position.x, this.position.y, this.size, this.size, this.rotation);
            }
        }
    },

    enemies: [],
    projectiles: [],

    reset: function () {
        this.enemies.length = 0;
        this.projectiles.length = 0;
        this.c_spawnCooldown = 2;
        this.kamikazeUnlocked = false;

        for (key in this.unlocked) {
            if (this.unlocked.hasOwnProperty(key)) {
                this.unlocked[key] = false;
            }
        }
    },

    unlocked: {
        kamikaze: false,
        turret: false,
        bomb: false
    },

    c_spawnCooldown: 1,

    maxEnemyCount: 4,

    c_enemyCountIncreaseCD: 3,

    bombSpawnCD: 3,

    update: function () {

        if (player.score > 80 && this.unlocked.bomb == false) {
            this.unlocked.bomb = true;
        }

        if (player.score > 50 && this.unlocked.kamikaze == false) {
            this.unlocked.kamikaze = true;
        }

        if (player.score > 120 && this.unlocked.turret == false) {
            this.unlocked.turret = true;
        }

        if (this.c_enemyCountIncreaseCD < 0) {
            this.maxEnemyCount++;
            this.c_enemyCountIncreaseCD = 1;
        } else {
            this.c_enemyCountIncreaseCD -= game.delta;
        }

        if (this.c_spawnCooldown < 0 && this.enemies.length < this.maxEnemyCount) {

            let pos = this.chooseSpawnPos();

            this.spawnEnemy(pos);
            let spawnCooldown = random(1, 2);
            if (player.upgrades.speed > 2) {
                spawnCooldown -= 0.2;
            }
            if (player.upgrades.shooting_rate > 3) {
                spawnCooldown -= 0.2;
            }
            if (player.upgrades.shoot_directions > 3) {
                spawnCooldown -= 0.2;
            }
            this.c_spawnCooldown = spawnCooldown;
        } else {
            this.c_spawnCooldown -= game.delta;
        }

        if (this.bombSpawnCD < 0 && this.unlocked.bomb) {
            this.projectiles.push(new this.Bomb(this.chooseSpawnPos(), player.position));
            this.bombSpawnCD = random(1, 4);
        } else {
            this.bombSpawnCD -= game.delta;
        }

        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].dead) {

                if (random(0, 100) < 70) {
                    let a = Math.floor(random(0, 360));
                    let pos = new Vector2(0, 0);
                    let r = Math.floor(random(70, 120));
                    pos.x = this.enemies[i].position.x + Math.cos(a) * r;
                    pos.y = this.enemies[i].position.y + Math.sin(a) * r;
                    let e = this.enemies[i];

                    if (e instanceof enemy.Scout) {
                        money = 10 * (player.upgrades.speed + 1);
                    } else if (e instanceof enemy.Kamikaze) {
                        money = 15 * (player.upgrades.shoot_directions + 1);
                    } else if (e instanceof enemy.Turret) {
                        money = 25 * (player.upgrades.shooting_rate + 1);
                    }

                    money = Math.floor(money);
                    money *= player.multiplier;

                    p = new popup.Popup(`+$${money}`, pos);
                    stats.money += money;
                    localStorage.setItem('money', JSON.stringify(stats.money));
                    popup.popups.push(p)
                }

                if (this.enemies[i] instanceof enemy.Scout) {
                    particles.new(rectFromPosition(this.enemies[i].position, 3, 3), particles.configs.scoutExplosion());
                } else if (this.enemies[i] instanceof enemy.Kamikaze) {
                    particles.new(rectFromPosition(this.enemies[i].position, 3, 3), particles.configs.kamikazeExplosion());
                } else if (this.enemies[i] instanceof enemy.Turret) {
                    let rect = rectFromPosition(this.enemies[i].position, 3, 3);
                    particles.new(rect, particles.configs.turretExplosion());
                }

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
                    player.hit();
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
            if (game.extraRectangle.includes(this.projectiles[i].position)) {
                this.projectiles[i].draw();
            }
        }
    },

    chooseSpawnPos() {
        let pos;
        if (random(0, 100) < 50) {
            let angle = Math.floor(random(0, 360));
            let radius = random(game.width / 2, game.height / 2);
            let x = player.position.x + Math.cos(angle) * radius;
            let y = player.position.y + Math.sin(angle) * radius;
            pos = new Vector2(x, y);
        } else {
            pos = Helper.randomPointInRect(game.camera.rectangle);
        }

        return pos;
    },

    spawnEnemy(pos) {
        let e;

        let rand = random(0, 100);

        if (rand < 20) {
            if (this.unlocked.turret) {
                e = new this.Turret(pos);
            } else {
                this.spawnEnemy(pos);
            }
        } else if (rand < 60) {
            e = new this.Scout(pos);
        } else {
            if (this.unlocked.kamikaze) {
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
        this.direction = new Vector2(0, 0);
        this.size = 40;
        this.idleCheckpoint = this.position;
        this.dead = false;
        this.score = 0;
        this.camPos = this.position;
        this.bullets = [];
        this.damaged = false;
        this.spaceBarClicked = false;

        this.addDashCooldown = 2;

        this.rewards = {
            scout: 10,
            kamikaze: 15,
            turret: 25
        };

        this.upgrades = {
            speed: 0,
            shoot_directions: 0,
            shooting_rate: 0
        };

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
        };
    }

    addScore(amount, position) {
        this.score += amount * this.multiplier;

        if (position) {
            popup.popups.push(new popup.Popup(amount * this.multiplier, position));
        }

        if (this.multiplier < 5) {
            this.multiplier++;
        }
    }

    hit() {
        this.health--;
        this.multiplier = 1;
    }

    reset() {
        this.position = new Vector2(0, 0);
        this.camPos = this.position;
        this.rotation = 0;
        this.health = 3;
        this.direction = new Vector2(0, 0);
        this.dead = false;
        this.bullets.length = 0;
        this.score = 0;

        this.speed = 225 + (40 * this.upgrades.speed);

        this.damaged = false;
        this.dmgCooldown = 0.12;

        this.shootingCooldown = 0.3 - (0.05 * this.upgrades.shooting_rate);
        this.c_shootingCooldown = 0;

        this.rectangle = rectFromPosition(this.position, this.size, this.size);

        this.camSpeed = 0.02;

        this.multiplier = 1;
    }

    update() {

        if (this.damaged) {
            this.dmgCooldown -= game.delta;

            if (this.dmgCooldown < 0) {
                this.damaged = false;
                this.dmgCooldown = 0.05;
            }
        }

        if (!this.dead) {
            if (this.joystick.hasValue) {

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
                if (this.bullets[i].dead || game.camera.rectangle.includes(this.bullets[i].position) == false) {
                    this.bullets.splice(i, 1);
                } else {
                    this.bullets[i].update();
                }
            }

            this.camPos = Vector2.lerp(this.camPos, this.position, this.camSpeed);


            game.camera.moveTo(this.camPos.x, this.camPos.y);

            if (this.health < 1) {
                this.dead = true;

                if (this.score > stats.high_score) {
                    stats.high_score = this.score;
                }
            }
        }
    }

    shoot() {
        if (this.c_shootingCooldown < 0 && (this.direction.x != 0 && this.direction.y != 0)) {
            let b = [];

            let dirs = this.upgrades.shoot_directions

            if (dirs == 0) {
                b.push(new projectile.Bullet(this.position, this.direction));
            } else if (dirs == 1) {
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -2)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 2)));
            } else if (dirs == 2) {
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -3)));
                b.push(new projectile.Bullet(this.position, this.direction));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 3)));
            } else if (dirs == 3) {
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -2)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 2)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -4)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 4)));
            } else if (dirs == 4) {
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -3)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 3)));
                b.push(new projectile.Bullet(this.position, this.direction));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -5)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 5)));
            } else if (dirs == 5) {
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -3)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 3)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -5)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 5)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, -8)));
                b.push(new projectile.Bullet(this.position, rotateVector(this.direction, 8)));
            }

            Array.prototype.push.apply(this.bullets, b);
            this.c_shootingCooldown = this.shootingCooldown;
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
        this.duration = 0.9;
        this.iDuration = this.duration;
        this.font = "35px Archivo Black";
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

var stats = {
    high_score: 0,
    money: 0,

    save: function () {
        localStorage.setItem('high_score', JSON.stringify(this.high_score));
        localStorage.setItem('money', JSON.stringify(this.money));
        localStorage.setItem('upgrades', JSON.stringify(player.upgrades));
        localStorage.setItem('prices', JSON.stringify(UpgradesScreen.prices));
    },

    load: function () {
        let score = JSON.parse(localStorage.getItem('high_score'));
        if (score != null) {
            this.high_score = score;
        }

        let money = JSON.parse(localStorage.getItem('money'));
        if (money != null) {
            this.money = money;
        }

        let upgrades = JSON.parse(localStorage.getItem('upgrades'));
        if (upgrades != null) {
            player.upgrades = upgrades;
        }

        let prices = JSON.parse(localStorage.getItem('prices'));
        if (prices != null) {
            UpgradesScreen.prices = prices;
        }
    },

    reset: function () {
        this.high_score = 0;
        this.money = 0;
        player.upgrades.speed = 0;
        player.upgrades.shoot_directions = 0;
        player.upgrades.shooting_rate = 0;
        UpgradesScreen.prices.shoot_directions = 100;
        UpgradesScreen.prices.shootingRate = 100;
        UpgradesScreen.prices.speed = 100;
        this.save();
        this.load();
    }
}

var MainMenuScreen = {

    playButton: null,
    aboutButton: null,
    resetButton: null,
    upgradesButton: null,

    resize: function () {
        let widthUnit = game.width / 10;
        let fontSize = Math.floor(mapValue(game.width, 1280, 300, 70, 15));
        let buttonWidth = mapValue(game.width, 1280, 300, 100, 30);

        this.playButton = new Button(new Vector2(game.width / 2, game.height - fontSize - buttonWidth - fontSize / 3), widthUnit * 3.4, buttonWidth, "PLAY", () => {
            player.reset();
            game.currentScreenId = gameScreenId;
        }, fontSize);

        this.aboutButton = new Button(new Vector2(widthUnit * 2, game.height - fontSize), widthUnit * 2.2, buttonWidth, "?", () => {
            game.currentScreenId = aboutScreenId;
        }, fontSize);

        this.resetButton = new Button(new Vector2(game.width - widthUnit * 2, game.height - fontSize), widthUnit * 2.2, buttonWidth, "RESET", () => {
            stats.reset();
        }, fontSize);

        this.upgradesButton = new Button(new Vector2(game.width / 2, game.height - fontSize), widthUnit * 3.4, buttonWidth, "UPGRADES", () => {
            game.currentScreenId = upgradesScreenId;
        }, fontSize);
    },

    init: function () {
        this.resize();
    },

    update: function () {
        player.updateIdleState();
        this.playButton.update();
        this.aboutButton.update();
        this.resetButton.update();
        this.upgradesButton.update();
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

        let fontSize = Math.floor(mapValue(game.width, 1280, 300, 110, 30));

        if (this.bigText) {
            game.context.font = `${fontSize + 2}px Archivo Black`;
        } else {
            game.context.font = `${fontSize}px Archivo Black`;
        }

        game.context.textAlign = 'center';
        game.context.fillStyle = textColor;
        game.context.fillText("GEOMETRY", game.width / 2, (game.height / 10) * 2);
        game.context.fillText("SHOOT", game.width / 2, (game.height / 10) * 2 + fontSize);

        this.playButton.draw();
        this.aboutButton.draw();
        this.resetButton.draw();
        this.upgradesButton.draw();

        // draw Stats

        fontSize = mapValue(game.width, 1280, 300, 60, 10);
        game.context.font = `${fontSize}px Archivo Black`;
        game.context.textAlign = 'center';
        game.context.fillText("🏆: " + stats.high_score, this.aboutButton.rectangle.center().x, this.playButton.rectangle.bottom() - fontSize / 2);
        game.context.fillText("💰: " + stats.money + "$", this.resetButton.rectangle.center().x, this.playButton.rectangle.bottom() - fontSize / 2);
    }
};

var healthPoint = {
    cooldown: 30,
    position: null,
    reset: function () {
        this.cooldown = 30;
        this.position = null;
    },

    update: function () {

        if (this.position == null) {
            this.position = Helper.randomPointInRect(game.extraRectangle);
        }

        if (this.cooldown < 0) {
            if (Helper.distance(player.position, this.position) < 35 / 2 + player.size / 2) {
                if (player.health < 3) {
                    player.health++;
                }
                this.cooldown = Math.floor(random(20, 45));
                this.position = null;
                this.trail = null;
            }
        } else {
            this.cooldown -= game.delta
        }
    },

    draw: function () {
        if (this.cooldown < 0) {
            x = this.position.x;
            y = this.position.y;
            game.context.fillStyle = textColor;
            game.context.beginPath();
            game.context.arc(x, y, 10, 0, Math.PI * 2);
            game.context.closePath();
            game.context.fill();
        }
    }
}

let gamePaused = false;
function resetGameScreen() {
    player.reset();
    enemy.reset();
    particles.reset();
    gamePaused = false;
    background.elements.length = 0;
    healthPoint.reset();
}
var GameScreen = {

    pauseButton: null,

    menuButton: null,

    restartButton: null,

    resize: function () {
        let zoomValue = 1300;

        game.camera.zoomTo(zoomValue);

        let fontSize = Math.floor(mapValue(game.width, 1280, 300, 30, 15));
        let buttonWidth = mapValue(game.width, 1280, 300, 60, 20);
        let widthUnit = game.width / 10;

        this.pauseButton = new Button(new Vector2(game.width - widthUnit * 0.7, buttonWidth / 1.8), widthUnit * 1.3, buttonWidth, "PAUSE", () => {
            if (gamePaused) {
                gamePaused = false;
            } else {
                gamePaused = true;
            }
        }, fontSize);

        this.menuButton = new Button(new Vector2(game.width / 2, game.height - buttonWidth * 2.2), widthUnit * 1.5, buttonWidth, "MENU", () => {
            resetGameScreen();
            stats.save();
            if (player.score > stats.high_score) {
                stats.high_score = player.score;
            }
            game.currentScreenId = mainMenuId;
        }, fontSize);

        this.restartButton = new Button(new Vector2(game.width / 2, game.height - buttonWidth), widthUnit * 1.5, buttonWidth, "RESTART", () => {
            resetGameScreen();
            stats.save();
        }, fontSize);
    },

    init: function () {
        this.resize();

        resetGameScreen();
    },

    update: function () {

        background.update();
        player.joystick.update();

        if (gamePaused == false && !player.dead) {
            player.update();
            enemy.update();
            particles.update();
            popup.update();
            healthPoint.update();
        } else {
            this.menuButton.update();
            this.restartButton.update();
        }

        if (player.dead) {
            this.menuButton.update();
            this.restartButton.update();
        }

        if (!player.dead) {
            this.pauseButton.update();
        }
    },

    draw: function () {
        game.camera.begin();
        healthPoint.draw();
        background.draw();
        particles.draw();
        player.draw();
        enemy.draw();
        popup.draw();
        game.camera.end();

        if (!gamePaused) {
            player.joystick.draw();
        }

        if (gamePaused) {
            game.context.globalAlpha = 0.7;
            game.context.fillStyle = game.backgroundColor;
            game.context.fillRect(0, 0, game.width, game.height);
            game.context.globalAlpha = 1;

            let fontSize = Math.floor(mapValue(game.width, 1280, 300, 40, 20));

            game.context.font = `${fontSize}px Archivo Black`;

            game.context.fillStyle = textColor;
            game.context.fillText("Press PAUSE button", game.width / 2, game.height / 2);
            game.context.fillText("again to continue", game.width / 2, game.height / 2 + fontSize);

            this.menuButton.draw();
            this.restartButton.draw();
        }

        if (player.dead) {

            game.context.globalAlpha = 0.7;
            game.context.fillStyle = game.backgroundColor;
            game.context.fillRect(0, 0, game.width, game.height);
            game.context.globalAlpha = 1;

            let fontSize = Math.floor(mapValue(game.width, 1280, 300, 40, 20));

            game.context.font = `${fontSize}px Archivo Black`;

            game.context.fillStyle = textColor;
            game.context.fillText("You have been slain!", game.width / 2, fontSize * 3);
            game.context.fillText("Score: " + player.score, game.width / 2, fontSize * 4);

            this.restartButton.draw();
            this.menuButton.draw();
        } else {
            this.drawPlayerHealth();
            this.pauseButton.draw();

            game.context.font = "40px Archivo Black";
            game.context.fillStyle = textColor;
            let score = player.score;
            if (score > stats.high_score) {
                score = "🏆" + score;
            }
            game.context.fillText(score, game.width / 2, 40);
            game.context.font = "20px Archivo Black";
        }

    },

    drawPlayerHealth: function () {
        if (player.health > 0) {
            for (let i = 0; i < player.health; i++) {
                let x = 35 + (i * 35);
                game.context.fillStyle = textColor;
                game.context.beginPath();
                game.context.arc(x, 25, 10, 0, Math.PI * 2);
                game.context.closePath();
                game.context.fill();
            }
        }
    }
};

var AboutScreen = {

    backButton: null,

    resize: function () {
        let widthUnit = game.width / 10;
        let fontSize = Math.floor(mapValue(game.width, 1280, 300, 70, 15));
        let buttonWidth = Math.floor(mapValue(game.width, 1280, 300, 100, 30));

        this.backButton = new Button(new Vector2(game.width / 2, game.height - fontSize), widthUnit * 2, buttonWidth, "BACK", () => {
            game.currentScreenId = mainMenuId;
        }, fontSize);
    },

    init: function () {
        this.resize();
    },

    update: function () {
        this.backButton.update();
    },

    draw: function () {
        let fontSize = Math.floor(mapValue(game.width, 1280, 300, 100, 40));
        game.context.font = `${fontSize}px Archivo Black`;

        game.context.textAlign = 'center';
        game.context.fillStyle = textColor;
        game.context.fillText("ABOUT", game.width / 2, (game.height / 10) * 2);

        fontSize = Math.floor(mapValue(game.width, 1280, 300, 40, 15));
        game.context.font = `${fontSize}px Archivo Black`;

        game.context.fillText("Click, hold and move mouse to play", game.width / 2, game.height / 2 - fontSize);

        game.context.fillText("Game made by Mihai Solomon,", game.width / 2, game.height / 2 + fontSize * 2);
        game.context.fillText("feel free to contact me at", game.width / 2, game.height / 2 + fontSize * 3);
        game.context.fillText("solomonmihai10@gmail.com", game.width / 2, game.height / 2 + fontSize * 4);

        this.backButton.draw();
    }
}

var UpgradesScreen = {

    backButton: null,
    buySpeedButton: null,
    buyShootDirections: null,
    buyShootingRate: null,

    prices: {
        speed: 100,
        shoot_directions: 100,
        shootingRate: 100
    },

    resize: function () {
        let widthUnit = game.width / 10;
        let fontSize = Math.floor(mapValue(game.width, 1280, 300, 70, 15));
        let buttonWidth = Math.floor(mapValue(game.width, 1280, 300, 100, 30));

        let buttonHeight = Math.floor(mapValue(game.width, 1280, 300, 60, 15));

        this.backButton = new Button(new Vector2(game.width / 2, game.height - fontSize), widthUnit * 2.2, buttonWidth, "BACK", () => {
            game.currentScreenId = mainMenuId;
        }, fontSize);


        fontSize = Math.floor(mapValue(game.width, 1280, 300, 60, 15));

        this.buySpeedButton = new Button(new Vector2(game.width - widthUnit * 0.7, (game.height / 10) * 5 - (fontSize / 1.2) / 2), widthUnit * 1.2, buttonHeight, "BUY", () => {
            if (player.upgrades.speed < 5 && stats.money >= this.prices.speed) {
                player.upgrades.speed++;
                stats.money -= this.prices.speed;
                this.prices.speed = Math.floor(this.prices.speed * 2.5);
                if (player.upgrades.speed == 5) {
                    this.prices.speed = "MAX";
                }
                stats.save();
            }
        }, fontSize)

        this.buyShootDirections = new Button(new Vector2(game.width - widthUnit * 0.7, (game.height / 10) * 5 + (fontSize / 1.2)), widthUnit * 1.2, buttonHeight, "BUY", () => {
            if (player.upgrades.shoot_directions < 5 && stats.money >= this.prices.shoot_directions) {
                player.upgrades.shoot_directions++;
                stats.money -= this.prices.shoot_directions;
                this.prices.shoot_directions = Math.floor(this.prices.shoot_directions * 2.5);
                if (player.upgrades.shoot_directions == 5) {
                    this.prices.shoot_directions = "MAX";
                }
                stats.save();
            }
        }, fontSize)

        this.buyShootingRate = new Button(new Vector2(game.width - widthUnit * 0.7, (game.height / 10) * 5 + (fontSize * 2.1)), widthUnit * 1.2, buttonHeight, "BUY", () => {
            if (player.upgrades.shooting_rate < 5 && stats.money >= this.prices.shootingRate) {
                player.upgrades.shooting_rate++;
                stats.money -= this.prices.shootingRate;
                this.prices.shootingRate = Math.floor(this.prices.shootingRate * 2.5);
                if (player.upgrades.shooting_rate == 5) {
                    this.prices.shootingRate = "MAX";
                }
                stats.save();
            }
        }, fontSize)
    },

    init: function () {
        stats.load();
        this.resize();
    },

    draw: function () {
        let fontSize = Math.floor(mapValue(game.width, 1280, 300, 100, 40));
        game.context.font = `${fontSize}px Archivo Black`;

        game.context.textAlign = 'center';
        game.context.fillStyle = textColor;
        game.context.fillText("UPGRADES", game.width / 2, (game.height / 10) * 2);

        {
            let fontSize = Math.floor(mapValue(game.width, 1280, 300, 60, 15));
            game.context.font = `${fontSize}px Archivo Black`;

            game.context.fillText("💰: " + stats.money + "$", game.width / 2, (game.height / 10) * 2 + (fontSize * 2));

            game.context.textAlign = 'right';
            let align = game.width / 2;
            game.context.fillText("SPEED:", align, (game.height / 10) * 5);
            game.context.fillText("SHOOT WAYS:", align, (game.height / 10) * 5 + fontSize * 1.2);
            game.context.fillText("SHOOTING RATE:", align, (game.height / 10) * 5 + fontSize * 2.4);

            game.context.textAlign = 'left';

            align = game.width / 2 + (4.2 * fontSize);

            game.context.fillText(`$${this.prices.speed}`, align, (game.height / 10) * 5);
            game.context.fillText(`$${this.prices.shoot_directions}`, align, (game.height / 10) * 6);
            game.context.fillText(`$${this.prices.shootingRate}`, align, (game.height / 10) * 7);

            game.context.lineWidth = Math.floor(mapValue(game.width, 1280, 300, 10, 3));
            game.context.strokeStyle = textColor;

            for (let i = 0; i < 5; i++) {

                let squareLength = fontSize / 2;

                if (i < player.upgrades.speed) {
                    game.context.fillRect(game.width / 2 + (fontSize / 8) + (i * fontSize * 0.8), (game.height / 10) * 5 - (fontSize / 1.7), squareLength, squareLength);
                }

                if (i < player.upgrades.shoot_directions) {
                    game.context.fillRect(game.width / 2 + (fontSize / 8) + (i * fontSize * 0.8), (game.height / 10) * 6 - (fontSize / 1.7), squareLength, squareLength);
                }

                if (i < player.upgrades.shooting_rate) {
                    game.context.fillRect(game.width / 2 + (fontSize / 8) + (i * fontSize * 0.8), (game.height / 10) * 7 - (fontSize / 1.7), squareLength, squareLength);
                }

                game.context.strokeRect(game.width / 2 + (fontSize / 8) + (i * fontSize * 0.8), (game.height / 10) * 5 - (fontSize / 1.7), squareLength, squareLength);
                game.context.strokeRect(game.width / 2 + (fontSize / 8) + (i * fontSize * 0.8), (game.height / 10) * 6 - (fontSize / 1.7), squareLength, squareLength);
                game.context.strokeRect(game.width / 2 + (fontSize / 8) + (i * fontSize * 0.8), (game.height / 10) * 7 - (fontSize / 1.7), squareLength, squareLength);
            }
        }

        this.backButton.draw();
        this.buySpeedButton.draw();
        this.buyShootDirections.draw();
        this.buyShootingRate.draw();
    },

    update: function () {
        this.backButton.update();
        this.buySpeedButton.update();
        this.buyShootDirections.update();
        this.buyShootingRate.update();
    }
}

var background = {

    Element: function (position) {
        this.position = position;
        this.rotationIncrement = random(0, 100) < 50 ? -Math.PI / 180 / 4 : Math.PI / 180 / 4;
        this.texture = assets[`Hex(${Math.floor(random(1, 9))})`];
        this.speed = random(25, 75);
        this.scale = Math.floor(random(0.3, 0.9));
        this.dead = false;
        this.rotation = Math.floor(random(0, 360)) * Math.PI / 180;

        this.update = function () {
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

        this.draw = function () {
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

    update: function () {

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

    draw: function () {
        for (let i = 0; i < this.elements.length; i++) {
            this.elements[i].draw();
        }
    }
}
