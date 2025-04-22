const canvasWidth = 1440;
const canvasHeight = window.innerHeight;

const particleList = [
    {
        position: { x: 100, y: 500 },
        radius: 40,
        color: 'rgb(255, 195, 0)',
        velocity: {
            x: -25,
            y: 10,
        }
    },
    {
        position: { x: 300, y: 200 },
        radius: 50,
        color: 'rgb(0, 53, 102)',
        velocity: {
            x: -15,
            y: 20,
        }
    },
    {
        position: { x: 700, y: 300 },
        radius: 60,
        color: 'rgb(141, 153, 174)',
        velocity: {
            x: -45,
            y: 40,
        }
    },
    {
        position: { x: 700, y: 300 },
        radius: 15,
        color: 'rgb(0, 8, 20)',
        velocity: {
            x: -45,
            y: 5,
        }
    },
]
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
    handleBoundaryCollision() {
        if (this.position.x - this.radius < 0) {
            this.velocity.x *= -1;
            this.position.x = this.radius + 1
        } else if (this.position.x + this.radius > canvasWidth) {
            this.velocity.x *= -1;
            this.position.x = canvasWidth - this.radius 
        }
        if (this.position.y - this.radius < 0) {
            this.velocity.y *= -1;
            this.position.y = this.radius + 1
        } else if (this.position.y + this.radius > canvasHeight) {
            this.velocity.y *= -1;
            this.position.y = canvasHeight - this.radius
        }
    }
    updatePosition() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
    increaseVelocity(number) {
        this.velocity.x = this.velocity.x + (Math.sign(this.velocity.x) * number)
        this.velocity.y = this.velocity.y + (Math.sign(this.velocity.y) * number)
    }
    collideWith(otherParticle) {
        const impact = { 
            x: otherParticle.position.x - this.position.x,
            y: otherParticle.position.y - this.position.y
        }
        let distance = Math.sqrt(Math.pow(impact.x, 2) + Math.pow(impact.y, 2))

        if (distance < this.radius + otherParticle.radius) {
            
            // calculate overlap and required shift values
            const overlap = (this.radius + otherParticle.radius) - distance
            const scaleFactor = overlap * 0.5 / distance
            const shift = {
                x: impact.x * scaleFactor,
                y: impact.y * scaleFactor
            }

            // shift particle to compensate for overlap
            this.position.x = this.position.x - shift.x
            this.position.y = this.position.y - shift.y
            otherParticle.position.x = otherParticle.position.x + shift.x
            otherParticle.position.y = otherParticle.position.y + shift.y

            // correct impact vector and distance
            impact.x = otherParticle.position.x - this.position.x
            impact.y = otherParticle.position.y - this.position.y
            distance = this.radius + otherParticle.radius

            const mA = this.radius
            const mB = otherParticle.radius
            const denominator = (mA+mB) * distance * distance
            const vDiff = { x: otherParticle.velocity.x - this.velocity.x, y: otherParticle.velocity.y - this.velocity.y };

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
                x: otherParticle.velocity.x + deltaVb.x,
                y: otherParticle.velocity.y + deltaVb.y
            }
            otherParticle.velocity = vBfinal
            return true
        } else {
            return false
        }
    }
}

const button = document.querySelector('button')
const canvas = document.querySelector('canvas');
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const canvasCtx = canvas.getContext('2d');
const particles = particleList.map(p => new Particle(p.position, p.radius, p.color, p.velocity));

// increase velocity
button.addEventListener("click", () => particles.forEach(p => p.increaseVelocity(10)))

function renderVisualisation() {
    requestAnimationFrame(() => renderVisualisation());
    canvasCtx.fillStyle = "rgb(250 250 250)";
    canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    particles.forEach((particle, index) => {
        particle.handleBoundaryCollision();
        particle.updatePosition();

        for (let j = index + 1; j < particles.length; j++) {
            const collided = particle.collideWith(particles[j]);
            if (collided) break;
        }
        particle.draw(canvasCtx);
    });
}
renderVisualisation();

// resource
// https://youtu.be/dJNFPv9Mj-Y?si=x7k0ledd4RBwsDnT