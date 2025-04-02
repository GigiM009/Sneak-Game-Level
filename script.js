<<<<<<< HEAD
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

// Caricare le immagini
const snakeImage = new Image();
snakeImage.src = "images/snake.png"; // Assicurati che il percorso sia corretto

const foodImage = new Image();
foodImage.src = "images/cibo.png"; // Assicurati che il percorso sia corretto

// Caricare i suoni
const foodSound = new Audio("sound/eating_minecraft.mp3");
const gameOverSound = new Audio("sound/game_over.mp3");
const backgroundMusic = new Audio("sound/fondo.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
backgroundMusic.play();
const victorySound = new Audio("sound/smash_victory.mp3");

// Variabili di gioco
let snake = [{ x: 200, y: 200 }];
let direction = "RIGHT";
let food = { x: 100, y: 100 };
let level = 1;
let score = 0;
let speed = 200;
let obstacles = [{ x: 100, y: 150 }, { x: 200, y: 250 }, { x: 300, y: 100 }];
let particles = [];
let powerUp = { x: 300, y: 200, active: false };

// Controlli della tastiera
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    const key = event.key.toLowerCase();
    if ((key === "arrowup" || key === "w") && direction !== "DOWN") direction = "UP";
    if ((key === "arrowdown" || key === "s") && direction !== "UP") direction = "DOWN";
    if ((key === "arrowleft" || key === "a") && direction !== "RIGHT") direction = "LEFT";
    if ((key === "arrowright" || key === "d") && direction !== "LEFT") direction = "RIGHT";
}

// Genera cibo casuale
function generateFood() {
    food.x = Math.floor(Math.random() * 20) * 20;
    food.y = Math.floor(Math.random() * 20) * 20;
}

// Disegna gli ostacoli
function drawObstacles() {
    ctx.fillStyle = "gray";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, 20, 20); // Usa quadrati per gli ostacoli
    });
}

// Disegna il power-up
function drawPowerUp() {
    if (powerUp.active) {
        ctx.fillStyle = "yellow";
        ctx.fillRect(powerUp.x, powerUp.y, 20, 20); // Disegna il power-up
    }
}

// Controlla quando il serpente mangia il power-up
function checkPowerUp() {
    if (snake[0].x === powerUp.x && snake[0].y === powerUp.y) {
        powerUp.active = false;
        speed *= 0.8; // Aumenta la velocità temporaneamente
        setTimeout(() => {
            speed /= 0.8; // Torna alla velocità normale dopo un breve periodo
        }, 5000); // Durata di 5 secondi
    }
}

// Crea particelle
function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            alpha: 1,
        });
    }
}

// Aggiorna particelle
function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.alpha -= 0.02;
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Disegna le particelle
function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 0, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Funzione per aggiungere la scia del serpente
let trail = [];
const trailLength = 5;

function addTrail(x, y) {
    trail.push({ x, y, alpha: 1.0 });
    if (trail.length > trailLength) {
        trail.shift();
    }
}

function drawTrail() {
    trail.forEach(t => {
        ctx.fillStyle = `rgba(255, 255, 0, ${t.alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
        ctx.fill();
        t.alpha -= 0.02;
    });
}

// Genera il cibo e la scia
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(foodImage, food.x, food.y, 20, 20);
    snake.forEach(segment => ctx.drawImage(snakeImage, segment.x, segment.y, 20, 20));

    // Disegna ostacoli, power-up, particelle, scia
    drawObstacles();
    drawPowerUp();
    drawParticles();
    drawTrail(); // Aggiungi scia
}

// Funzione di incremento del livello
function levelUp() {
    victorySound.play();
    level++;
    speed *= 0.9;
    document.getElementById("level").innerText = `Livello: ${level}`;
}

// Funzione per aggiornare il punteggio e il timer
let startTime = Date.now();

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").innerText = `Tempo: ${elapsedTime}s`;
}

// Funzione di aggiornamento del gioco
function update() {
    let head = { ...snake[0] };

    if (direction === "UP") head.y -= 20;
    if (direction === "DOWN") head.y += 20;
    if (direction === "LEFT") head.x -= 20;
    if (direction === "RIGHT") head.x += 20;

    addTrail(head.x, head.y); // Aggiungi scia

    // Controllo collisione con il cibo
    if (head.x === food.x && head.y === food.y) {
        foodSound.play();
        snake.unshift(food);
        generateFood();
        createParticles(food.x, food.y);

        // Aggiorna punteggio e livello
        score = snake.length - 1;
        document.getElementById("score").innerText = `Punteggio: ${score}`;

        // Livelli e velocità
        if (snake.length % 3 === 0) {
            levelUp();
        }
    } else {
        snake.pop();
    }

    // Controllo collisione con bordi
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }

    // Controllo collisione con il serpente stesso
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // Controllo collisione con ostacoli
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
            gameOver();
            return;
        }
    }

    // Aggiungi la nuova testa del serpente
    snake.unshift(head);

    // Controllo power-up
    checkPowerUp();
}

// Funzione di Game Over
function showGameOver() {
    ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Punteggio Finale: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
}

function gameOver() {
    gameOverSound.play();
    showGameOver();  // Mostra l'animazione di Game Over
    setTimeout(() => {
        alert("Game Over! Hai raggiunto il livello " + level);
        document.location.reload();
    }, 3000); // Aggiungi un ritardo di 3 secondi per permettere all'animazione di apparire
}

// Loop di gioco
function gameLoop() {
    update();
    draw();
    updateTimer();
    setTimeout(gameLoop, speed);
}

// Inizia il gioco
generateFood();
gameLoop();
=======
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

// Caricare le immagini
const snakeImage = new Image();
snakeImage.src = "images/snake.png"; // Assicurati che il percorso sia corretto

const foodImage = new Image();
foodImage.src = "images/cibo.png"; // Assicurati che il percorso sia corretto

// Caricare i suoni
const foodSound = new Audio("sound/eating_minecraft.mp3");
const gameOverSound = new Audio("sound/game_over.mp3");
const backgroundMusic = new Audio("sound/fondo.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
backgroundMusic.play();
const victorySound = new Audio("sound/smash_victory.mp3");

// Variabili di gioco
let snake = [{ x: 200, y: 200 }];
let direction = "RIGHT";
let food = { x: 100, y: 100 };
let level = 1;
let score = 0;
let speed = 200;
let obstacles = [{ x: 100, y: 150 }, { x: 200, y: 250 }, { x: 300, y: 100 }];
let particles = [];
let powerUp = { x: 300, y: 200, active: false };

// Controlli della tastiera
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    const key = event.key.toLowerCase();
    if ((key === "arrowup" || key === "w") && direction !== "DOWN") direction = "UP";
    if ((key === "arrowdown" || key === "s") && direction !== "UP") direction = "DOWN";
    if ((key === "arrowleft" || key === "a") && direction !== "RIGHT") direction = "LEFT";
    if ((key === "arrowright" || key === "d") && direction !== "LEFT") direction = "RIGHT";
}

// Genera cibo casuale
function generateFood() {
    food.x = Math.floor(Math.random() * 20) * 20;
    food.y = Math.floor(Math.random() * 20) * 20;
}

// Disegna gli ostacoli
function drawObstacles() {
    ctx.fillStyle = "gray";
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, 20, 20); // Usa quadrati per gli ostacoli
    });
}

// Disegna il power-up
function drawPowerUp() {
    if (powerUp.active) {
        ctx.fillStyle = "yellow";
        ctx.fillRect(powerUp.x, powerUp.y, 20, 20); // Disegna il power-up
    }
}

// Controlla quando il serpente mangia il power-up
function checkPowerUp() {
    if (snake[0].x === powerUp.x && snake[0].y === powerUp.y) {
        powerUp.active = false;
        speed *= 0.8; // Aumenta la velocità temporaneamente
        setTimeout(() => {
            speed /= 0.8; // Torna alla velocità normale dopo un breve periodo
        }, 5000); // Durata di 5 secondi
    }
}

// Crea particelle
function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            alpha: 1,
        });
    }
}

// Aggiorna particelle
function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.alpha -= 0.02;
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Disegna le particelle
function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 0, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Funzione per aggiungere la scia del serpente
let trail = [];
const trailLength = 5;

function addTrail(x, y) {
    trail.push({ x, y, alpha: 1.0 });
    if (trail.length > trailLength) {
        trail.shift();
    }
}

function drawTrail() {
    trail.forEach(t => {
        ctx.fillStyle = `rgba(255, 255, 0, ${t.alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
        ctx.fill();
        t.alpha -= 0.02;
    });
}

// Genera il cibo e la scia
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(foodImage, food.x, food.y, 20, 20);
    snake.forEach(segment => ctx.drawImage(snakeImage, segment.x, segment.y, 20, 20));

    // Disegna ostacoli, power-up, particelle, scia
    drawObstacles();
    drawPowerUp();
    drawParticles();
    drawTrail(); // Aggiungi scia
}

// Funzione di incremento del livello
function levelUp() {
    victorySound.play();
    level++;
    speed *= 0.9;
    document.getElementById("level").innerText = `Livello: ${level}`;
}

// Funzione per aggiornare il punteggio e il timer
let startTime = Date.now();

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").innerText = `Tempo: ${elapsedTime}s`;
}

// Funzione di aggiornamento del gioco
function update() {
    let head = { ...snake[0] };

    if (direction === "UP") head.y -= 20;
    if (direction === "DOWN") head.y += 20;
    if (direction === "LEFT") head.x -= 20;
    if (direction === "RIGHT") head.x += 20;

    addTrail(head.x, head.y); // Aggiungi scia

    // Controllo collisione con il cibo
    if (head.x === food.x && head.y === food.y) {
        foodSound.play();
        snake.unshift(food);
        generateFood();
        createParticles(food.x, food.y);

        // Aggiorna punteggio e livello
        score = snake.length - 1;
        document.getElementById("score").innerText = `Punteggio: ${score}`;

        // Livelli e velocità
        if (snake.length % 3 === 0) {
            levelUp();
        }
    } else {
        snake.pop();
    }

    // Controllo collisione con bordi
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }

    // Controllo collisione con il serpente stesso
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // Controllo collisione con ostacoli
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
            gameOver();
            return;
        }
    }

    // Aggiungi la nuova testa del serpente
    snake.unshift(head);

    // Controllo power-up
    checkPowerUp();
}

// Funzione di Game Over
function showGameOver() {
    ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Punteggio Finale: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
}

function gameOver() {
    gameOverSound.play();
    showGameOver();  // Mostra l'animazione di Game Over
    setTimeout(() => {
        alert("Game Over! Hai raggiunto il livello " + level);
        document.location.reload();
    }, 3000); // Aggiungi un ritardo di 3 secondi per permettere all'animazione di apparire
}

// Loop di gioco
function gameLoop() {
    update();
    draw();
    updateTimer();
    setTimeout(gameLoop, speed);
}

// Inizia il gioco
generateFood();
gameLoop();
>>>>>>> bbfe5e4 (Prima versione del gioco)
