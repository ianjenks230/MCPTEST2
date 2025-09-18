class PhysicsSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.bodies = [];
        this.paused = false;
        this.showTrails = true;
        this.showVectors = false;
        this.showGrid = false;
        this.G = 6.67430e-11; // Universal gravitational constant
        this.timeScale = 1;
        this.trails = new Map();
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupEventListeners();
        
        // Start animation loop
        this.animate();
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

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            startPos = this.getMousePos(e);
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
            this.spawnBody(startPos, endPos);
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    drawDragLine(start, end) {
        // Clear canvas and redraw all bodies
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
            x: (end.x - start.x) * 0.1,
            y: (end.y - start.y) * 0.1
        };

        let pos = { x: start.x, y: start.y };
        let vel = { ...velocity };
        
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        
        for (let i = 0; i < 20; i++) {
            // Simple physics prediction
            pos.x += vel.x;
            pos.y += vel.y;
            
            this.ctx.lineTo(pos.x, pos.y);
        }
        
        this.ctx.strokeStyle = 'rgba(124, 77, 255, 0.2)';
        this.ctx.stroke();
    }

    spawnBody(start, end) {
        const mass = parseFloat(document.getElementById('massSlider').value) * 1e24;
        const velocity = {
            x: (end.x - start.x) * 0.1,
            y: (end.y - start.y) * 0.1
        };

        this.bodies.push({
            x: start.x,
            y: start.y,
            vx: velocity.x,
            vy: velocity.y,
            mass: mass,
            radius: Math.log(mass) * 0.5,
            color: this.generateColor()
        });

        // Initialize trail for the new body
        this.trails.set(this.bodies.length - 1, []);
    }

    generateColor() {
        const hue = Math.random() * 360;
        return `hsl(${hue}, 70%, 70%)`;
    }

    updatePhysics() {
        if (this.paused) return;

        const dt = 0.016 * this.timeScale; // 60 FPS with time scaling

        // Update velocities based on gravitational forces
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];

                const dx = body2.x - body1.x;
                const dy = body2.y - body1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < body1.radius + body2.radius) {
                    // Handle collision
                    this.handleCollision(body1, body2);
                    continue;
                }

                const force = this.G * body1.mass * body2.mass / (distance * distance);
                const angle = Math.atan2(dy, dx);

                // Apply forces to both bodies
                const fx = force * Math.cos(angle);
                const fy = force * Math.sin(angle);

                body1.vx += fx / body1.mass * dt;
                body1.vy += fy / body1.mass * dt;
                body2.vx -= fx / body2.mass * dt;
                body2.vy -= fy / body2.mass * dt;
            }
        }

        // Update positions
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            body.x += body.vx * dt;
            body.y += body.vy * dt;

            // Update trails
            if (this.showTrails) {
                const trail = this.trails.get(i);
                trail.push({ x: body.x, y: body.y });
                if (trail.length > 50) trail.shift();
            }
        }
    }

    handleCollision(body1, body2) {
        // Implement elastic collision
        const normalX = body2.x - body1.x;
        const normalY = body2.y - body1.y;
        const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
        
        const unitNormalX = normalX / normalLength;
        const unitNormalY = normalY / normalLength;

        const relativeVelocityX = body1.vx - body2.vx;
        const relativeVelocityY = body1.vy - body2.vy;
        
        const velocityAlongNormal = relativeVelocityX * unitNormalX + relativeVelocityY * unitNormalY;

        // Only separate and bounce if objects are moving toward each other
        if (velocityAlongNormal > 0) return;

        const restitution = 0.8; // Coefficient of restitution
        const impulseStrength = -(1 + restitution) * velocityAlongNormal;
        const impulse = impulseStrength / (1/body1.mass + 1/body2.mass);

        body1.vx -= impulse * unitNormalX / body1.mass;
        body1.vy -= impulse * unitNormalY / body1.mass;
        body2.vx += impulse * unitNormalX / body2.mass;
        body2.vy += impulse * unitNormalY / body2.mass;
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 8, 25, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.showGrid) this.drawGrid();

        // Draw trails
        if (this.showTrails) {
            this.bodies.forEach((_, index) => {
                const trail = this.trails.get(index);
                if (!trail) return;

                this.ctx.beginPath();
                trail.forEach((pos, i) => {
                    if (i === 0) {
                        this.ctx.moveTo(pos.x, pos.y);
                    } else {
                        this.ctx.lineTo(pos.x, pos.y);
                    }
                });
                this.ctx.strokeStyle = `rgba(124, 77, 255, 0.3)`;
                this.ctx.stroke();
            });
        }

        // Draw bodies
        this.bodies.forEach(body => {
            this.ctx.beginPath();
            this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = body.color;
            this.ctx.fill();

            if (this.showVectors) {
                // Draw velocity vector
                this.ctx.beginPath();
                this.ctx.moveTo(body.x, body.y);
                this.ctx.lineTo(body.x + body.vx, body.y + body.vy);
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                this.ctx.stroke();
            }
        });
    }

    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(124, 77, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

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

    setGravityPreset(preset) {
        switch(preset) {
            case 'strong':
                this.G = 6.67430e-11 * 100;
                break;
            case 'weak':
                this.G = 6.67430e-11 * 0.01;
                break;
            default:
                this.G = 6.67430e-11;
        }
    }
}