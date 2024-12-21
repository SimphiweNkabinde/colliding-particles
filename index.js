"use strict";
const SCREEN_WIDTH = 1440;
const SCREEN_HEIGHT = window.innerHeight;
const CIRCLE_RADIUS = 50;
const COLORS = [
    `rgba(43, 45, 66, 1)`,
    `rgba(141, 153, 174, 1)`,
    `rgba(237, 242, 244, 1)`,
    `rgba(239, 35, 60, 1)`,
    `rgba(217, 4, 41, 1)`
];

class Circle {
    constructor(startPosition, radius, fillColor, startVelocity) {
        this.position = startPosition;
        this.radius = radius;
        this.fillColor = fillColor;
        this.velocity = startVelocity;
    }
    draw(canvasCtx) {
        canvasCtx.beginPath();
        canvasCtx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        canvasCtx.fillStyle = this.fillColor;
        canvasCtx.fill();
    }
    collide(otheCircle) {

        const v1dx = this.position.x - otheCircle.position.x
        const v1dy = this.position.y - otheCircle.position.y
        const v2dx = otheCircle.position.x - this.position.x
        const v2dy = otheCircle.position.y - this.position.y
        const distance = Math.sqrt(Math.pow(v1dx, 2) + Math.pow(v1dy, 2))

        if (distance < (this.radius + otheCircle.radius) && distance > (this.radius )) {

            const v1dV = { x: otheCircle.velocity.x - this.velocity.x, y: otheCircle.velocity.y - this.velocity.y };
            const v2dV = { x: this.velocity.x - otheCircle.velocity.x, y: this.velocity.y - otheCircle.velocity.y};
            const v1dS = { x: v1dx, y: v1dy }
            const v2dS = { x: v2dx, y: v2dy }
            const v1s = this.velocity
            const v2s = otheCircle.velocity
            const m1 = this.radius
            const m2 = otheCircle.radius
            
            const v1numeratorX = (2 * m2) * v1dV.x * v1dS.x * v1dS.x
            const v1numeratorY = (2 * m2) * v1dV.y * v1dS.y * v1dS.y

            const v2numeratorX = (2 * m2) * v2dV.x * v2dS.x * v2dS.x
            const v2numeratorY = (2 * m2) * v2dV.y * v2dS.y * v2dS.y

            const denominator = (m1+m2) * distance * distance

            const v1Final = { 
                x: ((v1s.x * denominator) + v1numeratorX )/denominator,
                y: ((v1s.y * denominator) + v1numeratorY )/denominator
            }

            const v2Final = {
                x: ((v2s.x * denominator) + v2numeratorX)/denominator,
                y: ((v2s.y * denominator) + v2numeratorY)/denominator
            }
            this.velocity = v1Final
            otheCircle.velocity = v2Final
            return true
        } else {
            return false
        }
    }
}

function setNewRandomPosition() {
    const radius = CIRCLE_RADIUS;
    let finalX = Math.floor(Math.random() * SCREEN_WIDTH);
    let finalY = Math.floor(Math.random() * SCREEN_HEIGHT);
    // compensate for circle radius
    if (finalX < radius)
        finalX += radius;
    if (SCREEN_HEIGHT - finalX < radius)
        finalX -= radius;
    if (finalY < radius)
        finalY += radius;
    if (SCREEN_HEIGHT - finalY < radius)
        finalY -= radius;
    return { x: finalX, y: finalY };
}

function getCircles(number) {
    const circleList = [];
    for (let index = 0; index < number; index++) {
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const randomStartPosition = setNewRandomPosition()
        let polarityX = index % 2 == 0 ? -1 : 1;
        let polarityY = index % 3 == 0 ? -1 : 1;
        const randomVelocity = {
            x: polarityX * Math.ceil(Math.random() * 10),
            y: polarityY * Math.ceil(Math.random() * 10),
        };
        const randomRadius = Math.ceil(Math.random() * CIRCLE_RADIUS)
        const circle = new Circle(randomStartPosition, CIRCLE_RADIUS, randomColor, randomVelocity);
        circleList.push(circle);
    }
    return circleList;
}

function reactToEdgeCollisions(position, velocity, radius) {
    // collision with walls
    if (position.x + radius > SCREEN_WIDTH || position.x - radius < 0) {
        velocity.x = -velocity.x;
    }
    if (position.y + radius > SCREEN_HEIGHT || position.y - radius < 0) {
        velocity.y = -velocity.y;
    }
}
/**
 * 
 * @param {Circle} circleA 
 * @param {Circle[]} allCircles 
 */
function reactToCircleCollisions(circleA, allCircles) {


}

const canvas = document.querySelector('canvas');
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const canvasCtx = canvas.getContext('2d');
const circles = getCircles(5);

function renderVisualisation() {
    requestAnimationFrame(() => renderVisualisation());
    canvasCtx.fillStyle = "rgb(250 250 250)";
    canvasCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    circles.forEach((circleA, index) => {
        reactToEdgeCollisions(circleA.position, circleA.velocity, circleA.radius);
        circleA.position.x += circleA.velocity.x;
        circleA.position.y += circleA.velocity.y;

        // for (let j = index + 1; j < circles.length; j++) {
        //     const circleB = circles[j];
        //     const collided = circleA.collide(circleB);
        //     if (collided === true) break;
        // }
        // circleA.draw(canvasCtx);
    });
    circles.forEach((circleA) => {
        circleA.draw(canvasCtx);
    });
}
renderVisualisation();
