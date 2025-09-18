// Physics simulation class for particle physics playground
class PhysicsSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.bodies = [];
        this.paused = false;
        this.showTrails = true;
        this.showVectors = false;
        this.showGrid = false;
        this.gravity = 9.81;
        this.bounce = 0.8;
        this.airResistance = 0.02;
        this.restitution = 0.8;
        this.angularDamping = 0.1;
        this.enableSpin = true;
        this.enableCollision = true;
        this.trails = new Map();
        
        // Default particle properties
        this.defaultMass = 10;
        this.defaultVelocity = 5;
        
        // Initialize
        this.resizeCanvas();
        this.setupEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Start animation loop
        requestAnimationFrame(() => this.animate());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    setupEventListeners() {
        let isDragging = false;
        let startPos = { x: 0, y: 0 };

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click only
                isDragging = true;
                startPos = this.getMousePos(e);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const currentPos = this.getMousePos(e);
            this.drawDragLine(startPos, currentPos);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const endPos = this.getMousePos(e);
            this.spawnParticle(startPos, endPos);
        });

        // Stop dragging if mouse leaves canvas
        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            this.draw(); // Clear any drag line
        });

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            startPos = this.getTouchPos(e);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDragging) return;
            const currentPos = this.getTouchPos(e);
            this.drawDragLine(startPos, currentPos);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!isDragging) return;
            isDragging = false;
            const endPos = this.getTouchPos(e);
            this.spawnParticle(startPos, endPos);
        });

        // Stop dragging if touch leaves canvas
        this.canvas.addEventListener('touchcancel', () => {
            isDragging = false;
            this.draw(); // Clear any drag line
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    drawDragLine(start, end) {
        // Clear canvas and redraw all particles
        this.draw();
        
        // Draw drag line
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = 'rgba(124, 77, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw predicted trajectory
        this.drawTrajectoryPreview(start, end);
    }

    drawTrajectoryPreview(start, end) {
        const velocity = {
            x: (end.x - start.x) * 0.1 * this.defaultVelocity / 5,
            y: (end.y - start.y) * 0.1 * this.defaultVelocity / 5
        };

        let pos = { x: start.x, y: start.y };
        let vel = { ...velocity };
        
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        
        for (let i = 0; i < 20; i++) {
            vel.y += this.gravity;
            pos.x += vel.x;
            pos.y += vel.y;
            
            this.ctx.lineTo(pos.x, pos.y);
        }
        
        this.ctx.strokeStyle = 'rgba(124, 77, 255, 0.2)';
        this.ctx.stroke();
    }

    spawnParticle(start, end = null) {
        const velocity = end ? {
            x: (end.x - start.x) * 0.1 * this.defaultVelocity / 5,
            y: (end.y - start.y) * 0.1 * this.defaultVelocity / 5
        } : {
            x: (Math.random() - 0.5) * this.defaultVelocity,
            y: (Math.random() - 0.5) * this.defaultVelocity
        };

        const particle = {
            x: start.x,
            y: start.y,
            vx: velocity.x,
            vy: velocity.y,
            mass: this.defaultMass,
            radius: Math.sqrt(this.defaultMass) * 2,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };

        this.bodies.push(particle);
        this.trails.set(particle, []);
    }

    updatePhysics() {
        if (this.paused) return;

        // First pass: Update velocities based on collisions
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];

                // Calculate distance between particles
                const dx = body2.x - body1.x;
                const dy = body2.y - body1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Check for collision
                if (distance < body1.radius + body2.radius) {
                    // Calculate collision normal
                    const nx = dx / distance;
                    const ny = dy / distance;

                    // Calculate relative velocity
                    const relativeVelocityX = body2.vx - body1.vx;
                    const relativeVelocityY = body2.vy - body1.vy;
                    const relativeSpeed = relativeVelocityX * nx + relativeVelocityY * ny;

                    // Don't resolve if particles are moving apart
                    if (relativeSpeed > 0) continue;

                    // Calculate impulse
                    const restitution = this.bounce;
                    const impulse = -(1 + restitution) * relativeSpeed;
                    const totalMass = body1.mass + body2.mass;

                    // Apply impulse
                    body1.vx -= (impulse * nx * body2.mass) / totalMass;
                    body1.vy -= (impulse * ny * body2.mass) / totalMass;
                    body2.vx += (impulse * nx * body1.mass) / totalMass;
                    body2.vy += (impulse * ny * body1.mass) / totalMass;

                    // Separate particles to prevent sticking
                    const overlap = (body1.radius + body2.radius - distance) * 0.5;
                    body1.x -= overlap * nx;
                    body1.y -= overlap * ny;
                    body2.x += overlap * nx;
                    body2.y += overlap * ny;
                }
            }
        }

        // Second pass: Update positions and apply other forces
        this.bodies.forEach(body => {
            // Apply gravity
            body.vy += this.gravity;

            // Update position
            body.x += body.vx;
            body.y += body.vy;

            // Store trail
            if (this.showTrails) {
                const trail = this.trails.get(body);
                if (trail) {
                    trail.push({ x: body.x, y: body.y });
                    if (trail.length > 50) {
                        trail.shift();
                    }
                }
            }

            // Bounce off walls with energy loss
            if (body.x - body.radius < 0) {
                body.x = body.radius;
                body.vx = Math.abs(body.vx) * this.bounce;
            } else if (body.x + body.radius > this.canvas.width) {
                body.x = this.canvas.width - body.radius;
                body.vx = -Math.abs(body.vx) * this.bounce;
            }

            if (body.y - body.radius < 0) {
                body.y = body.radius;
                body.vy = Math.abs(body.vy) * this.bounce;
            } else if (body.y + body.radius > this.canvas.height) {
                body.y = this.canvas.height - body.radius;
                body.vy = -Math.abs(body.vy) * this.bounce;
            }
        });
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid if enabled
        if (this.showGrid) {
            this.drawGrid();
        }

        // Draw trails
        if (this.showTrails) {
            this.bodies.forEach(body => {
                const trail = this.trails.get(body);
                if (trail && trail.length > 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(trail[0].x, trail[0].y);
                    for (let i = 1; i < trail.length; i++) {
                        this.ctx.lineTo(trail[i].x, trail[i].y);
                    }
                    this.ctx.strokeStyle = body.color + '40';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            });
        }

        // Draw particles
        this.bodies.forEach(body => {
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = body.color;
            this.ctx.fill();

            // Draw velocity vector
            if (this.showVectors) {
                this.ctx.beginPath();
                this.ctx.moveTo(body.x, body.y);
                this.ctx.lineTo(
                    body.x + body.vx * 5,
                    body.y + body.vy * 5
                );
                this.ctx.strokeStyle = '#ffffff80';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }

    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(124, 77, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    animate() {
        this.updatePhysics();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    reset() {
        this.bodies = [];
        this.trails.clear();
    }

    togglePause() {
        this.paused = !this.paused;
    }

    setMass(mass) {
        this.defaultMass = mass;
    }

    setVelocity(velocity) {
        this.defaultVelocity = velocity;
    }

    setGravity(gravity) {
        this.gravity = gravity;
    }

    setBounce(bounce) {
        this.bounce = bounce;
    }
}