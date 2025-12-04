// Inisialisasi Canvas
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Inisialisasi Skor dan Nyawa
const scoreElement = document.getElementById('score');
let score = 0;
const livesElement = document.getElementById('lives');
let playerLives = 3;

// --- Objek Pemain (Player) ---
const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 7,
    color: 'blue',
    invincible: false
};

let frames = 0;

// Spawn musuh setiap 30 frame
const enemySpawnRate = 30;

// Gambar pemain
function drawPlayer() {
    let currentColor = player.color;

    if (player.invincible && frames % 10 < 5) {
        currentColor = 'cyan';
    }

    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height / 2);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.closePath();
    ctx.fill();
}

// Variabel kontrol
let rightPressed = false;
let leftPressed = false;
let shootPressed = false;
const rapidFireRate = 5;

// Input keyboard
document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (key === "ArrowRight" || key === "d" || key === "D") {
        rightPressed = true;
    }
    if (key === "ArrowLeft" || key === "a" || key === "A") {
        leftPressed = true;
    }

    // Perbaikan terbaru:
    if (e.code === "Space") {
        shootPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key;

    if (key === "ArrowRight" || key === "d" || key === "D") {
        rightPressed = false;
    }
    if (key === "ArrowLeft" || key === "a" || key === "A") {
        leftPressed = false;
    }

    if (e.code === "Space") {
        shootPressed = false;
    }
});

// Update pemain
function updatePlayer() {
    const halfWidth = player.width / 2;

    if (rightPressed && player.x < canvas.width - halfWidth) {
        player.x += player.speed;
    } 
    if (leftPressed && player.x > halfWidth) {
        player.x -= player.speed;
    }
}

// Peluru
const bullets = [];

function shoot() {
    bullets.push({
        x: player.x,
        y: player.y - player.height / 2,
        width: 4,
        height: 14,
        speed: 12,
        color: 'red'
    });
}

function updateAndDrawBullets() {
    for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];
        b.y -= b.speed;

        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);

        if (b.y < -20) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

// Musuh
const enemies = [];
const enemyWidth = 30;
const enemyHeight = 30;

function spawnEnemy() {
    const x = Math.random() * (canvas.width - enemyWidth) + enemyWidth / 2;

    enemies.push({
        x,
        y: -enemyHeight,
        width: enemyWidth,
        height: enemyHeight,
        speed: 2,
        color: 'green'
    });
}

function updateAndDrawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        e.y += e.speed;

        ctx.fillStyle = e.color;
        ctx.fillRect(e.x - e.width / 2, e.y, e.width, e.height);

        if (e.y > canvas.height - 40) {
            handleEnemyHitPlayer(i);
            return;
        }
    }
}

// Musuh kena pemain
function handleEnemyHitPlayer(enemyIndex) {
    enemies.splice(enemyIndex, 1);

    if (!player.invincible) {
        playerLives--;
        livesElement.textContent = "Lives: " + playerLives;

        if (playerLives <= 0) {
            alert("GAME OVER! Skor: " + score);
            location.reload();
        }

        player.invincible = true;
        setTimeout(() => player.invincible = false, 2000);
    }
}

// Cek tabrakan
function checkCollisions() {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            const b = bullets[i];
            const e = enemies[j];

            if (
                b.x < e.x + e.width / 2 &&
                b.x + b.width > e.x - e.width / 2 &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y
            ) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);

                score += 10;
                scoreElement.textContent = "Score: " + score;

                i--;
                break;
            }
        }
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (shootPressed && frames % rapidFireRate === 0) {
        shoot();
    }

    frames++;
    if (frames % enemySpawnRate === 0) {
        spawnEnemy();
    }

    updatePlayer();
    checkCollisions();

    drawPlayer();
    updateAndDrawBullets();
    updateAndDrawEnemies();

    requestAnimationFrame(gameLoop);
}

gameLoop();
