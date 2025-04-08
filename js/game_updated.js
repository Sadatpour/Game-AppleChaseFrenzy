// Game constants
const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const GAME_SPEED = 150; // milliseconds between moves
const MAX_HISTORY = 10;
const MAX_HIGH_SCORES = 5;

// Game variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameInterval;
let gameRunning = false;
let gameHistory = [];
let highScores = [];

// DOM elements
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const gameHistoryElement = document.getElementById('gameHistory');
const gameHistoryMobileElement = document.getElementById('gameHistoryMobile');
const highScoresElement = document.getElementById('highScores');
const highScoresMobileElement = document.getElementById('highScoresMobile');
const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

// Mobile control buttons
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size based on container
    resizeCanvas();
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('keydown', handleKeyPress);
    
    // Mouse controls
    canvas.addEventListener('click', handleMouseClick);
    
    // Mobile controls
    upButton.addEventListener('click', () => changeDirection('up'));
    downButton.addEventListener('click', () => changeDirection('down'));
    leftButton.addEventListener('click', () => changeDirection('left'));
    rightButton.addEventListener('click', () => changeDirection('right'));
    
    // Touch controls for swipe
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0) {
                changeDirection('right');
            } else {
                changeDirection('left');
            }
        } else {
            // Vertical swipe
            if (diffY > 0) {
                changeDirection('down');
            } else {
                changeDirection('up');
            }
        }
        
        e.preventDefault();
    }, false);
    
    // Button event listeners
    restartButton.addEventListener('click', startGame);
    startButton.addEventListener('click', startGame);
    
    // Load game history and high scores from local storage
    loadGameHistory();
    loadHighScores();
    
    // Show start screen
    showStartScreen();
}

// ... existing code ...

// Update history display
function updateHistoryDisplay() {
    gameHistoryElement.innerHTML = '';
    gameHistoryMobileElement.innerHTML = '';
    
    if (gameHistory.length === 0) {
        gameHistoryElement.innerHTML = '<p>No games played yet</p>';
        gameHistoryMobileElement.innerHTML = '<p>No games played yet</p>';
        return;
    }
    
    for (let i = 0; i < gameHistory.length; i++) {
        const session = gameHistory[i];
        const p = document.createElement('p');
        p.textContent = `Score: ${session.score} - ${session.date}`;
        gameHistoryElement.appendChild(p);
        
        const pMobile = document.createElement('p');
        pMobile.textContent = `Score: ${session.score} - ${session.date}`;
        gameHistoryMobileElement.appendChild(pMobile);
    }
}

// ... existing code ...

// Update high scores display
function updateHighScoresDisplay() {
    highScoresElement.innerHTML = '';
    highScoresMobileElement.innerHTML = '';
    
    if (highScores.length === 0) {
        highScoresElement.innerHTML = '<p>No high scores yet</p>';
        highScoresMobileElement.innerHTML = '<p>No high scores yet</p>';
        return;
    }
    
    for (let i = 0; i < highScores.length; i++) {
        const score = highScores[i];
        const p = document.createElement('p');
        p.textContent = `#${i + 1}: ${score.score} - ${score.date}`;
        highScoresElement.appendChild(p);
        
        const pMobile = document.createElement('p');
        pMobile.textContent = `#${i + 1}: ${score.score} - ${score.date}`;
        highScoresMobileElement.appendChild(pMobile);
    }
}

// ... existing code ... 