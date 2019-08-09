const Helper = {
    distance: function (u, v) {
        return Math.sqrt(Math.pow(v.x - u.x, 2) + Math.pow(v.y - u.y, 2));
    },

    roundRect: function (ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
    },

    drawRotatedImage: function (ctx, img, x, y, width, height, rad) {

        //Set the origin to the center of the image

        x = Math.floor(x);
        y = Math.floor(y);

        ctx.translate(x + width / 2, y + height / 2);

        //Rotate the canvas around the origin
        ctx.rotate(rad);

        //draw the image    
        ctx.drawImage(img, width / 2 * (-1), height / 2 * (-1), width, height);

        //reset the canvas  
        ctx.rotate(rad * (-1));
        ctx.translate((x + width / 2) * (-1), (y + height / 2) * (-1));
    },

    randomPointInRect(rect) {
        return new Vector2(random(rect.left(), rect.right()), random(rect.top(), rect.bottom()));
    },

    lerp: function (start, end, amt) {
        return (1 - amt) * start + amt * end
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    }

    add(u) {
        this.x += u.x;
        this.y += u.y;
    }

    mult(u) {
        this.x *= u;
        this.y *= u;
    }

    div(u) {
        this.x /= u;
        this.y /= u;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magSquare() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        let m = this.mag();
        if (m != 0 && m != 1) {
            this.div(m);
        }
    }

    limit() {
        if (this.magSquare() > max * max) {
            this.normalize();
            this.mult(max);
        }
    }

    static lerp(start, end, amt) {
        let x = Helper.lerp(start.x, end.x, amt);
        let y = Helper.lerp(start.y, end.y, amt);
        return new Vector2(x, y);
    }

    static copy(v) {
        return new Vector2(v.x, v.y);
    }

    toInt() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
    }
}

function random(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function mapValue(value, start1, stop1, start2, stop2) {
    let outgoing = start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    return outgoing;
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    center() {
        return new Vector2(this.x + this.w / 2, this.y + this.h / 2);
    }

    top() {
        return this.y;
    }

    bottom() {
        return this.y + this.h;
    }

    left() {
        return this.x;
    }

    right() {
        return this.x + this.w;
    }

    includes(v) {
        if (v != null) {
            return v.x > this.x && v.y > this.y && v.x < this.right() && v.y < this.bottom();
        }
        return false;
    }
}

function rectFromPosition(pos, w, h) {
    return new Rectangle(pos.x - w / 2, pos.y - h / 2, w, h);
}

(function () {

    var Camera = function (context, settings) {
        settings = settings || {};
        this.distance = 1000.0;
        this.lookat = [0, 0];
        this.context = context;
        this.fieldOfView = settings.fieldOfView || Math.PI / 4.0;
        this.viewport = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: 0,
            height: 0,
            scale: [1.0, 1.0]
        };
        this.updateViewport();
    };

    Camera.prototype = {
        begin: function () {
            this.context.save();
            this.applyScale();
            this.applyTranslation();
        },
        end: function () {
            this.context.restore();
        },
        applyScale: function () {
            this.context.scale(this.viewport.scale[0], this.viewport.scale[1]);
        },
        applyTranslation: function () {
            this.context.translate(-this.viewport.left, -this.viewport.top);
        },
        updateViewport: function () {
            this.aspectRatio = this.context.canvas.width / this.context.canvas.height;
            this.viewport.width = this.distance * Math.tan(this.fieldOfView);
            this.viewport.height = this.viewport.width / this.aspectRatio;
            this.viewport.left = this.lookat[0] - (this.viewport.width / 2.0);
            this.viewport.top = this.lookat[1] - (this.viewport.height / 2.0);
            this.viewport.right = this.viewport.left + this.viewport.width;
            this.viewport.bottom = this.viewport.top + this.viewport.height;
            this.viewport.scale[0] = this.context.canvas.width / this.viewport.width;
            this.viewport.scale[1] = this.context.canvas.height / this.viewport.height;
        },
        zoomTo: function (z) {
            this.distance = z;
            this.updateViewport();
        },
        moveTo: function (x, y) {
            this.lookat[0] = x;
            this.lookat[1] = y;
            this.updateViewport();
        },
        screenToWorld: function (x, y, obj) {
            obj = obj || {};
            obj.x = (x / this.viewport.scale[0]) + this.viewport.left;
            obj.y = (y / this.viewport.scale[1]) + this.viewport.top;
            return obj;
        },
        worldToScreen: function (x, y, obj) {
            obj = obj || {};
            obj.x = (x - this.viewport.left) * (this.viewport.scale[0]);
            obj.y = (y - this.viewport.top) * (this.viewport.scale[1]);
            return obj;
        }
    };

    this.Camera = Camera;

}).call(this);

class Size {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    rand() {
        return random(this.x, this.y);
    }
}