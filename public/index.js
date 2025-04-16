// Add error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    const debug = document.getElementById('debug');
    if (debug) {
        debug.textContent = `Runtime Error: ${msg} (Line: ${lineNo})`;
        debug.style.color = 'red';
    }
    console.error("Runtime Error:", msg, "at", url, lineNo, columnNo, error);
    return false;
};

// Canvas setup with error handling
try {
    const debug = document.getElementById('debug'); // Get debug element early
    if (!debug) console.error("Debug element not found!"); // Log if debug missing

    const canvas = document.getElementById('canvas');
    if (!canvas) throw new Error('Canvas element not found');
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    if (debug) debug.textContent = 'Context obtained. Initializing...';

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
    let calc = { totalWidth: 0, totalHeight: 0 };
    let w, h, hw, hh;
    let allExploded = false;
    let letters = [];
    let animationFrameId = null; // To track animation frame

    // Initialize the canvas and dimensions
    function initCanvas() {
        if (debug) debug.textContent = 'Running initCanvas...';
        canvas.width = w = window.innerWidth;
        canvas.height = h = window.innerHeight;
        hw = w / 2;
        hh = h / 2;
        
        ctx.font = opts.charSize + 'px Verdana';
        calc.totalWidth = w;
        calc.totalHeight = h;
        if (debug) debug.textContent = `Canvas resized: ${w}x${h}`;
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
        this.x = x; this.y = y; this.hue = hue;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
    }

    Particle.prototype.update = function() {
        this.x += this.vx; this.y += this.vy;
        this.vy += opts.gravity; this.alpha -= opts.fade;
    };

    function createParticles(x, y) {
        const particles = [];
        for (let i = 0; i < opts.particleCount; i++) {
            particles.push(new Particle(x, y, Math.random() * 360));
        }
        return particles;
    }

    const text = "HAPPY BIRTHDAY, PEDRITO!! MAMA BICHO!!"; 

    // Animation control functions
    function startNewRound() {
        if (debug) debug.textContent = 'Starting new round...';
        letters.forEach(letter => letter.reset());
        setTimeout(() => {
            letters.forEach(letter => { letter.phase = "firework"; });
            allExploded = false;
            if (debug) debug.textContent = 'New round fireworks launched.';
        }, opts.resetDelay);
    }

    function init() {
        try {
            if (debug) debug.textContent = 'Running init()...';
            initCanvas();
            const textWidth = ctx.measureText(text).width;
            const startX = (w - textWidth) / 2;
            
            letters = []; // Clear previous letters
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const x = startX + ctx.measureText(text.substring(0, i)).width;
                letters.push(new Letter(char, x, h - 50));
            }
            if (debug) debug.textContent = `Created ${letters.length} letters.`;
            
             // Test draw a simple rectangle
            ctx.fillStyle = 'blue';
            ctx.fillRect(10, 50, 50, 50); // Draw a blue square near the top-left
            if (debug) debug.textContent = 'Test rectangle drawn.';

            if (animationFrameId) cancelAnimationFrame(animationFrameId); // Cancel previous loop if any
            animate(); // Start the animation loop
            
            // Start first round after initial delay
            if (debug) debug.textContent = `Setting initial timeout (${opts.initialDelay}ms)...`;
            setTimeout(() => {
                 if (debug) debug.textContent = 'Initial timeout finished. Launching fireworks.';
                letters.forEach(letter => { letter.phase = "firework"; });
            }, opts.initialDelay);

        } catch (error) {
             if (debug) debug.textContent = `Init Error: ${error.message}`;
            console.error("Init Error:", error);
        }
    }

    // Animation loop function
    function animate() {
        try {
             // Add a check for context existence
            if (!ctx) {
                if (debug) debug.textContent = 'Animation stopped: Context lost.';
                console.error("Animation stopped: Context lost.");
                return; 
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, w, h);

            // Check if all letters have finished exploding
            if (!allExploded && letters.length > 0) {
                let allFinished = letters.every(letter => letter.phase === "finished");
                if (allFinished) {
                    allExploded = true;
                    startNewRound();
                }
            }

            letters.forEach(letter => {
                letter.update();
                
                // Draw letters in waiting or firework phase
                 if (letter.phase === "waiting" || letter.phase === "firework") {
                    ctx.fillStyle = letter.color;
                    ctx.fillText(letter.char, letter.x + letter.dx, letter.y + letter.dy);
                 } 
                 // Draw particles in explode phase
                 else if (letter.phase === "explode" && letter.explodeParticles) {
                    letter.explodeParticles.forEach(particle => {
                        if (particle.alpha > 0) {
                            ctx.fillStyle = `hsla(${particle.hue}, 80%, 50%, ${particle.alpha})`;
                            ctx.fillRect(particle.x, particle.y, 2, 2);
                        }
                    });
                }
            });

             animationFrameId = requestAnimationFrame(animate); // Request next frame
        } catch (error) {
            if (debug) debug.textContent = `Animation Frame Error: ${error.message}`;
            console.error("Animation Frame Error:", error);
            if (animationFrameId) cancelAnimationFrame(animationFrameId); // Stop loop on error
        }
    }

    // Handle window resize
    window.addEventListener('resize', init); // Call init on resize

    // Start the animation on load
    if (debug) debug.textContent = 'Adding load event listener...';
    window.addEventListener('load', () => {
        if (debug) debug.textContent = 'Load event fired. Calling init...';
        init();
    });
    if (debug) debug.textContent = 'Load event listener added.';

} catch (error) {
    const debug = document.getElementById('debug');
    if (debug) {
        debug.textContent = `Setup Error: ${error.message}`;
        debug.style.color = 'red';
    }
    console.error("Setup Error:", error);
} 
