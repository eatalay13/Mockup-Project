"use strict";
console.clear();
const log = console.log.bind(console);
const svgns = "http://www.w3.org/2000/svg";
SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function (toElement) {
    return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
};

class Ripple {
    constructor(x, y, color) {
        this.color = color;
        this.element = document.createElementNS(svgns, "circle");
        const dx = x - offsetX;
        const dy = y - offsetY;
        const element = this.element;
        const radius = this.getRadius(dx, dy, phoneRect.width, phoneRect.height);
        rippleLayer.appendChild(element);
        element.setAttribute("r", 5);
        TweenLite.set(element, {
            transformOrigin: "center",
            fill: color,
            x: x,
            y: y
        });
        TweenLite.to(element, rippleDuration, {
            scale: radius / 2,
            ease: Power1.easeIn,
            callbackScope: this,
            onComplete: this.removeRipple
        });
    }
    getRadius(x, y, w, h) {
        const cx = w / 2;
        const cy = h / 2;
        const dx = x < cx ? w - x : x;
        const dy = y < cy ? h - y : y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    removeRipple() {
        TweenLite.set(background, { fill: this.color });
        rippleLayer.removeChild(this.element);
    }
}

class ColorItem {
    constructor(color) {
        this.color = color;
        this.itemElement = document.createElement("color-item");
        this.dragElement = document.createElement("color-draggable");
        this.draggable = new Draggable(this.dragElement, {
            trigger: this.itemElement,
            onPress: this.onPress,
            onDragStart: this.onDragStart,
            onDrag: this.onDrag,
            onRelease: this.onRelease,
            callbackScope: this,
            cursor: grab,
        });
        const itemElement = this.itemElement;
        const dragElement = this.dragElement;
        colorPicker.appendChild(itemElement);
        itemElement.appendChild(dragElement);
        TweenLite.set(dragElement, {
            autoAlpha: 0,
            scale: 0.25,
        });
        TweenLite.set([itemElement, dragElement], {
            backgroundColor: color
        });
    }
    hitTest(x, y) {
        let inside = false;
        if (phoneRect.contains(x, y)) {
            if (phonePoly.contains(x, y)) {
                inside = true;
            }
        }
        return inside;
    }
    onPress() {
        this.itemElement.style.setProperty("z-index", Draggable.zIndex);
        this.dragElement.style.setProperty("cursor", grabbing);
        TweenLite.set(this.dragElement, {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0
        });
        TweenLite.to(shadowColor, 0.2, { attr: { "flood-color": this.color } });
        TweenLite.to(phoneOutline, 0.2, { stroke: this.color });
        outlineAnimation.reverse();
        this.draggable.update();
    }
    onDragStart() {
        TweenLite.to(this.dragElement, 0.25, {
            autoAlpha: 1,
            scale: 1.5,
            ease: Power1.easeInOut
        });
    }
    onRelease() {
        const x = this.draggable.pointerX - window.pageXOffset;
        const y = this.draggable.pointerY - window.pageYOffset;
        const point = toLocal(x, y);
        const inside = this.hitTest(point.x, point.y);
        let duration = 0.2;
        if (inside) {
            const ripple = new Ripple(point.x, point.y, this.color);
            duration = 0;
        }
        outlineAnimation.reverse();
        TweenLite.to(this.dragElement, duration, {
            autoAlpha: 0,
            scale: 0.25,
            ease: Power1.easeIn
        });
    }
    onDrag() {
        const x = this.draggable.pointerX - window.pageXOffset;
        const y = this.draggable.pointerY - window.pageYOffset;
        const point = toLocal(x, y);
        const inside = this.hitTest(point.x, point.y);
        outlineAnimation[inside ? "play" : "reverse"]();
    }
}

class Rectangle {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    contains(x, y) {
        if (this.width <= 0 || this.height <= 0) {
            return false;
        }
        if (x >= this.x && x < this.x + this.width) {
            if (y >= this.y && y < this.y + this.height) {
                return true;
            }
        }
        return false;
    }
}

class Polygon {
    constructor(points) {
        this.points = points;
    }
    contains(x, y) {
        let inside = false;
        const points = this.points;
        const size = points.length / 2;
        // use raycasting to test hits
        // https://github.com/substack/point-in-polygon/blob/master/index.js
        for (let i = 0, j = size - 1; i < size; j = i++) {
            const xi = points[i * 2];
            const yi = points[(i * 2) + 1];
            const xj = points[j * 2];
            const yj = points[(j * 2) + 1];
            const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * ((y - yi) / (yj - yi))) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }
}

function globalToLocal(element, svg) {
    const pt = svg.createSVGPoint();
    return (x, y) => {
        pt.x = x;
        pt.y = y;
        const globalPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
        const localMatrix = element.getTransformToElement(svg).inverse();
        return globalPoint.matrixTransform(localMatrix);
    };
}

const colors = [
    "#b8c2de",
    "#537ebf",
    "#244191",
    "#ac286e",
    "#f17bb0",
    "#e8405d",
    "#f9a977",
    "#f9f06e",
    "#a7d492",
    "#88d3e1",
    "#F74B26"
];

const rippleDuration = 0.5;
const { grab, grabbing } = getCursors();
const svg = document.querySelector("#phone-svg");
const background = document.querySelector("#background");
const colorPicker = document.querySelector("color-picker");
const rippleLayer = document.querySelector("#ripple-layer");
const phoneOutline = document.querySelector("#phone-outline");
const shadowColor = document.querySelector("#shadow-color");
const shadowBlur = document.querySelector("#shadow-blur");

const pathData = MorphSVGPlugin.pathDataToBezier(phoneOutline);
const contour = simplify(getContour(pathData, 50), 5, false);
const points = contour.reduce((res, pt) => {
    res.push(roundTo(pt.x, 3));
    res.push(roundTo(pt.y, 3));
    return res;
}, []);
const box1 = phoneOutline.getBBox();
const box2 = background.getBBox();
// Shapes for hit testing
const phoneRect = new Rectangle(box1.x, box1.y, box1.width, box1.height);
const colorRect = new Rectangle(box2.x, box2.y, box2.width, box2.height);
const phonePoly = new Polygon(points);
const toLocal = globalToLocal(background, svg);
const offsetX = phoneRect.x - colorRect.x;
const offsetY = phoneRect.y - colorRect.y;
const outlineAnimation = new TimelineLite()
    .to(phoneOutline, rippleDuration * 0.75, { opacity: 1, ease: Sine.easeInOut })
    .reverse();
const colorItems = colors.map(color => new ColorItem(color));
TweenLite.set("color-item", { autoAlpha: 1 });
TweenLite.set("phone-container", { autoAlpha: 0, scale: 0.5 });
window.addEventListener("load", onLoad);
window.focus();

document.getElementById("text1-value").addEventListener("keydown", function (e) {
    document.getElementById("text1").innerHTML = document.getElementById("text1-value").value;
});

document.getElementById("desings").addEventListener("change", function (e) {
    document.getElementById("design-layer").setAttribute('href', document.getElementById("desings").value);
});

$("#text1").click(function () {
    alert("sdadsad");
});

function textalert(){
    alert("sadadas");
}

function onLoad() {
    TweenLite.to("phone-container", 0.55, { autoAlpha: 1, scale: 1 });
}

function roundTo(value, place = 0, base = 10) {
    const p = Math.pow(base, place);
    return Math.round(value * p) / p;
}

function getCursors() {
    const element = document.createElement("color-draggable");
    document.body.appendChild(element);
    const style = window.getComputedStyle(element, null);
    const grab = style.getPropertyValue("cursor");
    element.classList.add("dragging");
    const grabbing = style.getPropertyValue("cursor");
    document.body.removeChild(element);
    return { grab, grabbing };
}
