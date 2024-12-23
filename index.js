"use strict";
const SCREEN_WIDTH = 1440;
const SCREEN_HEIGHT = window.innerHeight;
const CIRCLE_RADIUS = 50;
const COLORS = [
    `rgba(43, 45, 66, 1)`,
    `rgba(141, 153, 174, 1)`,
    // `rgba(237, 242, 244, 1)`,
    `rgba(239, 35, 60, 1)`,
    `rgba(217, 4, 41, 1)`
];

function calcKineticEnergy(mass, velocity) {
    const speed = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2))
    return 0.5 * mass * speed * speed
}

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
    collide(circleB) {
        const impact = { 
            x: circleB.position.x - this.position.x,
            y: circleB.position.y - this.position.y
        }
        let distance = Math.sqrt(Math.pow(impact.x, 2) + Math.pow(impact.y, 2))

        if (distance < this.radius + circleB.radius) {
            
            // calculate overlap and required shift values
            const overlap = (this.radius + circleB.radius) - distance
            const scaleFactor = overlap * 0.5 / distance
            const shift = {
                x: impact.x * scaleFactor,
                y: impact.y * scaleFactor
            }

            // shift circle to compensate for overlap
            this.position.x = this.position.x - shift.x
            this.position.y = this.position.y - shift.y
            circleB.position.x = circleB.position.x + shift.x
            circleB.position.y = circleB.position.y + shift.y

            // correct impact vector and distance
            impact.x = circleB.position.x - this.position.x
            impact.y = circleB.position.y - this.position.y
            distance = this.radius + circleB.radius


            const kineticBefore = calcKineticEnergy(this.radius, this.velocity) + calcKineticEnergy(circleB.radius, circleB.velocity)
            console.log(`Mass A:${this.radius}  B:${circleB.radius}\nSpeed A: ${(Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2))).toFixed(2)} B: ${(Math.sqrt(Math.pow(circleB.velocity.x, 2) + Math.pow(circleB.velocity.y, 2))).toFixed(2)}\nkinetic E: ${kineticBefore.toFixed(2)}`)

            const mA = this.radius
            const mB = circleB.radius
            const denominator = (mA+mB) * distance * distance
            const vDiff = { x: circleB.velocity.x - this.velocity.x, y: circleB.velocity.y - this.velocity.y };

            //  Circle A
            const numeratorAx = 2 * mB * vDiff.x * impact.x
            const numeratorAy = 2 * mB * vDiff.y * impact.y

            const deltaVa = {
                x: numeratorAx / denominator * impact.x,
                y: numeratorAy / denominator * impact.y
            }

            const vAfinal = {
                x: this.velocity.x + deltaVa.x,
                y: this.velocity.y + deltaVa.y
            }

            this.velocity = vAfinal

            //  Circle B
            const numeratorBx = 2 * mA * (vDiff.x * -1) * (impact.x * -1)
            const numeratorBy = 2 * mA * (vDiff.y * -1) * (impact.y * -1)
            
            const deltaVb = {
                x: numeratorBx / denominator * (impact.x * -1),
                y: numeratorBy / denominator * (impact.y * -1)
            }

            const vBfinal = {
                x: circleB.velocity.x + deltaVb.x,
                y: circleB.velocity.y + deltaVb.y
            }
            circleB.velocity = vBfinal
            const kineticAfter = calcKineticEnergy(this.radius, this.velocity) + calcKineticEnergy(circleB.radius, circleB.velocity)
            // if (kineticBefore !== kineticAfter) console.log(`${kineticBefore} : ${kineticAfter}`)
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
            x: polarityX * Math.ceil(Math.random() *20),
            y: polarityY * Math.ceil(Math.random() * 20),
        };
        const randomRadius = Math.ceil(Math.random() * CIRCLE_RADIUS)
        const circle = new Circle(randomStartPosition, randomRadius, randomColor, randomVelocity);
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
const circles = getCircles(2);

function renderVisualisation() {
    requestAnimationFrame(() => renderVisualisation());
    canvasCtx.fillStyle = "rgb(250 250 250)";
    canvasCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    circles.forEach((circleA, index) => {
        reactToEdgeCollisions(circleA.position, circleA.velocity, circleA.radius);
        circleA.position.x += circleA.velocity.x;
        circleA.position.y += circleA.velocity.y;

        for (let j = index + 1; j < circles.length; j++) {
            const circleB = circles[j];
            const collided = circleA.collide(circleB);
            if (collided === true) break;
        }
        circleA.draw(canvasCtx);
    });
    circles.forEach((circleA) => {
        circleA.draw(canvasCtx);
    });
}
renderVisualisation();
