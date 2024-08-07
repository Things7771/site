const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const mario = new Image();
mario.src = 'images/mario.png';  // You need to provide this image

const enemyImage = new Image();
enemyImage.src = 'images/enemy.png';  // You need to provide this image

const wallImage = new Image();
wallImage.src = 'images/wall.png';  // You need to provide this image

const luckyBlockImage = new Image();
luckyBlockImage.src = 'images/lucky-block.png';  // You need to provide this image

const coinImage = new Image();
coinImage.src = 'images/coin.png';  // You need to provide this image

// Mario properties
let marioX = 50;
let marioY = 50;
let marioWidth = 50;
let marioHeight = 50;
let marioSpeed = 5;
let marioVelocityY = 0;
let gravity = 0.25;
let isJumping = false;
const groundLevel = canvas.height - marioHeight;

// Wall properties
const walls = [
    { x: 350, y: 250, width: 250, height: 50 },
    { x: -300, y: 0, width: 50, height: 500 },
    { x: 1000, y: 0, width: 50, height: 500 },
    { x: 425, y: 50, width: 50, height: 50 },
    { x: 150, y: 250, width: 50, height: 50 }
];

// Enemy properties
const enemies = [
    { x: 300, y: 450, width: 50, height: 50, speed: 1, direction: 1 },
    { x: 375, y: 450, width: 50, height: 50, speed: 1, direction: 1 }
];

// Lucky Block properties
const luckyBlock = 
    { x: 150, y: 250, width: 50, height: 50, active: true }

// Coin properties
const coins = [
    { x: 900, y: 450, width: 30, height: 30, collected: false },
    { x: 850, y: 450, width: 30, height: 30, collected: false },
    { x: 800, y: 450, width: 30, height: 30, collected: false },
    { x: 900, y: 400, width: 30, height: 30, collected: false },
    { x: 850, y: 400, width: 30, height: 30, collected: false },
    { x: 800, y: 400, width: 30, height: 30, collected: false },
    { x: 900, y: 350, width: 30, height: 30, collected: false },
    { x: 850, y: 350, width: 30, height: 30, collected: false },
    { x: 800, y: 350, width: 30, height: 30, collected: false }
];

// Camera properties
let cameraX = 0;
const cameraY = 0;

// Score
let score = 0;

// Key press handling
let keys = {};
let isPaused = false;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'Escape') {
        isPaused = !isPaused;
    }
    if (e.key === 'r') {
        document.location='gameover.html';
    }
    if (e.key === 'q') {
        document.location='exitgame.html';
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Collision detection function
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game loop
function gameLoop() {
    if (!isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply gravity
        marioVelocityY += gravity;
        marioY += marioVelocityY;

        // Ground collision
        if (marioY > groundLevel) {
            marioY = groundLevel;
            marioVelocityY = 0;
            isJumping = false;
        }

        // Store previous position for collision detection
        let previousX = marioX;
        let previousY = marioY;

        // Update Mario position based on keys pressed
        if (keys['ArrowRight']) marioX += marioSpeed;
        if (keys['ArrowLeft']) marioX -= marioSpeed;
        if (keys['ArrowUp'] && !isJumping) {
            marioVelocityY = -10;
            isJumping = true;
        }

        // Check for collisions with walls
        for (let wall of walls) {
            if (isColliding({ x: marioX, y: marioY, width: marioWidth, height: marioHeight }, wall)) {
                // Revert to previous position if collision detected
                marioX = previousX;
                marioY = previousY;
                marioVelocityY = 0;
                break;
            }
        }

        // Update enemy positions
        for (let enemy of enemies) {
            enemy.x += enemy.speed * enemy.direction;
            if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
                enemy.direction *= -1;
            }

            // Check for collisions with Mario
            if (isColliding({ x: marioX, y: marioY, width: marioWidth, height: marioHeight }, enemy)) {
                document.location='gameover.html'
                break;
            }
        }

        // Check for collisions with the lucky block
        if (luckyBlock.active && isColliding({ x: marioX, y: marioY, width: marioWidth, height: marioHeight }, luckyBlock)) {
            luckyBlock.active = false;
            // Apply a boost or any other effect to Mario
            marioSpeed *= 2; // Double Mario's speed as an example
            setTimeout(() => {
                marioSpeed /= 2; // Revert back to original speed after 5 seconds
            }, 5000);
        }

        // Check for collisions with coins
        for (let coin of coins) {
            if (!coin.collected && isColliding({ x: marioX, y: marioY, width: marioWidth, height: marioHeight }, coin)) {
                coin.collected = true;
                score += 10; // Increment score by 10 for each coin collected
            }
        }

        // Update camera position to follow Mario
        cameraX = marioX - canvas.width / 2 + marioWidth / 2;

        // Draw Mario
        ctx.drawImage(mario, marioX - cameraX, marioY - cameraY, marioWidth, marioHeight);

        // Draw walls
        for (let wall of walls) {
            ctx.drawImage(wallImage, wall.x - cameraX, wall.y - cameraY, wall.width, wall.height);
        }

        // Draw enemies
        for (let enemy of enemies) {
            ctx.drawImage(enemyImage, enemy.x - cameraX, enemy.y - cameraY, enemy.width, enemy.height);
        }

        // Draw lucky block if active
        if (luckyBlock.active) {
            ctx.drawImage(luckyBlockImage, luckyBlock.x - cameraX, luckyBlock.y - cameraY, luckyBlock.width, luckyBlock.height);
        }

        // Draw coins if not collected
        for (let coin of coins) {
            if (!coin.collected) {
                ctx.drawImage(coinImage, coin.x - cameraX, coin.y - cameraY, coin.width, coin.height);
            }
        }

        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = '24px sans-serif';
        ctx.fillText('Score: ' + score, 10, 30);
    }

    // Show pause message
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    }

    requestAnimationFrame(gameLoop);
}

mario.onload = () => {
    gameLoop();
};