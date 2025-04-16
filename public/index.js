// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Configuration options
const opts = {
    charSize: 30,
    fireworkSpawnTime: 200,
    baseSpeed: 0.6,
    addedSpeed: 2,
    gravity: 0.1,
    maxAngle: 1,
    particleCount: 20,
    fade: 0.03,
    initialDelay: 2000, // 2 seconds in milliseconds
    resetDelay: 1000    // 1 second delay between rounds
};

// Calculated values
let calc = {
    totalWidth: 0,
    totalHeight: 0
};

// Canvas dimensions and center points
let w, h, hw, hh;

// Track if all letters have exploded
let allExploded = false;

// Initialize the canvas and dimensions
function initCanvas() {
    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;
hw = w / 2;
    hh = h / 2;
    
    ctx.font = opts.charSize + 'px Verdana';
    calc.totalWidth = w;
    calc.totalHeight = h;
}

// Letter class
function Letter(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.originalY = y;

    this.dx = -ctx.measureText(char).width / 2;
    this.dy = +opts.charSize / 2;

    this.fireworkDy = this.y - hh;

    var hue = (x / calc.totalWidth) * 360;

    this.color = "hsl(hue,80%,50%)".replace("hue", hue);
    this.lightColor = "hsl(hue,80%,light%)".replace("hue", hue);
    this.alphaColor = "hsla(hue,80%,50%,alp)".replace("hue", hue);

    this.reset();
}

Letter.prototype.reset = function () {
    this.phase = "waiting";
    this.tick = 0;
    this.spawned = false;
    this.spawnTime = (opts.fireworkSpawnTime * Math.random()) | 0;
    this.y = this.originalY;
    this.explodeParticles = null;
};

Letter.prototype.update = function() {
    if (this.phase === "waiting") {
        return;
    }
    
    if (this.phase === "firework") {
        if (this.tick >= this.spawnTime) {
            this.spawned = true;
        } else {
            this.tick++;
        }

        if (this.spawned) {
            this.y -= opts.baseSpeed + opts.addedSpeed;
            if (this.y < this.fireworkDy) {
                this.phase = "explode";
                this.explodeParticles = createParticles(this.x, this.y);
            }
        }
    } else if (this.phase === "explode") {
        let allDone = true;
        this.explodeParticles.forEach(particle => {
            particle.update();
            if (particle.alpha > 0) allDone = false;
        });
        
        if (allDone) {
            this.phase = "finished";
        }
    }
};

// Particle system for explosions
function Particle(x, y, hue) {
}

const text = "HAPPY BIRTHDAY, PEDRITO!! MAMA BICHO!!"; 
