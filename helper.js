

const Helper = {
    distance: function (u, v) {
        return Math.sqrt(Math.pow(v.x - u.x, 2) + Math.pow(v.y - u.y, 2));
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
        this.x /= u;
        this.y /= u;
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
}

function random(min, max) {
    return min + Math.random() * (max - min);
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
        return new Vector2(x + w / 2, y + h / 2);
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
}



function RectFromPosition(pos, w, h) {
    return new Rectangle(pos.x - w / 2, pos.y - h / 2, w, h);
}
