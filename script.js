class Game {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.frameRate = 60;
        this.now;
        this.then = Date.now();
        this.delta;
        this.interval = 1000 / this.frameRate;
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.backgroundColor = "rgb(191, 192, 255)";
        this.currentScreenId = mainMenuId;
        this.mouse;
    }

    run() {
        requestAnimationFrame(() => {
            return this.run();
        });

        this.now = Date.now();
        this.delta = (this.now - this.then) / 1000;

        if (this.delta > this.interval) {
            this.then = this.now - (this.delta & this.interval)
        }
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.width, this.height);

        switch (this.currentScreenId) {
            case mainMenuId:
                MainMenuScreen.update();
                MainMenuScreen.draw();

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

var mouse;

class Button {
    constructor(pos, w, h) {
        this.rectangle = RectFromPosition(pos, w, h);
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

var game;

loadAssets();

window.onload = () => {
    game = new Game();
    game.run();
    console.log("Game started ...")
}

const mainMenuId = "menu";
const gameScreenId = "game";
const aboutScreenId = "about";


var MainMenuScreen = {
    update: function () {

    },

    draw: function () {

    }
};

var GameScreen = {
    update: function () {

    },

    draw: function () {

    }
};

var AboutScreen = {
    update: function () {

    },

    draw: function () {

    }
}