const SCREEN_WIDTH = 1440;
const SCREEN_HEIGHT = window.innerHeight;
const MAX_RADIUS = 50;
const COLORS = [
    `rgba(211, 194, 246, 1)`,
    `rgba(169, 201, 255, 1)`,
    `rgba(255, 187, 236, 1)`,
];

function calcKineticEnergy(mass, velocity) {
    const speed = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2))
    return 0.5 * mass * speed * speed
}

class Particle {
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
    reactToEdgeCollisions() {
        // collision with walls
        if (this.position.x + this.radius > SCREEN_WIDTH || this.position.x - this.radius < 0) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.y + this.radius > SCREEN_HEIGHT || this.position.y - this.radius < 0) {
            this.velocity.y = -this.velocity.y;
        }
    }
    collide(particleB) {
        const impact = { 
            x: particleB.position.x - this.position.x,
            y: particleB.position.y - this.position.y
        }
        let distance = Math.sqrt(Math.pow(impact.x, 2) + Math.pow(impact.y, 2))

        if (distance < this.radius + particleB.radius) {
            
            // calculate overlap and required shift values
            const overlap = (this.radius + particleB.radius) - distance
            const scaleFactor = overlap * 0.5 / distance
            const shift = {
                x: impact.x * scaleFactor,
                y: impact.y * scaleFactor
            }

            // shift particle to compensate for overlap
            this.position.x = this.position.x - shift.x
            this.position.y = this.position.y - shift.y
            particleB.position.x = particleB.position.x + shift.x
            particleB.position.y = particleB.position.y + shift.y

            // correct impact vector and distance
            impact.x = particleB.position.x - this.position.x
            impact.y = particleB.position.y - this.position.y
            distance = this.radius + particleB.radius


            const kineticBefore = calcKineticEnergy(this.radius, this.velocity) + calcKineticEnergy(particleB.radius, particleB.velocity)
            // console.log(`Mass A:${this.radius}  B:${particleB.radius}\nSpeed A: ${(Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2))).toFixed(2)} B: ${(Math.sqrt(Math.pow(particleB.velocity.x, 2) + Math.pow(particleB.velocity.y, 2))).toFixed(2)}\nkinetic E: ${kineticBefore.toFixed(2)}`)

            const mA = this.radius
            const mB = particleB.radius
            const denominator = (mA+mB) * distance * distance
            const vDiff = { x: particleB.velocity.x - this.velocity.x, y: particleB.velocity.y - this.velocity.y };

            //  Particle A
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

            //  Particle B
            const numeratorBx = 2 * mA * (vDiff.x * -1) * (impact.x * -1)
            const numeratorBy = 2 * mA * (vDiff.y * -1) * (impact.y * -1)
            
            const deltaVb = {
                x: numeratorBx / denominator * (impact.x * -1),
                y: numeratorBy / denominator * (impact.y * -1)
            }

            const vBfinal = {
                x: particleB.velocity.x + deltaVb.x,
                y: particleB.velocity.y + deltaVb.y
            }
            particleB.velocity = vBfinal
            const kineticAfter = calcKineticEnergy(this.radius, this.velocity) + calcKineticEnergy(particleB.radius, particleB.velocity)
            // if (kineticBefore !== kineticAfter) console.log(`${kineticBefore} : ${kineticAfter}`)
            return true
        } else {
            return false
        }
    }
}

function setNewRandomPosition() {
    const radius = MAX_RADIUS;
    let finalX = Math.floor(Math.random() * SCREEN_WIDTH);
    let finalY = Math.floor(Math.random() * SCREEN_HEIGHT);
    // compensate for particle radius
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

function getParticles(number) {
    const particleList = [];
    for (let index = 0; index < number; index++) {
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const randomStartPosition = setNewRandomPosition()
        let polarityX = index % 2 == 0 ? -1 : 1;
        let polarityY = index % 3 == 0 ? -1 : 1;
        const randomVelocity = {
            x: polarityX * Math.ceil(Math.random() *20),
            y: polarityY * Math.ceil(Math.random() * 20),
        };
        const randomRadius = Math.ceil(Math.random() * MAX_RADIUS)
        const particle = new Particle(randomStartPosition, randomRadius, randomColor, randomVelocity);
        particleList.push(particle);
    }
    return particleList;
}
/**
 * 
 * @param {Particle} particleA 
 * @param {Particle[]} allParticles 
 */
function reactToParticleCollisions(particleA, allParticles) {


}

const canvas = document.querySelector('canvas');
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
const canvasCtx = canvas.getContext('2d');
const particles = getParticles(5);

// increase velocity
canvas.addEventListener("click", () => {
    particles.forEach(p => {
        p.velocity.x = p.velocity.x * 2
        p.velocity.y = p.velocity.y * 2
    })
})

function renderVisualisation() {
    requestAnimationFrame(() => renderVisualisation());
    canvasCtx.fillStyle = "rgb(250 250 250)";
    canvasCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    particles.forEach((particleA, index) => {
        particleA.reactToEdgeCollisions();
        particleA.position.x += particleA.velocity.x;
        particleA.position.y += particleA.velocity.y;

        for (let j = index + 1; j < particles.length; j++) {
            const particleB = particles[j];
            const collided = particleA.collide(particleB);
            if (collided === true) break;
        }
        particleA.draw(canvasCtx);
    });
    particles.forEach((particleA) => {
        particleA.draw(canvasCtx);
    });
}
renderVisualisation();

// resource
// https://youtu.be/dJNFPv9Mj-Y?si=x7k0ledd4RBwsDnT