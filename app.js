// Main Application Controller
class GameApp {
    constructor() {
        this.game = null;
        this.handTracking = null;
        this.isInitialized = false;
        this.soundEnabled = true;
        this.isPaused = false;
        
        // Initialize the application
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            this.updateLoadingText('Initializing Flight Systems...');
            
            // Initialize game canvas
            const canvas = document.getElementById('gameCanvas');
            this.game = new FlightAdventureGame(canvas);
            
            this.updateLoadingText('Loading Aircraft Assets...');
            
            // Wait for game images to load
            while (!this.game.imagesLoaded) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            this.updateLoadingText('Initializing Hand Tracking...');
            
            // Initialize hand tracking
            this.handTracking = new HandTracking();
            
            // Set up hand tracking callback
            this.handTracking.setResultsCallback((gesture) => {
                this.game.handleGesture(gesture);
            });
            
            // Try to initialize hand tracking
            const handTrackingSuccess = await this.handTracking.initialize();
            
            if (!handTrackingSuccess) {
                console.warn('Hand tracking initialization failed, using keyboard controls as fallback');
                this.setupKeyboardControls();
            }
            
            // Always set up keyboard controls for quiz game
            this.setupQuizKeyboardControls();
            
            this.updateLoadingText('Ready to Start Quiz!');
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Show start screen
            this.showStartScreen();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showError('Failed to initialize the game. Please refresh and try again.');
        }
    }

    updateLoadingText(text) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    setupEventListeners() {
        // Window events
        window.addEventListener('beforeunload', () => {
            if (this.handTracking) {
                this.handTracking.stop();
            }
        });
        
        // Keyboard events (fallback controls)
        document.addEventListener('keydown', (event) => {
            if (this.game && this.game.gameState === 'playing') {
                this.handleKeyboardInput(event);
            }
        });
        
        // Prevent context menu on canvas
        document.getElementById('gameCanvas').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Handle visibility change (pause when tab is not active)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.game && this.game.gameState === 'playing') {
                this.pauseGame();
            }
        });
    }

    setupKeyboardControls() {
        const instructionsDiv = document.querySelector('.gesture-instructions');
        if (instructionsDiv) {
            instructionsDiv.innerHTML = `
                <div class="gesture-item">
                    <span class="gesture-icon">↑</span>
                    <span>Arrow Up = Move Up</span>
                </div>
                <div class="gesture-item">
                    <span class="gesture-icon">↓</span>
                    <span>Arrow Down = Move Down</span>
                </div>
                <div class="gesture-item">
                    <span class="gesture-icon">Space</span>
                    <span>Spacebar = Auto Shoot</span>
                </div>
            `;
        }
    }

    setupQuizKeyboardControls() {
        // Add keyboard event listener for quiz game
        document.addEventListener('keydown', (event) => {
            if (this.game && this.game.handleKeyPress) {
                this.game.handleKeyPress(event);
            }
        });
    }

    handleKeyboardInput(event) {
        const gesture = this.getKeyboardGesture(event.code);
        if (gesture) {
            this.game.handleGesture(gesture);
        }
    }

    getKeyboardGesture(keyCode) {
        const gestures = {
            'ArrowUp': { type: 'keyboard', action: 'up', confidence: 1.0 },
            'ArrowDown': { type: 'keyboard', action: 'down', confidence: 1.0 },
            'Space': { type: 'keyboard', action: 'shoot', confidence: 1.0 }
        };
        
        return gestures[keyCode] || null;
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 1000);
        }
    }

    showStartScreen() {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.remove('hidden');
        }
    }

    hideStartScreen() {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.add('hidden');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: rgba(255, 0, 0, 0.9); color: white; padding: 20px; 
                        border-radius: 10px; text-align: center; z-index: 1001;">
                <h3>🚨 Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; 
                        background: white; color: red; border: none; border-radius: 5px; cursor: pointer;">
                    Reload Game
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    startGame() {
        if (!this.isInitialized) {
            console.warn('Game not initialized yet');
            return;
        }
        
        this.hideStartScreen();
        this.game.start();
    }

    pauseGame() {
        if (this.game && this.game.gameState === 'playing') {
            this.game.pause();
            this.isPaused = true;
            document.getElementById('pauseScreen').classList.remove('hidden');
            document.getElementById('pauseBtn').textContent = '▶️ RESUME';
        }
    }

    resumeGame() {
        if (this.game && this.game.gameState === 'paused') {
            this.game.resume();
            this.isPaused = false;
            document.getElementById('pauseScreen').classList.add('hidden');
            document.getElementById('pauseBtn').textContent = '⏸️ PAUSE';
        }
    }

    restartGame() {
        // Hide all overlays
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('winnerScreen').classList.add('hidden');
        
        // Reset game state
        this.isPaused = false;
        document.getElementById('pauseBtn').textContent = '⏸️ PAUSE';
        
        // Start new game
        this.game.start();
    }

    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.textContent = this.soundEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF';
        }
    }

    changeDifficulty() {
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect && this.game) {
            this.game.setDifficulty(difficultySelect.value);
        }
    }

    showInstructions() {
        const instructionsModal = document.createElement('div');
        instructionsModal.className = 'instructions-modal';
        instructionsModal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; 
                        justify-content: center; z-index: 1001;">
                <div style="background: #0a0e27; padding: 30px; border-radius: 15px; 
                           max-width: 600px; color: white; border: 2px solid #00ff88;">
                    <h2 style="color: #00ff88; text-align: center; margin-bottom: 20px;">🎮 How to Play</h2>
                    <div style="margin-bottom: 20px;">
                        <h3>🎯 Objective:</h3>
                        <p>Control your spaceship using hand gestures to survive waves of enemies and collect power-ups!</p>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h3>🤲 Simple Hand Gestures:</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li>✋ <strong>Open Hand:</strong> Move aircraft up</li>
                            <li>✊ <strong>Closed Fist:</strong> Move aircraft down</li>
                            <li>☝️ <strong>Point Up:</strong> Auto-shoot at enemies</li>
                        </ul>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h3>💎 Power-ups:</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li>💚 <strong>Green:</strong> Restore health</li>
                            <li>🔵 <strong>Blue:</strong> Temporary shield</li>
                            <li>🟡 <strong>Yellow:</strong> Multishot ability</li>
                        </ul>
                    </div>
                    <div style="text-align: center;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="padding: 10px 20px; background: linear-gradient(45deg, #00ff88, #4ecdc4); 
                                       color: #0a0e27; border: none; border-radius: 5px; cursor: pointer; 
                                       font-weight: bold;">
                            Got It! 🚀
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(instructionsModal);
    }
}

// Global functions for HTML event handlers
function startGame() {
    if (window.gameApp) {
        window.gameApp.startGame();
    }
}

function resumeGame() {
    if (window.gameApp) {
        window.gameApp.resumeGame();
    }
}

function restartGame() {
    if (window.gameApp) {
        window.gameApp.restartGame();
    }
}

function togglePause() {
    if (window.gameApp) {
        window.gameApp.togglePause();
    }
}

function toggleSound() {
    if (window.gameApp) {
        window.gameApp.toggleSound();
    }
}

function changeDifficulty() {
    if (window.gameApp) {
        window.gameApp.changeDifficulty();
    }
}

function showInstructions() {
    if (window.gameApp) {
        window.gameApp.showInstructions();
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.gameApp && window.gameApp.handTracking) {
        window.gameApp.handTracking.stop();
    }
});
