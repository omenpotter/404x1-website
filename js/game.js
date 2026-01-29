// Game functionality
const gameOverlay = document.getElementById('gameOverlay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameCanvas = document.getElementById('gameCanvas');

// Game state
let gameState = {
    isPlaying: false,
    isPaused: false,
    level: '1-1',
    score: 0,
    kills: 0,
    deaths: 0,
    health: 100,
    time: 0,
    gameRP: 0
};

// Start game
if (startBtn) {
    startBtn.addEventListener('click', () => {
        gameOverlay.classList.add('hidden');
        startGame();
    });
}

function startGame() {
    gameState.isPlaying = true;
    gameState.isPaused = false;
    
    // Initialize canvas
    if (gameCanvas) {
        const ctx = gameCanvas.getContext('2d');
        gameCanvas.width = gameCanvas.offsetWidth;
        gameCanvas.height = gameCanvas.offsetHeight;
        
        // Draw placeholder game screen
        drawPlaceholder(ctx);
    }
    
    // Start game timer
    startGameTimer();
    
    // Update HUD
    updateHUD();
}

function drawPlaceholder(ctx) {
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(125, 255, 125, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x < gameCanvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameCanvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < gameCanvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameCanvas.width, y);
        ctx.stroke();
    }
    
    // Player placeholder
    ctx.fillStyle = '#7dff7d';
    ctx.fillRect(100, gameCanvas.height - 150, 40, 60);
    
    // Text
    ctx.font = '24px "Rubik Mono One"';
    ctx.fillStyle = '#7dff7d';
    ctx.textAlign = 'center';
    ctx.fillText('GAME ENGINE PLACEHOLDER', gameCanvas.width / 2, gameCanvas.height / 2);
    
    ctx.font = '16px "Share Tech Mono"';
    ctx.fillStyle = '#a8adb7';
    ctx.fillText('Connect Phaser.js game logic here', gameCanvas.width / 2, gameCanvas.height / 2 + 40);
    ctx.fillText('Controls: ← → MOVE | ↑ JUMP | SPACE SHOOT', gameCanvas.width / 2, gameCanvas.height / 2 + 70);
}

// Pause game
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        if (!gameState.isPlaying) return;
        
        gameState.isPaused = !gameState.isPaused;
        pauseBtn.textContent = gameState.isPaused ? '▶️ RESUME' : '⏸️ PAUSE';
        
        if (gameState.isPaused) {
            // Show pause overlay
            showPauseOverlay();
        } else {
            // Hide pause overlay
            gameOverlay.classList.add('hidden');
        }
    });
}

function showPauseOverlay() {
    gameOverlay.classList.remove('hidden');
    gameOverlay.querySelector('.overlay-content').innerHTML = `
        <h1 class="glitch" data-text="PAUSED">PAUSED</h1>
        <p class="game-description">Game is paused</p>
        <button class="start-btn" onclick="resumeGame()">
            <span>RESUME</span>
            <div class="button-glow"></div>
        </button>
    `;
}

function resumeGame() {
    gameState.isPaused = false;
    gameOverlay.classList.add('hidden');
    pauseBtn.textContent = '⏸️ PAUSE';
}

// Restart game
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        resetGame();
        startGame();
    });
}

function resetGame() {
    gameState = {
        isPlaying: false,
        isPaused: false,
        level: '1-1',
        score: 0,
        kills: 0,
        deaths: 0,
        health: 100,
        time: 0,
        gameRP: 0
    };
    updateHUD();
}

// Game timer
let timerInterval;

function startGameTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!gameState.isPaused && gameState.isPlaying) {
            gameState.time++;
            updateTimer();
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(gameState.time / 60);
    const seconds = gameState.time % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update HUD
function updateHUD() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('kills').textContent = gameState.kills;
    document.getElementById('deaths').textContent = gameState.deaths;
    document.getElementById('totalRP').textContent = getTotalRP();
    document.getElementById('gameRP').textContent = gameState.gameRP;
    document.getElementById('currentLevel').textContent = gameState.level;
    
    const healthPercent = (gameState.health / 100) * 100;
    document.getElementById('healthFill').style.width = `${healthPercent}%`;
}

function getTotalRP() {
    const chatRP = parseInt(localStorage.getItem('404x1_chat_rp') || '0');
    return chatRP + gameState.gameRP;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying) return;
    
    switch(e.key) {
        case 'Escape':
            if (pauseBtn) pauseBtn.click();
            break;
        case 'r':
        case 'R':
            if (restartBtn) restartBtn.click();
            break;
        case 'ArrowLeft':
            // Move left
            console.log('Move left');
            break;
        case 'ArrowRight':
            // Move right
            console.log('Move right');
            break;
        case 'ArrowUp':
            // Jump
            console.log('Jump');
            break;
        case ' ':
            // Shoot
            e.preventDefault();
            console.log('Shoot');
            break;
    }
});

// Simulate enemy kill (for testing)
function simulateKill(type = 'standard') {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    let rpGain = 0;
    let scoreGain = 0;
    
    switch(type) {
        case 'standard':
            rpGain = 0.1;
            scoreGain = 10;
            break;
        case 'elite':
            rpGain = 0.5;
            scoreGain = 50;
            break;
        case 'miniboss':
            rpGain = 1;
            scoreGain = 100;
            break;
        case 'boss':
            rpGain = 3;
            scoreGain = 500;
            break;
    }
    
    gameState.kills++;
    gameState.score += scoreGain;
    gameState.gameRP += rpGain;
    updateHUD();
}

// Simulate level completion
function completeLevel() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const baseRP = 3; // Level completion
    const noDeathBonus = gameState.deaths === 0 ? 2 : 0;
    const totalRP = baseRP + noDeathBonus;
    
    gameState.gameRP += totalRP;
    
    // Show completion overlay
    gameOverlay.classList.remove('hidden');
    gameOverlay.querySelector('.overlay-content').innerHTML = `
        <h1 class="glitch" data-text="LEVEL COMPLETE">LEVEL COMPLETE</h1>
        <p class="game-description">
            Score: ${gameState.score}<br>
            Kills: ${gameState.kills}<br>
            Deaths: ${gameState.deaths}<br>
            <span style="color: var(--accent-green)">RP Earned: +${totalRP}</span>
        </p>
        <button class="start-btn" onclick="nextLevel()">
            <span>NEXT LEVEL</span>
            <div class="button-glow"></div>
        </button>
    `;
}

function nextLevel() {
    // Move to next level
    const [world, level] = gameState.level.split('-').map(Number);
    if (level < 5) {
        gameState.level = `${world}-${level + 1}`;
    } else {
        gameState.level = `${world + 1}-1`;
    }
    
    resetGame();
    gameState.level = gameState.level; // Keep the new level
    startGame();
}

// Window resize
window.addEventListener('resize', () => {
    if (gameCanvas) {
        gameCanvas.width = gameCanvas.offsetWidth;
        gameCanvas.height = gameCanvas.offsetHeight;
        
        if (gameState.isPlaying) {
            const ctx = gameCanvas.getContext('2d');
            drawPlaceholder(ctx);
        }
    }
});

// Initialize
updateHUD();

// For testing - expose functions to console
window.testKill = simulateKill;
window.testComplete = completeLevel;

console.log('Game initialized. For testing:');
console.log('- testKill("standard") - Simulate standard enemy kill');
console.log('- testKill("elite") - Simulate elite enemy kill');
console.log('- testKill("boss") - Simulate boss kill');
console.log('- testComplete() - Complete current level');
