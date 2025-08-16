// Mobile Touch Controls for Color Quiz Game
class MobileTouchControls {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.touchStartY = 0;
        this.touchActive = false;
        this.lastTouchTime = 0;
        this.touchCooldown = 100; // Prevent rapid touch events
        
        this.init();
    }
    
    init() {
        // Check if device supports touch
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (this.isTouchDevice) {
            this.setupTouchControls();
            this.showTouchInstructions();
        }
    }
    
    setupTouchControls() {
        // Touch events on canvas
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
        
        // Add touch feedback
        this.canvas.style.touchAction = 'none';
    }
    
    handleTouchStart(event) {
        if (this.game.gameState !== 'playing') return;
        
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        this.touchStartY = touch.clientY - rect.top;
        this.touchActive = true;
    }
    
    handleTouchMove(event) {
        if (!this.touchActive || this.game.gameState !== 'playing') return;
        
        const now = Date.now();
        if (now - this.lastTouchTime < this.touchCooldown) return;
        
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const currentY = touch.clientY - rect.top;
        const deltaY = currentY - this.touchStartY;
        
        // Determine gesture based on touch movement
        if (Math.abs(deltaY) > 20) { // Minimum movement threshold
            if (deltaY < 0) {
                // Swipe up
                this.game.handleGesture({ action: 'up', confidence: 0.9 });
            } else {
                // Swipe down
                this.game.handleGesture({ action: 'down', confidence: 0.9 });
            }
            
            this.touchStartY = currentY; // Update for continuous movement
            this.lastTouchTime = now;
        }
    }
    
    handleTouchEnd(event) {
        this.touchActive = false;
    }
    
    showTouchInstructions() {
        // Update the gesture instructions for touch devices
        const gestureInstructions = document.querySelector('.gesture-instructions');
        if (gestureInstructions) {
            gestureInstructions.innerHTML = `
                <div class="gesture-item">
                    <span class="gesture-icon">👆</span>
                    <span>Swipe Up = Fly Up</span>
                </div>
                <div class="gesture-item">
                    <span class="gesture-icon">👇</span>
                    <span>Swipe Down = Fly Down</span>
                </div>
                <div class="gesture-item">
                    <span class="gesture-icon">✋</span>
                    <span>Or use Hand Gestures</span>
                </div>
            `;
        }
        
        // Add touch control hint to the game area
        this.addTouchHint();
    }
    
    addTouchHint() {
        const gameArea = document.querySelector('.game-area');
        if (gameArea && !document.querySelector('.touch-hint')) {
            const touchHint = document.createElement('div');
            touchHint.className = 'touch-hint';
            touchHint.innerHTML = '👆👇 Swipe on game area to control';
            gameArea.appendChild(touchHint);
        }
    }
}

// Initialize touch controls when game is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for game to be initialized
    setTimeout(() => {
        if (window.game) {
            window.touchControls = new MobileTouchControls(window.game);
        }
    }, 1000);
});
