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
        this.rectangle = RectFromPosition(pos, w, h);
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

function log(object) {
    console.log(object);
}

var assetNames = [
    'player',
    'circle'
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
    if (assetsLoaded == assetNames.length) {
        document.getElementById("loading").style.display = "none";
        game.run();
        console.log("Game started ...")
    }
}


class Player {
    constructor() {
        this.rectangle;
        this.position = new Vector2(game.width / 2, game.height / 2);
        this.rotation = 0;
        this.fuel = 100;
        this.speed = 300;
        this.direction = new Vector2(200, 200);
        this.size = 50;
        this.idleCheckpoint = this.position;
        this.dead = false;
        this.score = 0;

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
                    game.context.fillStyle = "rgba(0, 0, 0)";

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
    }

    reset() {
        this.position = new Vector2(0, 0);
        this.rotation = 0;
        this.fuel = 100;
        this.speed = 300;
        this.direction = new Vector2(200, 200);
        this.dead = false;
    }

    update() {
        if (this.joystick.hasValue && !this.dead) {

            this.direction = this.joystick.direction();
            this.direction.mult(this.speed * game.delta);
            this.position.add(this.direction);

            this.rectangle = RectFromPosition(this.position, this.size, this.size);

            let a = this.joystick.position.y - this.joystick.center.y;
            let b = this.joystick.position.x - this.joystick.center.x;
            this.rotation = Math.atan2(a, b) + 90 * Math.PI / 180;

            this.fuel -= 4 * game.delta;

            if (this.fuel < 1) {
                this.dead = true;
            }
        }
    }

    draw() {
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
            game.context.font = "125px Abel";
        } else {
            game.context.font = "120px Abel";
        }

        game.context.fillStyle = textColor;
        game.context.fillText("PLANER", game.width / 2, 200);

        this.playButton.draw();
        this.aboutButton.draw();
    }
};
let gamePaused = false;
function resetGameScreen() {
    player.reset();
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
        if (gamePaused == false) {
            player.update();
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
        player.draw();
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

        this.drawPlayerFuel();

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
            this.pauseButton.draw();
        }
    },

    drawPlayerFuel: function () {
        let w = mapValue(player.fuel, 100, 0, 600, 0);
        game.context.fillStyle = textColor;
        Helper.roundRect(game.context, 25, 20, w, 18, 10, true, false);
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