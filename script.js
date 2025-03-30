const firebaseConfig = {
    apiKey: "AIzaSyC-A94fIOoRE9IsNTEf-7FIt8tTv--SOR8",
    authDomain: "jumpblock-e556f.firebaseapp.com",
    projectId: "jumpblock-e556f",
    storageBucket: "jumpblock-e556f.appspot.com",
    messagingSenderId: "368692536493",
    appId: "1:368692536493:web:3bde1d946435988a009224"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let player = {};
let obstacles = [];
let score = 0;
let gameRunning = false;
let userName = "";
let userCedula = "";

function startGame() {
    const nameInput = document.getElementById("name").value.trim();
    const cedulaInput = document.getElementById("cedula").value.trim();

    if (!nameInput || !cedulaInput) {
        alert("Por favor, completa tu nombre y número de cédula.");
        return;
    }

    userName = nameInput;
    userCedula = cedulaInput;

    document.getElementById("userForm").style.display = "none";
    initializeGame();
}

function initializeGame() {
    const canvas = document.getElementById("gameCanvas");
    const jumpButton = document.getElementById("jumpButton");
    const restartButton = document.getElementById("restartButton");
    const scoreText = document.getElementById("scoreText");

    canvas.style.display = "block";
    jumpButton.style.display = "block";
    restartButton.style.display = "block";
    scoreText.style.display = "block";

    // Adjust canvas size to fit screen
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.6;

    player = { x: 50, y: canvas.height - 50, width: 20, height: 20, velocityY: 0, jumping: false };
    obstacles = [{ x: canvas.width, y: canvas.height - 40, width: 20, height: 20 }];
    score = 0;
    gameRunning = true;
    gameLoop();
}

function jump() {
    if (!player.jumping) {
        player.velocityY = -8;
        player.jumping = true;
    }
}

function updateGame() {
    if (!gameRunning) return;

    const canvas = document.getElementById("gameCanvas");

    player.y += player.velocityY;
    player.velocityY += 0.5;
    if (player.y >= canvas.height - 50) {
        player.y = canvas.height - 50;
        player.jumping = false;
    }

    obstacles.forEach(obstacle => { obstacle.x -= 3; });
    if (obstacles[0].x < -20) {
        obstacles.shift();
        obstacles.push({ x: canvas.width, y: canvas.height - 40, width: 20, height: 20 });
        score++;
        document.getElementById("score").innerText = score;
    }

    if (obstacles.some(obstacle =>
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    )) {
        gameRunning = false;
        saveScore();
        alert(`¡Perdiste! Puntuación: ${score}`);
    }
}

function drawGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = "red";
    obstacles.forEach(obstacle => ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height));
}

function gameLoop() {
    updateGame();
    drawGame();
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function saveScore() {
    db.collection("scores").add({
        name: userName,
        cedula: userCedula,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function restartGame() {
    initializeGame();
}