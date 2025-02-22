            // Configuración de los canvas
            const backgroundCanvas = document.getElementById("backgroundCanvas");
            const gameCanvas = document.getElementById("gameCanvas");
            const ctxBackground = backgroundCanvas.getContext("2d");
            const ctx = gameCanvas.getContext("2d");

            // Lista de imágenes para los enemigos
            const enemyImages = [
            	"enemigo1.png", // Ruta de la imagen 1
            	"enemigo2.png", // Ruta de la imagen 2
            	"enemigo3.png", // Ruta de la imagen 3
            	"enemigo4.png" // Ruta de la imagen 4
            ];
            backgroundCanvas.width = gameCanvas.width = window.innerWidth;
            backgroundCanvas.height = gameCanvas.height = window.innerHeight;
            let isExploding = false; // Indica si el personaje está en estado de explosión

            // Variables del juego
            let tapScore = 0;
            let coinScore = 0;
            let distanceScore = 0;
            let challengeScore = 0;
            let totalScore = 0;
            let isGameOver = false;

            // Variables para el fondo
            const backgroundImage = new Image();
            backgroundImage.src = "background.png"; // Imagen del fondo
            let backgroundX = 0;
            let backgroundSpeed = 1;
            let hue = 0;

            // Variables para la cuenta atrás
            let countdown = 3;
            let isCountdownActive = true;
            let countdownScale = 1;
            let countdownOpacity = 1;

            let isTransitioning = false; // Indica si estamos en la transición de nivel
            let backgroundSpeedNormal = 1; // Velocidad normal del fondo
            let backgroundSpeedFast = 25; // Velocidad rápida del fondo durante la transición
            
            const gameChallenges = [
    {
        id: 1,
        description: "Recolecta 25 monedas o más",
        type: "collect_coins", // Tipo de reto
        target: 25, // Objetivo del reto
        progress: 0, // Progreso actual
        completed: false // Si el reto está completado
    },
    {
        id: 2,
        description: "Recorre una distancia de 5000 o más",
        type: "distance", // Tipo de reto
        target: 5000, // Objetivo del reto
        progress: 0, // Progreso actual
        completed: false // Si el reto está completado
    },
    {
        id: 3,
        description: "Juega durante 2 minutos seguidos",
        type: "play_time", // Tipo de reto
        target: 120, // Objetivo del reto en segundos
        progress: 0, // Progreso actual
        completed: false // Si el reto está completado
    },
    {
        id: 4,
        description: "Esquiva 50 enemigos",
        type: "enemies_defeated", // Tipo de reto
        target: 50, // Objetivo del reto en segundos
        progress: 0, // Progreso actual
        completed: false // Si el reto está completado
    }
];

            // Cargar imágenes del juego
            const dogImage = new Image();
            dogImage.src = "DogizenRocket.png";

            const enemyImage = new Image();
            enemyImage.src = "enemigo2.png";

            const coinImage = new Image();
            coinImage.src = "DogizenCoin.png";

            const explosionImage = new Image();
            explosionImage.src = "explosion.png"; // Imagen de la explosión

            // Dibujar el fondo desplazándose infinitamente
            function drawBackground() {
            	ctxBackground.filter = `hue-rotate(${hue}deg)`; // Cambiar el tono del fondo
            	hue += 0.05; //0.1
            	if (hue >= 360) hue = 0;

            	ctxBackground.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

            	ctxBackground.drawImage(backgroundImage, backgroundX, 0, backgroundCanvas.width, backgroundCanvas.height);
            	ctxBackground.drawImage(backgroundImage, backgroundX + backgroundCanvas.width, 0, backgroundCanvas.width, backgroundCanvas.height);

            	backgroundX -= backgroundSpeed;
            	if (backgroundX <= -backgroundCanvas.width) {
            		backgroundX = 0; // Reiniciar la posición del fondo
            	}

            	ctxBackground.filter = "none"; // Restablecer el filtro
            }

            const enemies = [];

            function createEnemy() {
            	const enemyY = (Math.random() * (gameCanvas.height - 150)) + 50; // Posición aleatoria
            	// Seleccionar un gráfico aleatorio para el enemigo
                const randomGraphic = enemyImages[Math.floor(Math.random() * enemyImages.length)];

            	enemies.push({
            		x: gameCanvas.width,
            		y: enemyY,
            		width: 60,
            		height: 60,
            		image: randomGraphic // Gráfico asignado al enemigo
            	});
            }

            function updateEnemies() {
            	for (let i = 0; i < enemies.length; i++) {
            		const enemy = enemies[i];
            		enemy.x -= 2; // Mover hacia la izquierda

            		// Detectar colisión con el jugador
            		if (
            			dogRocket.x < enemy.x + enemy.width &&
            			dogRocket.x + dogRocket.width > enemy.x &&
            			dogRocket.y < enemy.y + enemy.height &&
            			dogRocket.y + dogRocket.height > enemy.y
            		) {
            			// Activar el estado de explosión
            			isExploding = true;
            			createExplosion(dogRocket.x, dogRocket.y); // Crear explosión
            			// Detener el juego después de un breve retraso para mostrar la explosión
            			setTimeout(() => {
            				if (!isGameOver) {
            					gameOver();
            				}
            			}, 500); // Esperar 500ms para que la explosión sea visible
            			return; // Salir de la función para evitar más actualizaciones
            		}

            		// Eliminar enemigos fuera del canvas
            		if (enemy.x + enemy.width < 0) {
            			enemies.splice(i, 1);
            			i--;
            			// Actualizamos el reto
            			updateChallenges("enemies_defeated");
            		}
            	}
            }

            function drawEnemies() {
            	for (const enemy of enemies) {
            	    const img = new Image();
        img.src = enemy.image; // Cargar el gráfico del enemigo
            		ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
            	}
            }

            const coins = [];

            function createCoin() {
            	coins.push({
            		x: gameCanvas.width,
            		y: (Math.random() * (gameCanvas.height - 150)) + 50,
            		width: 25,
            		height: 25
            	});
            }

            function updateCoins() {
            	for (let i = 0; i < coins.length; i++) {
            		const coin = coins[i];
            		coin.x -= 2; // Mover la moneda hacia la izquierda

            		// Detectar colisión con el jugador
            		if (
            			dogRocket.x < coin.x + coin.width &&
            			dogRocket.x + dogRocket.width > coin.x &&
            			dogRocket.y < coin.y + coin.height &&
            			dogRocket.y + dogRocket.height > coin.y
            		) {
            			coinScore++; // Incrementar la puntuación de monedas
            			createParticles(coin.x + coin.width / 2, coin.y + coin.height / 2); // Crear partículas en la posición de la moneda
            			coins.splice(i, 1);
            			i--;
            			updateScoreboard();
                        updateChallenges("collect_coins");
                        
            			// Iniciar transición al recoger 10 monedas
            			if (coinScore % 10 == 0 && coinScore > 0) {
            				startTransition();
            			}
            		}

            		// Eliminar monedas fuera del canvas
            		if (coin.x + coin.width < 0) {
            			coins.splice(i, 1);
            			i--;
            		}
            	}
            }

            function drawCoins() {
            	for (const coin of coins) {
            		ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
            	}
            }

            const dogRocket = {
            	x: gameCanvas.width / 6,
            	y: gameCanvas.height / 2,
            	width: 50,
            	height: 50,
            	dy: 0,
            	jump: -7,
            	gravity: 0.5,
            	draw() {
            		if (!isExploding) {
            			ctx.drawImage(dogImage, this.x, this.y, this.width, this.height);
            		}
            	},
            	update() {
            		if (!isExploding) {
            			this.dy += this.gravity; // Aplicar gravedad
            			this.y += this.dy; // Actualizar la posición vertical

            			// Evitar que salga del canvas
            			if (this.y + this.height > gameCanvas.height || this.y < 0) {
            				if (!isGameOver) {
            					gameOver();
            				}
            			}
            		}
            	}
            };

            // Manejar el salto
            gameCanvas.addEventListener("click", () => {
            	if (!isGameOver && !isCountdownActive) {
            		dogRocket.dy = dogRocket.jump;
            		tapScore++;
            		updateScoreboard();
            	}
            });

            // Dibujar la cuenta atrás con animaciones
            function drawCountdown() {
            	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height); // Limpiar el canvas principal

            	ctx.font = "90px Arial";
            	ctx.fillStyle = `rgba(255, 255, 255, ${countdownOpacity})`; // Aplicar opacidad al texto
            	ctx.textAlign = "center";

            	const text = countdown > 0 ? countdown : "TAP!"; // Mostrar el número o "TAP!"
            	ctx.save(); // Guardar el estado del contexto
            	ctx.translate(gameCanvas.width / 2, gameCanvas.height / 2); // Mover el origen al centro del canvas
            	ctx.scale(countdownScale, countdownScale); // Aplicar la escala
            	ctx.fillText(text, 0, 0); // Dibujar el texto en el centro
            	ctx.restore(); // Restaurar el estado del contexto
            }

            // Animar la cuenta atrás
            function animateCountdown() {
            	const animationInterval = setInterval(() => {
            		countdownScale -= 0.05; // Reducir la escala del texto
            		countdownOpacity -= 0.05; // Reducir la opacidad del texto

            		// Si la escala y la opacidad llegan a 0, pasar al siguiente número
            		if (countdownScale <= 0) {
            			countdown--; // Reducir el número de la cuenta atrás
            			countdownScale = 1; // Reiniciar la escala
            			countdownOpacity = 1; // Reiniciar la opacidad

            			// Si la cuenta atrás termina, iniciar el juego
            			if (countdown < 0) {
            				clearInterval(animationInterval); // Detener la animación
            				isCountdownActive = false; // Desactivar la cuenta atrás
            				// Iniciar la generación de monedas y enemigos
            				resumeGame();
            				gameLoop(); // Iniciar el juego
            			}
            		}

            		drawCountdown(); // Dibujar el número actual con la animación
            	}, 50); // Actualizar la animación cada 50ms
            }

            // Bucle principal del juego
            function gameLoop() {
            	if (isGameOver) return; // Detener el bucle si el juego ha terminado

            	if (!isCountdownActive) {
            		ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height); // Limpiar el canvas principal

            		drawBackground(); // Dibujar el fondo dinámico

            		dogRocket.update(); // Actualizar el personaje
            		dogRocket.draw(); // Dibujar el personaje

            		updateEnemies(); // Actualizar los enemigos
            		drawEnemies(); // Dibujar los enemigos

            		updateCoins(); // Actualizar las monedas
            		drawCoins(); // Dibujar las monedas

            		updateParticles(); // Actualizar las partículas
            		drawParticles(); // Dibujar las partículas

            		updateDistance(); // Actualizar la distancia recorrida
            	}

            	requestAnimationFrame(gameLoop); // Continuar el bucle
            }

            // Actualizar el marcador (UI)
            function updateScoreboard() {
            	document.getElementById("tapScore").textContent = tapScore; // Actualizar los toques
            	document.getElementById("coinScore").textContent = coinScore; // Actualizar las monedas
            	document.getElementById("distanceScore").textContent = distanceScore; // Actualizar la distancia
            	totalScore = tapScore + coinScore * 10 + distanceScore + challengeScore; // Calcular la puntuación total
            	document.getElementById("totalScore").textContent = totalScore; // Actualizar la puntuación total
            }

            // Actualizar la distancia recorrida
            function updateDistance() {
            	if (!isGameOver && !isCountdownActive) {
            		distanceScore++; // Incrementar la distancia recorrida
            		updateScoreboard(); // Actualizar el marcador
            		updateChallenges("distance");
            	}
            }

            // Fin del juego
            function gameOver() {
            	isGameOver = true; // Cambiar el estado del juego a "terminado"
            	alert(`¡Game Over! Tu puntuación total es: ${totalScore}`); // Mostrar mensaje de fin del juego
            	document.location.reload(); // Recargar la página para reiniciar el juego
            }

            const particles = [];

            function createParticles(x, y) {
            	for (let i = 0; i < 10; i++) {
            		particles.push({
            			x: x,
            			y: y,
            			dx: (Math.random() - 0.5) * 2,
            			dy: (Math.random() - 0.5) * 2,
            			size: Math.random() * 5 + 2,
            			life: 50
            		});
            	}
            }

            function updateParticles() {
            	for (let i = 0; i < particles.length; i++) {
            		const p = particles[i];
            		p.x += p.dx;
            		p.y += p.dy;
            		p.life--;

            		// Eliminar partículas cuando su vida llega a 0
            		if (p.life <= 0) {
            			particles.splice(i, 1);
            			i--;
            		}
            	}
            }

            function drawParticles() {
            	for (const p of particles) {
            		ctx.fillStyle = "gold";
            		ctx.beginPath();
            		ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            		ctx.fill();
            	}
            }

            // Explosión al chocar con un enemigo
            function createExplosion(x, y) {
            	ctx.drawImage(explosionImage, x - 20, y - 20, 80, 80);
            }

            // Iniciar el juego con la cuenta atrás animada
            animateCountdown();

            function startTransition() {
            	if (isTransitioning) return; // Evitar múltiples transiciones al mismo tiempo
            	isTransitioning = true;

            	// Detener la generación de monedas y enemigos
            	clearInterval(coinInterval); // Detener creación de monedas
            	clearInterval(enemyInterval); // Detener creación de enemigos

            	// Esperar a que no haya monedas ni enemigos en el canvas
            	const checkClearCanvas = setInterval(() => {
            		if (coins.length === 0 && enemies.length === 0) {
            			clearInterval(checkClearCanvas);

            			// Aumentar la velocidad del fondo durante la transición
            			backgroundSpeed = backgroundSpeedFast;

            			// Mantener la velocidad rápida por 2 segundos
            			setTimeout(() => {
            				// Aumentamos la velocidad del juego
            				backgroundSpeedNormal >= 10 ? 10 : backgroundSpeedNormal+=2;
            				// Restablecer la velocidad normal del fondo
            				backgroundSpeed = backgroundSpeedNormal;

            				// Reanudar la generación de monedas y enemigos
            				resumeGame();

            				isTransitioning = false; // Finalizar la transición
            			}, 2000); // Duración de la transición
            		}
            	}, 100); // Comprobar cada 100ms si el canvas está vacío
            }

            let coinInterval, enemyInterval, playTime = 0;
            function resumeGame() {
            	// Reanudar la creación de monedas
            	coinInterval = setInterval(() => {
            		if (!isGameOver && !isCountdownActive) {
            			createCoin();
            		}
            	}, 3000); // Cada 3 segundos

            	// Reanudar la creación de enemigos
            	enemyInterval = setInterval(() => {
            		if (!isGameOver && !isCountdownActive) {
            			createEnemy();
            		}
            	}, 2000); // Cada 2 segundos
            	
            	resetgameChallenges();
            	
setInterval(() => {
    playTime++;
    updateChallenges("play_time", 1); // Incrementar el progreso del reto de tiempo
}, 1000);
            }

            function showMessage(text) {
            	const messageContainer = document.getElementById("messageContainer");
            	const message = document.createElement("div");
            	message.className = "message";
            	message.textContent = text;

            	messageContainer.appendChild(message);

            	// Eliminar el mensaje después de que termine la animación
            	setTimeout(() => {
            		messageContainer.removeChild(message);
            	}, 3000); // 3 segundos (duración de la animación)
            }

            function resetgameChallenges() {
                // Reiniciar el progreso de los retos
            	gameChallenges.forEach(challenge => {
            			challenge.progress = 0;
            			challenge.completed = false;
                	});

            	/*const today = new Date().toDateString();
            	const lastReset = localStorage.getItem("lastReset");

            	if (lastReset != today) {
            		localStorage.setItem("lastReset", today);

            		// Reiniciar el progreso de los retos
            		gameChallenges.forEach(challenge => {
            			challenge.progress = 0;
            			challenge.completed = false;
                	});

            		// Guardar los retos en localStorage
            		localStorage.setItem("gameChallenges", JSON.stringify(gameChallenges));
            	} else {
            		// Cargar el progreso de los retos desde localStorage
            		const savedChallenges = JSON.parse(localStorage.getItem("gameChallenges"));
            		if (savedChallenges) {
            			gameChallenges.forEach((challenge, index) => {
            				gameChallenges[index] = savedChallenges[index];
            			});
            		}
            	}*/
            }

            // Funcion para actualizar el Progreso de los Retos
            function updateChallenges(type, amount = 1) {
            	gameChallenges.forEach(challenge => {
            		if (challenge.type === type && !challenge.completed) {
            			challenge.progress += amount;

            			if (challenge.progress >= challenge.target) {
            				challenge.completed = true;
            				showMessage(`¡Reto completado! ${challenge.description}`);

            				// Guardar el estado actualizado en localStorage
            				/*localStorage.setItem("gameChallenges", JSON.stringify(gameChallenges));*/
            			challengeScore += 500;
            			}
            		}
            	});
            }