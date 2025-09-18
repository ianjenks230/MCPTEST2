// Initialize simulation
const simulation = new PhysicsSimulation('simulationCanvas');

// UI Controls
document.getElementById('spawnBody').addEventListener('click', () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    simulation.spawnParticle({ x: centerX, y: centerY });
});

document.getElementById('resetBtn').addEventListener('click', () => {
    simulation.reset();
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    simulation.togglePause();
    const btn = document.getElementById('pauseBtn');
    btn.innerHTML = simulation.paused ? 
        '<span class="icon">▶️</span> Resume' : 
        '<span class="icon">⏸</span> Pause';
});

// Slider Controls
const massSlider = document.getElementById('massSlider');
const massValue = document.getElementById('massValue');
if (massSlider && massValue) {
    massSlider.addEventListener('input', () => {
        const value = parseInt(massSlider.value);
        massValue.textContent = value;
        simulation.setMass(value);
    });
}

const velocitySlider = document.getElementById('velocitySlider');
const velocityValue = document.getElementById('velocityValue');
if (velocitySlider && velocityValue) {
    velocitySlider.addEventListener('input', () => {
        const value = parseInt(velocitySlider.value);
        velocityValue.textContent = value;
        simulation.setVelocity(value);
    });
}

// Visualization Controls
const showTrailsCheckbox = document.getElementById('showTrails');
if (showTrailsCheckbox) {
    showTrailsCheckbox.addEventListener('change', () => {
        simulation.showTrails = showTrailsCheckbox.checked;
        if (!showTrailsCheckbox.checked) {
            simulation.trails.clear();
        }
    });
}

const showVectorsCheckbox = document.getElementById('showVectors');
if (showVectorsCheckbox) {
    showVectorsCheckbox.addEventListener('change', () => {
        simulation.showVectors = showVectorsCheckbox.checked;
    });
}

const showGridCheckbox = document.getElementById('showGrid');
if (showGridCheckbox) {
    showGridCheckbox.addEventListener('change', () => {
        simulation.showGrid = showGridCheckbox.checked;
    });
}

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case ' ':
            simulation.togglePause();
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) {
                pauseBtn.innerHTML = simulation.paused ? 
                    '<span class="icon">▶️</span> Resume' : 
                    '<span class="icon">⏸</span> Pause';
            }
            break;
        case 'r':
            simulation.reset();
            break;
        case 't':
            if (showTrailsCheckbox) {
                showTrailsCheckbox.checked = !showTrailsCheckbox.checked;
                simulation.showTrails = showTrailsCheckbox.checked;
            }
            break;
        case 'v':
            if (showVectorsCheckbox) {
                showVectorsCheckbox.checked = !showVectorsCheckbox.checked;
                simulation.showVectors = showVectorsCheckbox.checked;
            }
            break;
        case 'g':
            if (showGridCheckbox) {
                showGridCheckbox.checked = !showGridCheckbox.checked;
                simulation.showGrid = showGridCheckbox.checked;
            }
            break;
    }
});
            gridCheckbox.checked = !gridCheckbox.checked;
            simulation.showGrid = gridCheckbox.checked;
            break;
    }
});