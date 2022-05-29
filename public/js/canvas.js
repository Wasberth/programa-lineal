const pointRadius = 5;

const atLeastX = -10;
const atLeastY = -10;
const atMostX = 10;
const atMostY = 10;

const extraOffset = 1;

let beginGrad = new Point(-11, 11);
let endGrad = new Point(11, -11);

let pointCont;
let transCont;
let addBut;

let xIn;
let yIn;

let points = [];
let theCanvas;

let inverted = false;

// Global functions
function deleteAndUpdate(x, y) {
    let deleted = [];

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (point.x == x && point.y == y) {
            continue;
        }

        deleted.push(point);
    }

    points = deleted;
    updateDisplayPoints();
    theCanvas.clear();
    theCanvas.draw();
}

function updateDisplayPoints() {
    let pCont = `<form style="margin-top: 5px;">`;

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        pCont = pCont + `
            <div class="input-group mb-3">
                <span class="input-group-text">x:</span>
                <input id="xIn" type="number" class="form-control" aria-label="X" readonly value=${point.x}>
                <span class="input-group-text">y:</span>
                <input id="yIn" type="number" class="form-control" aria-label="Y" readonly value=${point.y}>
                <input id="delete-${i}" type="button" class="form-control btn btn-danger" value="Eliminar" aria-label="Delete" onclick="deleteAndUpdate(${point.x}, ${point.y})">
            </div>
            `;
    }

    pointCont.innerHTML = pCont + "</form>";
}

// Point class
function Point(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    this.add = (p) => {
        return Point.add(this, p);
    };

    this.subtract = (p) => {
        return Point.subtract(this, p);
    };

    this.scaleVec = (c) => {
        return new Point(this.x * c, this.y * c);
    }

    this.expandX = (c) => {
        return new Point(this.x * c, this.y);
    }

    this.expandY = (c) => {
        return new Point(this.x, this.y * c);
    }

    this.vectorAngleTo = (p) => {
        return Math.atan2(p.y - this.y, p.x - this.x);
    };

    this.distanceTo = (p) => {
        let xDist = p.x - this.x;
        let yDist = p.y - this.y;

        return Math.sqrt((xDist * xDist) + (yDist * yDist));
    };
}

Point.add = (p1, p2) => {
    return new Point(p1.x + p2.x, p1.y + p2.y);
};

Point.subtract = (p1, p2) => {
    return new Point(p1.x - p2.x, p1.y - p2.y);
};

Point.orderPolygon = (pointArray) => {
    if (pointArray.length <= 1) {
        return pointArray;
    }

    function findAngles(c, pionts) {
        let len = pionts.length, p, dx, dy;

        for (let i = 0; i < len; i++) {
            p = pionts[i];
            dx = p.x - c.x;
            dy = p.y - c.y;
            p.angle = (Math.atan2(dy, dx) + 2 * Math.PI) % (Math.PI * 2);
        }
    }

    function findCenter(pionts) {
        let x = 0, y = 0, len = points.length;

        for (let i = 0; i < len; i++) {
            x += pionts[i].x;
            y += pionts[i].y;
        }
        return new Point(x / len, y / len);   // return average position
    }

    // Center point
    let center = findCenter(pointArray);

    findAngles(center, pointArray);

    function compare(a, b) {
        if (a.angle === b.angle) {
            if (inverted) {
                return b.distanceTo(center) - a.distanceTo(center);
            }

            return a.distanceTo(center) - b.distanceTo(center);
        }

        return a.angle - b.angle;
    }

    // first sort clockwise
    pointArray.sort(compare);

    //const ccwPoints = reverse ? pointArray.reverse() : pointArray;

    // move the last point back to the start
    //ccwPoints.unshift(ccwPoints.pop());

    return pointArray;
};

// Canvas class
function Canvas(canvas, context, drawCanvas, resize) {
    this.calculateCenter = () => {
        this.center = new Point(
            (Math.abs(this.minX) + extraOffset) * this.xWeight,
            (Math.abs(this.maxY) + extraOffset) * this.yWeight,
        );
    };

    this.calculateWeights = () => {
        this.xWeight = this.canvas.width / (Math.abs(this.minX) + Math.abs(this.maxX) + 2 * extraOffset);
        this.yWeight = this.canvas.height / (Math.abs(this.minY) + Math.abs(this.maxY) + 2 * extraOffset);
    };

    this.calculateGrad = () => {
        this.realBeginGrad = this.calculatePoint(beginGrad);
        this.realEndGrad = this.calculatePoint(endGrad);

        this.polygonColor = this.context.createLinearGradient(
            this.realBeginGrad.x, this.realBeginGrad.y, this.realEndGrad.x, this.realEndGrad.y
        );
        this.polygonColor.addColorStop(0, "red");
        this.polygonColor.addColorStop(0.2, "orange");
        this.polygonColor.addColorStop(0.4, "yellow");
        this.polygonColor.addColorStop(0.6, "green");
        this.polygonColor.addColorStop(0.8, "blue");
        this.polygonColor.addColorStop(1, "purple");
    }

    this.canvas = canvas;
    this.context = context;
    this.drawCanvas = drawCanvas;

    this.minX = atLeastX;
    this.minY = atLeastY;
    this.maxX = atMostX;
    this.maxY = atMostY;

    this.xWeight;
    this.yWeight;

    this.center;

    this.calculateWeights();
    this.calculateCenter();

    this.calculatePoint = (point) => {
        return Point.add(this.center, point.expandX(this.xWeight).expandY(-this.yWeight));
    };

    this.clear = () => { context.clearRect(0, 0, window.innerWidth, window.innerHeight); };
    this.draw = () => { this.drawCanvas(this); };

    this.resize = () => {
        resize();
        this.clear();

        this.calculateWeights();
        this.calculateCenter();
        this.calculateGrad();

        this.draw();
    };

    this.axisColor = "#aaa";
    this.pointColor = "#000";
    this.polygonColor;
    this.calculateGrad();

    this.realBeginGrad;
    this.realEndGrad;

    this.resize();
}

window.onload = () => {
    // Canvas functions
    function drawAxis(c) {
        c.context.strokeStyle = c.axisColor;
        c.context.lineWidth = 2;

        // X
        c.context.beginPath();
        c.context.moveTo(0, c.center.y);
        c.context.lineTo(c.canvas.width, c.center.y);
        c.context.stroke();

        // Y
        c.context.beginPath();
        c.context.moveTo(c.center.x, 0);
        c.context.lineTo(c.center.x, c.canvas.height);
        c.context.stroke();
    }

    function drawPoints(c) {
        points = Point.orderPolygon(points);
        console.log(points);

        if (points.length >= 3) {

            c.context.strokeStyle = c.polygonColor;
            c.context.fillStyle = c.polygonColor;
            c.context.lineWidth = 4;
            c.context.beginPath();
            let lastP = c.calculatePoint(points[points.length - 1]);
            c.context.moveTo(lastP.x, lastP.y);
            for (let i = 0; i < points.length; i++) {
                const point = c.calculatePoint(points[i]);
                c.context.lineTo(point.x, point.y);
            }
            c.context.stroke();
        }

        c.context.strokeStyle = c.pointColor;
        c.context.fillStyle = c.pointColor;
        c.context.lineWidth = 1;
        for (let i = 0; i < points.length; i++) {
            const point = c.calculatePoint(points[i]);
            c.context.beginPath();
            c.context.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
            c.context.fill();
        }
    }

    function recalculateMax(c) {
        if (points.length <= 0) {
            c.minX = atLeastX;
            c.maxX = atMostX;
            c.minY = atLeastY;
            c.maxY = atMostY;

            c.calculateWeights();
            c.calculateCenter();
            return;
        }

        let leftest = points[0];
        let rightest = points[0];
        let highest = points[0];
        let lowest = points[0];

        for (let i = 0; i < points.length; i++) {
            const point = points[i];

            if (leftest.x > point.x) {
                leftest = point;
            }

            if (rightest.x < point.x) {
                rightest = point;
            }

            if (highest.y < point.y) {
                highest = point;
            }

            if (lowest.y > point.y) {
                lowest = point;
            }
        }

        c.minX = Math.min(leftest.x, atLeastX);
        c.maxX = Math.max(rightest.x, atMostX);
        c.minY = Math.min(lowest.y, atLeastY);
        c.maxY = Math.max(highest.y, atMostY);

        c.calculateGrad();
        c.calculateWeights();
        c.calculateCenter();
    }

    function drawCanvas(c) {
        recalculateMax(c);
        drawAxis(c);
        drawPoints(c);
    }

    function res() {
        let content = document.getElementById("row-c");

        canvas.height = content.offsetHeight * 0.97;
        canvas.width = content.offsetWidth * 0.95;
    }

    // Global variables
    let canvas = document.getElementById("XY");
    let context = canvas.getContext("2d");
    theCanvas = new Canvas(canvas, context, drawCanvas, res);

    pointCont = document.getElementById("pointContainer");
    transCont = document.getElementById("transContainer");
    addBut = document.getElementById("addPointButton");

    xIn = document.getElementById("xIn");
    yIn = document.getElementById("yIn");

    addBut.addEventListener("click", () => {
        theCanvas.clear();

        let p = new Point(Number(xIn.value), Number(yIn.value));
        let included = false;

        for (let i = 0; i < points.length; i++) {
            const point = points[i];

            if (point.x === p.x && point.y === p.y) {
                included = true;
                break;
            }
        }

        if (!included) {
            points.push(p);
        }

        beginGrad = new Point(theCanvas.minX, theCanvas.minY);
        endGrad = new Point(theCanvas.maxX, theCanvas.maxY);

        theCanvas.draw();
        updateDisplayPoints();
    });

    let reflectX = document.getElementById("reflectX");
    let reflectY = document.getElementById("reflectY");
    let expandX = document.getElementById("expandX");
    let expandY = document.getElementById("expandY");
    let cutX = document.getElementById("cutX");
    let cutY = document.getElementById("cutY");
    let rotateRad = document.getElementById("rotateRad");
    let rotateDeg = document.getElementById("rotateDeg");

    reflectX.addEventListener("click", () => {
        for (let i = 0; i < points.length; i++) {
            points[i] = points[i].expandY(-1);
        }
        inverted = !inverted;

        beginGrad = beginGrad.expandY(-1);
        endGrad = endGrad.expandY(-1);

        updateDisplayPoints();
        theCanvas.clear();
        theCanvas.draw();
    });

    reflectY.addEventListener("click", () => {
        for (let i = 0; i < points.length; i++) {
            points[i] = points[i].expandX(-1);
        }
        inverted = !inverted;

        beginGrad = beginGrad.expandX(-1);
        endGrad = endGrad.expandX(-1);

        updateDisplayPoints();
        theCanvas.clear();
        theCanvas.draw();
    });

    expandX.addEventListener("click", () => {
        let c = document.getElementById("cExIn");
        if (!c.value) {
            alert("Ingrese un valor");
            return;
        }

        let cV = Number(c.value);

        for (let i = 0; i < points.length; i++) {
            points[i] = points[i].expandX(cV);
        }

        beginGrad = beginGrad.expandX(cV);
        endGrad = endGrad.expandX(cV);

        updateDisplayPoints();
        theCanvas.clear();
        theCanvas.draw();
    });

    expandY.addEventListener("click", () => {
        let c = document.getElementById("cExIn");
        if (!c.value) {
            alert("Ingrese un valor");
            return;
        }

        let cV = Number(c.value);

        for (let i = 0; i < points.length; i++) {
            points[i] = points[i].expandY(cV);
        }

        beginGrad = beginGrad.expandY(cV);
        endGrad = endGrad.expandY(cV);

        updateDisplayPoints();
        theCanvas.clear();
        theCanvas.draw();
    });

    cutX.addEventListener("click", () => {
        let c = document.getElementById("cCutIn");
        if (!c.value) {
            alert("Ingrese un valor");
            return;
        }

        let cV = Number(c.value);

        for (let i = 0; i < points.length; i++) {
            points[i] = new Point(points[i].x + cV * points[i].y, points[i].y);
        }

        beginGrad = new Point(beginGrad.x + cV * beginGrad.y, beginGrad.y);
        endGrad = new Point(endGrad.x + cV * endGrad.y, endGrad.y);

        updateDisplayPoints();
        theCanvas.clear();
        theCanvas.draw();
    });

    cutY.addEventListener("click", () => {
        let c = document.getElementById("cCutIn");
        if (!c.value) {
            alert("Ingrese un valor");
            return;
        }

        let cV = Number(c.value);

        for (let i = 0; i < points.length; i++) {
            points[i] = new Point(points[i].x, cV * points[i].x + points[i].y);
        }

        beginGrad = new Point(beginGrad.x, cV * beginGrad.x + beginGrad.y);
        endGrad = new Point(endGrad.x, cV * endGrad.x + endGrad.y);

        updateDisplayPoints();
        theCanvas.clear();
        theCanvas.draw();
    });

    rotateRad.addEventListener("click", () => {
        let c = document.getElementById("cRotIn");
        if (!c.value) {
            alert("Ingrese un valor");
            return;
        }

        let cV = Number(c.value);
        let cos = Math.cos(cV);
        let sin = Math.sin(cV);

        for (let i = 0; i < points.length; i++) {
            let a = (points[i].x * cos) + (points[i].y * sin);
            let b = (- points[i].x * sin) + (points[i].y * cos);

            points[i] = new Point(a, b);
        }

        let ab = (beginGrad.x * cos) + (beginGrad.y * sin);
        let bb = (- beginGrad.x * sin) + (beginGrad.y * cos);

        beginGrad = new Point(ab, bb);

        ae = (endGrad.x * cos) + (endGrad.y * sin);
        be = (- endGrad.x * sin) + (endGrad.y * cos);

        endGrad = new Point(ae, be);

        updateDisplayPoints();
        theCanvas.clear();
        theCanvas.draw();
    });

    rotateDeg.addEventListener("click", () => {
        let c = document.getElementById("cRotIn");
        if (!c.value) {
            alert("Ingrese un valor");
            return;
        }

        let cV = Number(c.value);
        cV = cV * Math.PI / 180;

        let cos = Math.cos(cV);
        let sin = Math.sin(cV);

        for (let i = 0; i < points.length; i++) {
            a = (points[i].x * cos) + (points[i].y * sin);
            b = (- points[i].x * sin) + (points[i].y * cos);

            points[i] = new Point(a, b);
        }

        let ab = (beginGrad.x * cos) + (beginGrad.y * sin);
        let bb = (- beginGrad.x * sin) + (beginGrad.y * cos);

        beginGrad = new Point(ab, bb);

        ae = (endGrad.x * cos) + (endGrad.y * sin);
        be = (- endGrad.x * sin) + (endGrad.y * cos);

        endGrad = new Point(ae, be);

        updateDisplayPoints();
        theCanvas.clear();
        theCanvas.draw();
    });

};

window.onresize = () => {
    theCanvas.resize();
};
