// Game Logic for Color Knowledge Quiz
class FlightAdventureGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set up responsive canvas
        this.setupCanvas();
        
        // Game state
        this.gameState = 'stopped'; // stopped, playing, paused, gameOver
        this.score = 0; // Now represents ustar points
        this.lives = 4; // Increased to 4 lives
        this.level = 1;
        this.difficulty = 'normal';
        
        // Color Knowledge Quiz Data
        this.colorCategories = [
            { color: 'Purple', category: 'People', hexColor: '#7B2CBF' },
            { color: 'Indigo', category: 'Integral Processes', hexColor: '#3F37C9' },
            { color: 'Quartz', category: 'Quality', hexColor: '#51484F' },
            { color: 'Green', category: 'Growth', hexColor: '#01B27C' },
            { color: 'Gold', category: 'Global Branding', hexColor: '#FFD700' },
            { color: 'Orange', category: 'Organizational Efficiency', hexColor: '#FF8500' },
            { color: 'Rose', category: 'Relation', hexColor: '#FF69B4' }
        ];
        
        // Quiz state
        this.currentQuestion = null;
        this.questionAnswered = false;
        this.showingResult = false;
        this.resultTimer = 0;
        
        // Images
        this.images = {
            flightIcon: null
        };
        this.imagesLoaded = false;
        
        // Game timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.questionTimer = 0; // For question display timing
        this.colorSpawnTimer = 0; // For spawning color targets
        this.colorSpawnRate = 2000; // Back to normal - spawn every 2 seconds
        
        // Input handling - now for quiz choices
        this.currentGesture = null;
        this.lastGestureTime = 0;
        this.gestureActionCooldown = 200; // Normal response time - 200ms
        this.selectedChoice = -1; // -1 = no selection, 0-6 = choice index
        
        // Performance tracking - quiz specific
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.correctCategories = new Set(); // Track which categories have been answered correctly
        this.totalQuestions = 7; // Total number of different questions (one for each color category)
        this.askedQuestions = new Set(); // Track which categories have been asked
        
        // Load images first, then initialize game objects
        this.loadImages().then(() => {
            this.initializeGame();
            this.generateNewQuestion();
        });
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleGesture = this.handleGesture.bind(this);
        
        // Handle window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        // Make canvas responsive to screen size
        const gameArea = this.canvas.parentElement;
        const rect = gameArea.getBoundingClientRect();
        
        // Set canvas size to fit the container while maintaining aspect ratio
        const maxWidth = Math.min(rect.width - 40, window.innerWidth - 100);
        const maxHeight = Math.min(rect.height - 40, window.innerHeight - 200);
        
        // Maintain 4:3 aspect ratio
        let canvasWidth = maxWidth;
        let canvasHeight = (maxWidth * 3) / 4;
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = (maxHeight * 4) / 3;
        }
        
        // Set the actual canvas size
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // Update internal dimensions
        this.width = canvasWidth;
        this.height = canvasHeight;
        
        // Scale content for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        this.canvas.width = canvasWidth * dpr;
        this.canvas.height = canvasHeight * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Update player position if it exists
        if (this.player) {
            this.player.targetY = this.height / 2;
            this.player.y = this.height / 2;
            this.player.minY = 60; // Updated bounds since color guide is in sidebar
            this.player.maxY = this.height - 60;
        }
    }

    async loadImages() {
        return new Promise((resolve, reject) => {
            const flightIcon = new Image();
            flightIcon.onload = () => {
                this.images.flightIcon = flightIcon;
                this.imagesLoaded = true;
                console.log('Flight icon loaded successfully');
                resolve();
            };
            flightIcon.onerror = () => {
                console.warn('Failed to load flight icon, will use fallback rectangle');
                this.imagesLoaded = false;
                resolve(); // Continue even if image fails to load
            };
            flightIcon.src = 'flight_icon.png';
        });
    }

    initializeGame() {
        // Initialize player aircraft
        this.player = {
            x: 100,
            y: this.height / 2,
            width: 80,
            height: 50,
            targetY: this.height / 2,
            speed: 5,
            health: 100,
            maxHealth: 100,
            minY: 60, // Reduced since color guide is now in sidebar
            maxY: this.height - 60
        };
        
        // Initialize color targets (flying color choices)
        this.colorTargets = [];
        this.particles = [];
        
        // Reset quiz state
        this.score = 0;
        this.lives = 4; // Reset to 4 lives
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        this.correctCategories = new Set(); // Reset correctly answered categories
        this.askedQuestions = new Set(); // Reset asked questions
        this.currentQuestion = null;
        this.questionAnswered = false;
        this.showingResult = false;
        this.selectedChoice = -1;
    }

    generateNewQuestion() {
        // If all 7 categories have been answered correctly, player wins!
        if (this.correctCategories.size >= this.totalQuestions) {
            this.gameState = 'winner';
            this.winner();
            return;
        }
        
        // Find categories that haven't been answered correctly yet
        const remainingCategories = this.colorCategories.filter(category => 
            !this.correctCategories.has(category.category)
        );
        
        if (remainingCategories.length === 0) {
            // This shouldn't happen, but just in case
            this.gameState = 'winner';
            this.winner();
            return;
        }
        
        // Generate a random question from remaining categories
        const randomCategory = remainingCategories[Math.floor(Math.random() * remainingCategories.length)];
        
        // Create shuffled choices (all 7 colors)
        const choices = [...this.colorCategories].sort(() => Math.random() - 0.5);
        
        this.currentQuestion = {
            question: `Which color is representing ${randomCategory.category}?`,
            correctAnswer: randomCategory.color,
            correctIndex: choices.findIndex(choice => choice.color === randomCategory.color),
            choices: choices,
            category: randomCategory.category
        };
        
        this.questionAnswered = false;
        this.showingResult = false;
        this.selectedChoice = -1;
        this.resultTimer = 0;
        
        // Update the HTML question display
        this.updateQuestionDisplay();
    }

    initializeStars() {
        // Keep background elements for visual appeal
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 1 + 0.3, // Normal background speed
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    }

    start() {
        // Wait for images to load before starting
        if (!this.imagesLoaded) {
            setTimeout(() => this.start(), 100);
            return;
        }
        
        this.gameState = 'playing';
        this.initializeGame();
        this.initializeStars();
        this.generateNewQuestion();
        this.gameLoop();
        this.updateUI();
    }

    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        }
    }

    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop();
        }
    }

    stop() {
        this.gameState = 'stopped';
    }

    gameOver() {
        this.gameState = 'gameOver';
        // Clear any running timers
        clearTimeout(this.questionTimer);
        // Stop spawning new targets
        this.colorTargets = [];
        this.showGameOver();
    }

    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;

        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update game objects
        this.updatePlayer();
        this.updateColorTargets();
        this.updateParticles();
        this.updateStars(); // Keep background animation
        
        // Spawn color targets
        this.spawnColorTargets();
        
        // Check collisions
        this.checkCollisions();
        
        // Update quiz logic
        this.updateQuiz();
        
        // Render everything
        this.render();
        
        // Update UI
        this.updateUI();

        // Continue game loop
        requestAnimationFrame(this.gameLoop);
    }

    updateQuiz() {
        // Handle result display timing
        if (this.showingResult) {
            this.resultTimer += this.deltaTime;
            if (this.resultTimer > 2000) { // Show result for 2 seconds
                if (this.lives > 0) {
                    this.generateNewQuestion();
                } else {
                    this.gameOver();
                }
            }
        }
    }

    updatePlayer() {
        const player = this.player;
        
        // Normal responsive movement towards target Y
        const diff = player.targetY - player.y;
        player.y += diff * 0.2; // Normal speed - 0.2 for balanced response
        
        // Keep player within bounds (use the player's defined bounds)
        player.y = Math.max(player.minY || 60, Math.min(player.maxY || this.height - 60, player.y));
    }

    updateColorTargets() {
        for (let i = this.colorTargets.length - 1; i >= 0; i--) {
            const target = this.colorTargets[i];
            
            // Move target left
            target.x -= target.speed * (this.deltaTime / 16);
            
            // Remove off-screen targets
            if (target.x + target.width < 0) {
                this.colorTargets.splice(i, 1);
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velocityX * (this.deltaTime / 16);
            particle.y += particle.velocityY * (this.deltaTime / 16);
            particle.life -= this.deltaTime;
            particle.opacity = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    spawnColorTargets() {
        if (!this.currentQuestion) return;
        
        this.colorSpawnTimer += this.deltaTime;
        
        if (this.colorSpawnTimer > this.colorSpawnRate) {
            this.colorSpawnTimer = 0;
            this.createColorTarget();
        }
    }

    createColorTarget() {
        // Randomly select a color from the current question choices
        const randomChoice = this.currentQuestion.choices[Math.floor(Math.random() * this.currentQuestion.choices.length)];
        
        const target = {
            x: this.width,
            y: Math.random() * (this.height - 120) + 60, // Adjusted for new layout without top color guide
            width: 60,
            height: 40,
            speed: 3, // Normal speed - back to 3 for balanced gameplay
            color: randomChoice.color,
            hexColor: randomChoice.hexColor,
            category: randomChoice.category,
            isCorrect: randomChoice.color === this.currentQuestion.correctAnswer
        };
        
        this.colorTargets.push(target);
    }

    checkCollisions() {
        // Player vs color targets
        for (let i = this.colorTargets.length - 1; i >= 0; i--) {
            const target = this.colorTargets[i];
            
            if (this.isColliding(this.player, target)) {
                // Remove the target
                this.colorTargets.splice(i, 1);
                
                // Check if this color matches the correct answer
                const isCorrectAnswer = target.color === this.currentQuestion.correctAnswer;
                
                if (isCorrectAnswer) {
                    // Correct color collected
                    this.score += 100;
                    this.correctAnswers++;
                    this.correctCategories.add(this.currentQuestion.category); // Track this category as correctly answered
                    this.questionsAnswered++;
                    this.createParticle(target.x + target.width / 2, target.y + target.height / 2, '#01B27C', 15);
                    this.showAchievement(`Correct! +100 ustar ⭐`);
                    
                    // Update the color category display
                    this.updateColorCategoryDisplay();
                    
                    // Check if all 7 categories have been answered correctly
                    if (this.correctCategories.size >= this.totalQuestions) {
                        // Player wins! All 7 categories answered correctly
                        setTimeout(() => {
                            this.winner();
                        }, 1000);
                    } else {
                        // Generate new question after short delay
                        setTimeout(() => {
                            this.generateNewQuestion();
                        }, 1000);
                    }
                } else {
                    // Wrong color collected
                    this.lives--;
                    this.questionsAnswered++;
                    this.createParticle(target.x + target.width / 2, target.y + target.height / 2, '#FC6A59', 15);
                    this.showAchievement(`Wrong! Correct: ${this.currentQuestion.correctAnswer} 💔`);
                    
                    if (this.lives <= 0) {
                        // Game over immediately
                        setTimeout(() => {
                            this.gameOver();
                        }, 1000);
                        return; // Stop processing more collisions
                    } else {
                        // Generate new question after short delay
                        setTimeout(() => {
                            this.generateNewQuestion();
                        }, 1000);
                    }
                }
                break;
            }
        }
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    createParticle(x, y, color = '#01B27C', count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = {
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 10,
                velocityY: (Math.random() - 0.5) * 10,
                life: 1000,
                maxLife: 1000,
                opacity: 1,
                color: color,
                size: Math.random() * 3 + 1
            };
            
            this.particles.push(particle);
        }
    }

    answerQuestion(choiceIndex) {
        if (this.questionAnswered || this.showingResult || !this.currentQuestion) return;
        
        this.questionAnswered = true;
        this.questionsAnswered++;
        this.selectedChoice = choiceIndex;
        
        if (choiceIndex === this.currentQuestion.correctIndex) {
            // Correct answer
            this.score += 100; // 100 ustar points
            this.correctAnswers++;
            this.showingResult = true;
            this.resultTimer = 0;
            this.showAchievement(`Correct! +100 ustar ⭐`);
        } else {
            // Wrong answer
            this.lives--;
            this.showingResult = true;
            this.resultTimer = 0;
            this.showAchievement(`Wrong! Correct answer: ${this.currentQuestion.correctAnswer} 💔`);
            
            if (this.lives <= 0) {
                setTimeout(() => this.gameOver(), 2000);
            }
        }
    }

    handleGesture(gesture) {
        if (!gesture || this.gameState !== 'playing') return;
        
        const now = Date.now();
        if (now - this.lastGestureTime < this.gestureActionCooldown) return;
        
        // Map gestures to aircraft movement with normal responsiveness
        switch (gesture.action) {
            case 'up':
                // Open hand - move up (normal movement for balanced response)
                this.player.targetY = Math.max(this.player.minY || 60, this.player.targetY - 100);
                break;
            case 'down': 
                // Closed fist - move down (normal movement for balanced response)
                this.player.targetY = Math.min(this.player.maxY || this.height - 60, this.player.targetY + 100);
                break;
        }
        
        this.lastGestureTime = now;
    }

    updateStars() {
        for (const star of this.stars) {
            star.x -= star.speed * (this.deltaTime / 16);
            
            if (star.x < 0) {
                star.x = this.width;
                star.y = Math.random() * this.height;
            }
        }
    }

    render() {
        // Clear canvas with light background
        this.ctx.fillStyle = '#F2F7F8';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw subtle background elements
        this.renderBackground();
        
        // Draw game objects
        this.renderPlayer();
        this.renderColorTargets();
        this.renderParticles();
        
        // Draw quiz interface
        this.renderQuizInterface();
    }

    renderBackground() {
        // Render subtle moving background elements
        this.ctx.fillStyle = '#E8F4FD';
        for (const star of this.stars) {
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        this.ctx.globalAlpha = 1;
    }

    updateQuestionDisplay() {
        const questionElement = document.getElementById('currentQuestion');
        if (questionElement && this.currentQuestion) {
            questionElement.textContent = this.currentQuestion.question;
        }
    }

    updateColorCategoryDisplay() {
        // Highlight correct categories in the sidebar
        const categoryElements = document.querySelectorAll('.color-category');
        categoryElements.forEach(element => {
            const colorName = element.getAttribute('data-color');
            if (this.correctCategories.has(this.colorCategories.find(c => c.color === colorName)?.category)) {
                element.classList.add('correct');
            }
        });
    }

    renderQuizInterface() {
        if (!this.currentQuestion) return;
        
        // Instructions at the bottom of the canvas
        this.ctx.save();
        this.ctx.fillStyle = '#006E74';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Fly to collect the correct color! Use Open Hand (up) and Closed Fist (down)', this.width / 2, this.height - 20);
        this.ctx.restore();
    }

    renderPlayer() {
        const player = this.player;
        
        this.ctx.save();
        this.ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        
        // Draw player aircraft using flight icon PNG or fallback rectangle
        if (this.imagesLoaded && this.images.flightIcon) {
            // Use the flight icon PNG
            this.ctx.drawImage(
                this.images.flightIcon, 
                -player.width / 2, 
                -player.height / 2, 
                player.width, 
                player.height
            );
        } else {
            // Fallback to rectangle if image failed to load
            this.ctx.fillStyle = '#006E74';
            this.ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
            
            // Add simple aircraft shape
            this.ctx.fillStyle = '#0097AC';
            this.ctx.beginPath();
            this.ctx.moveTo(player.width / 2, 0);
            this.ctx.lineTo(-player.width / 4, -player.height / 4);
            this.ctx.lineTo(-player.width / 4, player.height / 4);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    renderColorTargets() {
        for (const target of this.colorTargets) {
            this.ctx.save();
            
            // Draw target background
            this.ctx.fillStyle = target.hexColor;
            this.ctx.fillRect(target.x, target.y, target.width, target.height);
            
            // Draw border
            this.ctx.strokeStyle = target.isCorrect ? '#FFFFFF' : '#FFFFFF';
            this.ctx.lineWidth = target.isCorrect ? 3 : 1;
            this.ctx.strokeRect(target.x, target.y, target.width, target.height);
            
            
            
            this.ctx.restore();
        }
    }

    renderParticles() {
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            this.ctx.restore();
        }
    }

    getContrastColor(hexColor) {
        // Simple contrast calculation
        const color = hexColor.replace('#', '');
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    updateUI() {
        // Update score (ustar points), lives, level
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = Math.floor(this.correctAnswers / 5) + 1; // Level based on correct answers
        
        // Update lives display (now with 4 lives)
        const livesDisplay = '❤️'.repeat(this.lives) + '🖤'.repeat(4 - this.lives);
        document.getElementById('lives').textContent = livesDisplay;
        
        // Update quiz stats
        const accuracy = this.questionsAnswered > 0 ? 
            Math.round((this.correctAnswers / this.questionsAnswered) * 100) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.getElementById('enemiesHit').textContent = this.correctAnswers; // Now represents correct answers
        
        // Update questions answered
        document.getElementById('timePlayed').textContent = 
            `${this.questionsAnswered} Questions`;
    }

    // Add keyboard support for arrow keys (for testing)
    handleKeyPress(event) {
        if (this.gameState !== 'playing') return;
        
        const key = event.key;
        if (key === 'ArrowUp') {
            this.player.targetY = Math.max(this.player.minY || 60, this.player.targetY - 100);
        } else if (key === 'ArrowDown') {
            this.player.targetY = Math.min(this.player.maxY || this.height - 60, this.player.targetY + 100);
        }
    }

    showAchievement(text) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.textContent = text;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 3000);
    }

    showGameOver() {
        document.getElementById('finalScore').textContent = `${this.score} ustar points`;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        // Show quiz achievements
        const achievements = [];
        if (this.score >= 1000) achievements.push('🏆 Color Master - 1000+ ustar');
        if (this.correctAnswers >= 10) achievements.push('🌈 Knowledge Expert - 10+ correct');
        if (this.questionsAnswered > 0 && (this.correctAnswers / this.questionsAnswered) >= 0.8) achievements.push('🎯 Accuracy Champion - 80%+');
        if (this.correctAnswers >= 20) achievements.push('🧠 Quiz Genius - 20+ correct');
        
        const achievementsDiv = document.getElementById('achievements');
        achievementsDiv.innerHTML = achievements.length > 0 ? 
            '<h4>Achievements Unlocked:</h4>' + achievements.map(a => `<div>${a}</div>`).join('') : 
            '<h4>Try again to unlock achievements!</h4>';
    }

    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        // Show achievements
        const achievements = [];
        if (this.score > 1000) achievements.push('🏆 Ace Pilot');
        if (this.level >= 5) achievements.push('✈️ Flight Commander');
        if (this.accuracyStats.hits / this.accuracyStats.shots > 0.8) achievements.push('� Top Gun');
        
        const achievementsDiv = document.getElementById('achievements');
        achievementsDiv.innerHTML = achievements.length > 0 ? 
            '<h4>Achievements Unlocked:</h4>' + achievements.map(a => `<div>${a}</div>`).join('') : '';
    }

    winner() {
        this.gameState = 'winner';
        this.showWinner();
    }

    showWinner() {
        document.getElementById('winnerScore').textContent = this.score;
        document.getElementById('winnerScreen').classList.remove('hidden');
        
        // Add celebratory particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                maxLife: 60 + Math.random() * 40,
                color: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#32CD32'][Math.floor(Math.random() * 5)],
                size: 8 + Math.random() * 12
            });
        }
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
}

// Export for use in other modules
window.FlightAdventureGame = FlightAdventureGame;
