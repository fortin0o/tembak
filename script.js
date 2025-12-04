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

let frames = 0; // Penghitung frame global
const enemySpawnRate = 30; // ***DIUBAH: Musuh muncul setiap 30 frame (lebih banyak)***

// Menggambar pemain sebagai pesawat (segitiga)
function drawPlayer() {
    let currentColor = player.color;
    if (player.invincible && frames % 10 < 5) {
        currentColor = 'cyan';
    }

    ctx.fillStyle = currentColor;
    ctx.beginPath();
    
    // Titik A (Ujung depan Pesawat)
    ctx.moveTo(player.x, player.y - player.height / 2); 
    // Titik B (Sudut kiri belakang)
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2); 
    // Titik C (Sudut kanan belakang)
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2); 
    
    ctx.closePath();
    ctx.fill();
}

// Variabel Kontrol Gerakan
let rightPressed = false;
let leftPressed = false;
let shootPressed = false;
const rapidFireRate = 5; // Tembak 1 peluru setiap 5 frame (sangat cepat)

// --- Penanganan Input Keyboard ---
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Gerak Kanan: ArrowRight atau D
    if (key === 'right' || key === 'arrowright' || key === 'd') {
        rightPressed = true;
    // Gerak Kiri: ArrowLeft atau A
    } else if (key === 'left' || key === 'arrowleft' || key === 'a') {
        leftPressed = true;
    }
    
    // Tembak: Spasi
    if (key === ' ') { 
        shootPressed = true; // Aktifkan rapid fire
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();

    // Hentikan Gerakan
    if (key === 'right' || key === 'arrowright' || key === 'd') {
        rightPressed = false;
    } else if (key === 'left' || key === 'arrowleft' || key === 'a') {
        leftPressed = false;
    }

    // Hentikan Tembakan
    if (key === ' ') {
        shootPressed = false;
    }
});

function updatePlayer() {
    const halfWidth = player.width / 2;
    
    if (rightPressed && player.x < canvas.width - halfWidth) {
        player.x += player.speed;
    } else if (leftPressed && player.x > halfWidth) {
        player.x -= player.speed;
    }
}

// --- Peluru (Bullets) ---
const bullets = [];

function shoot() {
    const bullet = {
        x: player.x,
        y: player.y - player.height / 2,
        width: 4,
        height: 10,
        speed: 12,
        color: 'red'
    };
    bullets.push(bullet);
}

function updateAndDrawBullets() {
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        
        if (bullet.y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

// --- Musuh (Enemies) ---
const enemies = [];
const enemyWidth = 30;
const enemyHeight = 30;
const baseEnemySpeed = 1.5;

function spawnEnemy() {
    const x = Math.random() * (canvas.width - enemyWidth) + enemyWidth / 2;
    const enemy = {
        x: x,
        y: -enemyHeight, 
        width: enemyWidth,
        height: enemyHeight,
        speed: baseEnemySpeed,
        color: 'green'
    };
    enemies.push(enemy);
}

function updateAndDrawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;
        
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x - enemy.width / 2, enemy.y, enemy.width, enemy.height);
        
        // Cek Musuh mengenai Pemain (Game Over condition)
        if (enemy.y > canvas.height - enemy.height / 2) { 
            handleEnemyHitPlayer(i); 
            return;
        }
    }
}

function handleEnemyHitPlayer(enemyIndex) {
    enemies.splice(enemyIndex, 1);

    if (!player.invincible) {
        playerLives--;
        livesElement.textContent = 'Lives: ' + playerLives;

        if (playerLives <= 0) {
            alert('GAME OVER! Nyawa habis. Skor Akhir: ' + score);
            document.location.reload(); 
            return;
        }

        player.invincible = true;
        setTimeout(() => {
            player.invincible = false;
        }, 2000); 
    }
}

// --- Deteksi Tabrakan dan Skor ---
function checkCollisions() {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            const bullet = bullets[i];
            const enemy = enemies[j];

            if (bullet.x < enemy.x + enemy.width / 2 &&
                bullet.x + bullet.width > enemy.x - enemy.width / 2 &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                
                score += 10;
                scoreElement.textContent = 'Score: ' + score;
                
                i--;
                j--; 
                break; 
            }
        }
    }
}


// --- Loop Utama Game ---
function gameLoop() {
    // 1. Bersihkan layar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Tembakan Cepat (Rapid Fire)
    if (shootPressed && frames % rapidFireRate === 0) {
        shoot();
    }

    // 3. Spawn Musuh (Sekarang musuh lebih banyak)
    frames++;
    if (frames % enemySpawnRate === 0) { 
        spawnEnemy();
    }

    // 4. Perbarui posisi pemain dan cek tabrakan
    updatePlayer();
    checkCollisions();

    // 5. Gambar semua objek
    drawPlayer(); 
    updateAndDrawBullets();
    updateAndDrawEnemies();
    
    requestAnimationFrame(gameLoop);
}

// Mulai Game!
gameLoop();