// Initialize simulation
const simulation = new PhysicsSimulation('simulationCanvas');

// UI Controls
document.getElementById('spawnBody').addEventListener('click', () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    simulation.spawnBody(
        { x: centerX, y: centerY },
        { x: centerX + 100, y: centerY }
    );
});

// Sliders
const massSlider = document.getElementById('massSlider');
const massValue = document.getElementById('massValue');
massSlider.addEventListener('input', () => {
    massValue.textContent = massSlider.value;
});

const velocitySlider = document.getElementById('velocitySlider');
const velocityValue = document.getElementById('velocityValue');
velocitySlider.addEventListener('input', () => {
    velocityValue.textContent = velocitySlider.value;
});

// Background Theme
document.getElementById('bgTheme').addEventListener('change', (e) => {
    const theme = e.target.value;
    document.body.className = theme;
});

// Gravity Presets
document.getElementById('gravityPreset').addEventListener('change', (e) => {
    simulation.setGravityPreset(e.target.value);
});

// Visualization Controls
document.getElementById('showTrails').addEventListener('change', (e) => {
    simulation.showTrails = e.target.checked;
    if (!e.target.checked) {
        simulation.trails.clear();
    }
});

document.getElementById('showVectors').addEventListener('change', (e) => {
    simulation.showVectors = e.target.checked;
});

document.getElementById('showGrid').addEventListener('change', (e) => {
    simulation.showGrid = e.target.checked;
});

// Simulation Controls
document.getElementById('pauseBtn').addEventListener('click', () => {
    simulation.togglePause();
    const btn = document.getElementById('pauseBtn');
    btn.innerHTML = simulation.paused ? 
        '<span class="icon">▶️</span> Resume' : 
        '<span class="icon">⏸</span> Pause';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    simulation.reset();
});

// Help Panel
const infoPanel = document.getElementById('infoPanel');
document.getElementById('helpBtn').addEventListener('click', () => {
    infoPanel.classList.remove('hidden');
});

document.getElementById('closeInfo').addEventListener('click', () => {
    infoPanel.classList.add('hidden');
});

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case ' ':
            simulation.togglePause();
            break;
        case 'r':
            simulation.reset();
            break;
        case 'h':
            infoPanel.classList.toggle('hidden');
            break;
        case 't':
            const trailsCheckbox = document.getElementById('showTrails');
            trailsCheckbox.checked = !trailsCheckbox.checked;
            simulation.showTrails = trailsCheckbox.checked;
            break;
        case 'v':
            const vectorsCheckbox = document.getElementById('showVectors');
            vectorsCheckbox.checked = !vectorsCheckbox.checked;
            simulation.showVectors = vectorsCheckbox.checked;
            break;
        case 'g':
            const gridCheckbox = document.getElementById('showGrid');
            gridCheckbox.checked = !gridCheckbox.checked;
            simulation.showGrid = gridCheckbox.checked;
            break;
    }
});