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
        this.context.fillText("FPS: " + this.fps, 28, 15);

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

        window.addEventListener('mousedown', () => {
            mouseClicked = true;
        });

        window.addEventListener('mouseup', () => {
            mouseClicked = false;
        });

        window.onmousemove = this.mouseMove;
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
    }

    update() {
        window.addEventListener('mouseup', () => {
            if (this.rectangle.includes(mouse)) {
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

function loadAssets() {

    for (let i = 0; i < assetNames.length; i++) {
        let asset = new Image();
        asset.src = "/assets/" + assetNames[i] + ".png";
        assets[assetNames[i]] = asset;
    }
}

var game = new Game();

loadAssets();

window.onload = () => {

    MainMenuScreen.init();
    AboutScreen.init();
    GameScreen.init();

    game.run();
    console.log("Game started ...")
}


class Player {
    constructor() {
        this.rectangle;
        this.position = new Vector2(0, 0);
        this.rotation = 0;
        this.fuel = 100;
        this.speed = 100;
        this.direction = new Vector2(200, 200);
        this.size = 50;

        this.joystick = {
            position: new Vector2(0, 0),
            center: new Vector2(0, 0),
            angle: 0,
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

                let offset = new Vector2(0, 0);

                if (this.hasValue && Helper.distance(this.center, this.position) > 15) {
                    offset.x = this.position.x - this.center.x;
                    offset.y = this.position.y - this.center.y;
                } else {
                    offset = new Vector2(0, 0);
                }

                this.angle = Math.atan2(offset.x, offset.y);

                if (!mouseClicked) {
                    this.hasValue = false;
                }
            }
        }
    }

    init() {

    }

    update() {
        this.joystick.update();
        this.direction.mult(this.speed);
        this.direction.mult(game.delta);
        this.position.add(this.direction);
        this.rectangle = RectFromPosition(this.position, this.size, this.size);
        game.camera.moveTo(this.position.x, this.position.y);
    }

    draw() {
        game.context.beginPath();
        game.context.moveTo(this.joystick.center.x, this.joystick.center.y);
        game.context.lineTo(this.joystick.position.x, this.joystick.position.y);
        game.context.closePath();
        game.context.stroke();

        game.context.drawImage(assets['player'], this.rectangle.x, this.rectangle.y, this.rectangle.w, this.rectangle.h);
    }
}

const player = new Player();

var MainMenuScreen = {

    playButton: new Button(new Vector2(game.width / 2, game.height / 2 + 75), 300, 100, "PLAY", () => {
        game.currentScreenId = gameScreenId;
    }),

    aboutButton: new Button(new Vector2(game.width / 2, game.height / 2 + 200), 300, 100, "ABOUT", () => {
        game.currentScreenId = aboutScreenId;
    }),

    init: function () {

    },

    update: function () {
        this.playButton.update();
        this.aboutButton.update();
    },

    bigText: false,
    bigTextCooldown: 0.25,
    c_bigTextCooldown: 0,

    draw: function () {

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

var GameScreen = {
    init: function () {
        player.init();
    },

    update: function () {
        player.update();
    },

    draw: function () {

        this.drawPlayerFuel();
        game.camera.begin();
        player.draw();
        game.camera.end();
    },

    drawPlayerFuel: function () {
        let w = mapValue(player.fuel, 100, 0, 600, 0);
        game.context.fillStyle = textColor;
        Helper.roundRect(game.context, 100, 30, w, 18, 10, true, false);
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

        this.backButton.draw();
    }
}