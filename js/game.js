// Game constants
const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const GAME_SPEED = 150; // milliseconds between moves
const MAX_HISTORY = 10;
const MAX_HIGH_SCORES_DESKTOP = 10;
const MAX_HIGH_SCORES_MOBILE = 5;

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
let isMobileView = false;

// DOM elements
let scoreElement, finalScoreElement, gameOverScreen, startScreen;
let gameHistoryElement, gameHistoryMobileElement;
let highScoresElement, highScoresMobileElement;
let restartButton, startButton, eatSound, gameOverSound;
let upButton, downButton, leftButton, rightButton;

// Initialize the game
function init() {
    console.log("Initializing game...");
    
    // Display initialization status to user
    const statusMsg = document.createElement('div');
    statusMsg.textContent = "Game initializing...";
    statusMsg.style.position = "fixed";
    statusMsg.style.bottom = "10px";
    statusMsg.style.right = "10px";
    statusMsg.style.background = "rgba(0,0,0,0.7)";
    statusMsg.style.color = "white";
    statusMsg.style.padding = "5px 10px";
    statusMsg.style.borderRadius = "5px";
    statusMsg.style.zIndex = "9999";
    document.body.appendChild(statusMsg);
    
    setTimeout(() => {
        statusMsg.textContent = "Game initialized!";
        setTimeout(() => {
            document.body.removeChild(statusMsg);
        }, 2000);
    }, 1000);
    
    // Check if we're in mobile view
    checkDeviceType();
    
    // Initialize DOM elements
    scoreElement = document.getElementById('score');
    finalScoreElement = document.getElementById('finalScore');
    gameOverScreen = document.getElementById('gameOverScreen');
    startScreen = document.getElementById('startScreen');
    gameHistoryElement = document.getElementById('gameHistory');
    gameHistoryMobileElement = document.getElementById('gameHistoryMobile');
    highScoresElement = document.getElementById('highScores');
    highScoresMobileElement = document.getElementById('highScoresMobile');
    restartButton = document.getElementById('restartButton');
    startButton = document.getElementById('startButton');
    eatSound = document.getElementById('eatSound');
    gameOverSound = document.getElementById('gameOverSound');
    
    // Mobile control buttons
    upButton = document.getElementById('upButton');
    downButton = document.getElementById('downButton');
    leftButton = document.getElementById('leftButton');
    rightButton = document.getElementById('rightButton');
    
    // Check if all DOM elements are found
    if (!document.getElementById('gameCanvas')) console.error("gameCanvas not found");
    if (!scoreElement) console.error("scoreElement not found");
    if (!finalScoreElement) console.error("finalScoreElement not found");
    if (!gameOverScreen) console.error("gameOverScreen not found");
    if (!startScreen) console.error("startScreen not found");
    if (!gameHistoryElement) console.error("gameHistoryElement not found");
    if (!gameHistoryMobileElement) console.error("gameHistoryMobileElement not found");
    if (!highScoresElement) console.error("highScoresElement not found");
    if (!highScoresMobileElement) console.error("highScoresMobileElement not found");
    if (!restartButton) console.error("restartButton not found");
    if (!startButton) console.error("startButton not found");
    if (!upButton) console.error("upButton not found");
    if (!downButton) console.error("downButton not found");
    if (!leftButton) console.error("leftButton not found");
    if (!rightButton) console.error("rightButton not found");
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size based on container
    resizeCanvas();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
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

// Check device type and update view accordingly
function checkDeviceType() {
    isMobileView = window.innerWidth <= 1200;
    console.log("Device type:", isMobileView ? "Mobile/Tablet" : "Desktop");
}

// Handle window resize
function handleResize() {
    checkDeviceType();
    resizeCanvas();
    updateHighScoresDisplay();
}

// Handle mouse click for direction control
function handleMouseClick(e) {
    if (!gameRunning) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Get snake head position in canvas coordinates
    const cellSize = canvas.width / GRID_SIZE;
    const headX = snake[0].x * cellSize + cellSize / 2;
    const headY = snake[0].y * cellSize + cellSize / 2;
    
    // Calculate angle between mouse and snake head
    const angle = Math.atan2(mouseY - headY, mouseX - headX);
    
    // Convert angle to direction
    // Normalize angle to 0-360 degrees
    let degrees = angle * (180 / Math.PI);
    if (degrees < 0) degrees += 360;
    
    // Determine direction based on angle
    if (degrees >= 45 && degrees < 135) {
        changeDirection('down');
    } else if (degrees >= 135 && degrees < 225) {
        changeDirection('left');
    } else if (degrees >= 225 && degrees < 315) {
        changeDirection('up');
    } else {
        changeDirection('right');
    }
}

// Resize canvas to fit container
function resizeCanvas() {
    const gameArea = document.querySelector('.game-area');
    const size = Math.min(gameArea.clientWidth, gameArea.clientHeight);
    canvas.width = size;
    canvas.height = size;
    
    // Redraw if game is running
    if (gameRunning) {
        draw();
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection('right');
            break;
    }
}

// Change direction if valid
function changeDirection(newDirection) {
    // Prevent 180-degree turns
    if (
        (newDirection === 'up' && direction !== 'down') ||
        (newDirection === 'down' && direction !== 'up') ||
        (newDirection === 'left' && direction !== 'right') ||
        (newDirection === 'right' && direction !== 'left')
    ) {
        nextDirection = newDirection;
    }
}

// Start the game
function startGame() {
    // Hide screens
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'none';
    
    // Reset game state
    score = 0;
    scoreElement.textContent = score;
    direction = 'right';
    nextDirection = 'right';
    
    // Initialize snake
    snake = [];
    const center = Math.floor(GRID_SIZE / 2);
    
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({
            x: center - i,
            y: center
        });
    }
    
    // Spawn food
    spawnFood();
    
    // Start game loop
    gameRunning = true;
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

// Game loop
function gameLoop() {
    // Update direction
    direction = nextDirection;
    
    // Move snake
    moveSnake();
    
    // Check collisions
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Check if snake ate food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Don't remove tail (snake grows)
        score++;
        scoreElement.textContent = score;
        
        // Play eat sound
        eatSound.currentTime = 0;
        eatSound.play();
        
        // Spawn new food
        spawnFood();
    } else {
        // Remove tail
        snake.pop();
    }
    
    // Draw everything
    draw();
}

// Move snake
function moveSnake() {
    const head = { ...snake[0] };
    
    switch(direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // Wrap around
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;
    
    // Add new head
    snake.unshift(head);
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    
    // Check collision with self (skip head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Spawn food at random position
function spawnFood() {
    let newFood;
    let validPosition = false;
    
    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        
        // Check if food spawns on snake
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                validPosition = false;
                break;
            }
        }
    }
    
    food = newFood;
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate cell size
    const cellSize = canvas.width / GRID_SIZE;
    
    // Draw snake
    ctx.fillStyle = '#c41e3a'; // Apple red
    for (let segment of snake) {
        ctx.beginPath();
        ctx.arc(
            segment.x * cellSize + cellSize / 2,
            segment.y * cellSize + cellSize / 2,
            cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // Draw food
    ctx.fillStyle = '#c41e3a'; // Apple red
    ctx.beginPath();
    ctx.arc(
        food.x * cellSize + cellSize / 2,
        food.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Game over
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    
    // Play game over sound
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    
    // Update final score
    finalScoreElement.textContent = score;
    
    // Save game session
    saveGameSession();
    
    // Update high scores
    updateHighScores();
    
    // Show game over screen
    gameOverScreen.style.display = 'flex';
}

// Show start screen
function showStartScreen() {
    startScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
}

// Save game session
function saveGameSession() {
    const session = {
        score: score,
        date: new Date().toLocaleString()
    };
    
    gameHistory.unshift(session);
    
    // Keep only the last 10 games
    if (gameHistory.length > MAX_HISTORY) {
        gameHistory.pop();
    }
    
    // Save to local storage
    localStorage.setItem('appleChaseFrenzyHistory', JSON.stringify(gameHistory));
    
    // Update history display
    updateHistoryDisplay();
}

// Load game history from local storage
function loadGameHistory() {
    const savedHistory = localStorage.getItem('appleChaseFrenzyHistory');
    if (savedHistory) {
        gameHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

// Update history display
function updateHistoryDisplay() {
    gameHistoryElement.innerHTML = '';
    gameHistoryMobileElement.innerHTML = '';
    
    if (gameHistory.length === 0) {
        gameHistoryElement.innerHTML = '<p>No games played yet</p>';
        gameHistoryMobileElement.innerHTML = '<p>No games played yet</p>';
        return;
    }
    
    // Determine how many history items to display based on device type
    const maxHistory = isMobileView ? 5 : MAX_HISTORY;
    const historyToShow = Math.min(gameHistory.length, maxHistory);
    
    for (let i = 0; i < historyToShow; i++) {
        const session = gameHistory[i];
        const p = document.createElement('p');
        p.textContent = `Score: ${session.score} - ${session.date}`;
        gameHistoryElement.appendChild(p);
        
        const pMobile = document.createElement('p');
        pMobile.textContent = `Score: ${session.score} - ${session.date}`;
        gameHistoryMobileElement.appendChild(pMobile);
    }
}

// Load high scores from local storage
function loadHighScores() {
    const savedHighScores = localStorage.getItem('appleChaseFrenzyHighScores');
    if (savedHighScores) {
        highScores = JSON.parse(savedHighScores);
        updateHighScoresDisplay();
    }
}

// Update high scores
function updateHighScores() {
    // Add current score to high scores
    highScores.push({
        score: score,
        date: new Date().toLocaleString()
    });
    
    // Sort high scores in descending order
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep only the top scores based on device type
    const maxScores = isMobileView ? MAX_HIGH_SCORES_MOBILE : MAX_HIGH_SCORES_DESKTOP;
    if (highScores.length > maxScores) {
        highScores = highScores.slice(0, maxScores);
    }
    
    // Save to local storage
    localStorage.setItem('appleChaseFrenzyHighScores', JSON.stringify(highScores));
    
    // Update display
    updateHighScoresDisplay();
}

// Update high scores display
function updateHighScoresDisplay() {
    highScoresElement.innerHTML = '';
    highScoresMobileElement.innerHTML = '';
    
    if (highScores.length === 0) {
        highScoresElement.innerHTML = '<p>No high scores yet</p>';
        highScoresMobileElement.innerHTML = '<p>No high scores yet</p>';
        return;
    }
    
    // Determine how many scores to display based on device type
    const maxScores = isMobileView ? MAX_HIGH_SCORES_MOBILE : MAX_HIGH_SCORES_DESKTOP;
    const scoresToShow = Math.min(highScores.length, maxScores);
    
    for (let i = 0; i < scoresToShow; i++) {
        const score = highScores[i];
        const p = document.createElement('p');
        p.textContent = `#${i + 1}: ${score.score} - ${score.date}`;
        highScoresElement.appendChild(p);
        
        const pMobile = document.createElement('p');
        pMobile.textContent = `#${i + 1}: ${score.score} - ${score.date}`;
        highScoresMobileElement.appendChild(pMobile);
    }
}

// Update game history display
function updateGameHistoryDisplay() {
    gameHistoryElement.innerHTML = '';
    gameHistoryMobileElement.innerHTML = '';
    
    if (gameHistory.length === 0) {
        gameHistoryElement.innerHTML = '<p>No game history yet</p>';
        gameHistoryMobileElement.innerHTML = '<p>No game history yet</p>';
        return;
    }
    
    // Determine how many history items to display based on device type
    const maxHistory = isMobileView ? 5 : MAX_HISTORY;
    const historyToShow = Math.min(gameHistory.length, maxHistory);
    
    for (let i = 0; i < historyToShow; i++) {
        const game = gameHistory[i];
        const p = document.createElement('p');
        p.textContent = `Score: ${game.score} - ${game.date}`;
        gameHistoryElement.appendChild(p);
        
        const pMobile = document.createElement('p');
        pMobile.textContent = `Score: ${game.score} - ${game.date}`;
        gameHistoryMobileElement.appendChild(pMobile);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init); 