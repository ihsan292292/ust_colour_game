// Player Registration and Gesture Demo System
class PlayerRegistrationSystem {
    constructor() {
        this.playerData = {
            name: '',
            account: '',
            registrationTime: null
        };
        
        this.gestureDemo = {
            camera: null,
            hands: null,
            isActive: false,
            practiceProgress: {
                up: false,
                down: false
            },
            currentGesture: null,
            gestureConfidence: 0,
            practiceCount: {
                up: 0,
                down: 0
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Auto-focus on player name input when registration screen shows
        const playerNameInput = document.getElementById('playerName');
        if (playerNameInput) {
            playerNameInput.addEventListener('input', () => this.validateRegistration());
            playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.showGestureDemo();
                }
            });
        }
        
        const playerAccountInput = document.getElementById('playerAccount');
        if (playerAccountInput) {
            playerAccountInput.addEventListener('input', () => this.validateRegistration());
            playerAccountInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.showGestureDemo();
                }
            });
        }
    }
    
    validateRegistration() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();
        
        // Enable next button if name is provided
        const nextBtn = document.querySelector('#playerRegistrationScreen .start-btn');
        if (name.length >= 2) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
        }
    }
    
    showGestureDemo() {
        const nameInput = document.getElementById('playerName');
        const accountInput = document.getElementById('playerAccount');
        
        const name = nameInput.value.trim();
        const account = accountInput.value.trim();
        
        if (name.length < 2) {
            alert('Please enter your name (at least 2 characters)');
            nameInput.focus();
            return;
        }
        
        // Save player data
        this.playerData = {
            name: name,
            account: account,
            registrationTime: new Date()
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('ustColorGamePlayer', JSON.stringify(this.playerData));
        
        // Hide registration screen and show demo
        document.getElementById('playerRegistrationScreen').classList.add('hidden');
        document.getElementById('gestureDemoScreen').classList.remove('hidden');
        
        // Initialize gesture demo
        this.startGestureDemo();
        
        // Update welcome message with player name
        this.updatePlayerWelcome();
    }
    
    updatePlayerWelcome() {
        // Update any welcome messages with player name
        const welcomeElements = document.querySelectorAll('.player-welcome');
        welcomeElements.forEach(element => {
            element.textContent = `Welcome, ${this.playerData.name}!`;
        });
    }
    
    async startGestureDemo() {
        if (this.gestureDemo.isActive) return;
        
        try {
            this.gestureDemo.isActive = true;
            
            // Initialize MediaPipe Hands for demo
            await this.initializeDemoCamera();
            await this.initializeDemoHands();
            
            // Update camera status
            this.updateDemoCameraStatus('connected');
            
            // Start the demo instructions
            this.startDemoInstructions();
            
        } catch (error) {
            console.error('Demo initialization failed:', error);
            this.updateDemoCameraStatus('error');
            this.showCameraFallbackOptions();
        }
    }
    
    async initializeDemoCamera() {
        const video = document.getElementById('demoVideoElement');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            });
            
            video.srcObject = stream;
            this.gestureDemo.camera = stream;
            
            return new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });
        } catch (error) {
            throw new Error('Camera access denied or not available');
        }
    }
    
    async initializeDemoHands() {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });
        
        hands.onResults((results) => this.onDemoHandsResults(results));
        
        this.gestureDemo.hands = hands;
        
        // Connect to camera
        const camera = new Camera(document.getElementById('demoVideoElement'), {
            onFrame: async () => {
                await hands.send({ image: document.getElementById('demoVideoElement') });
            },
            width: 640,
            height: 480
        });
        
        camera.start();
    }
    
    onDemoHandsResults(results) {
        const canvas = document.getElementById('demoHandCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Draw hand landmarks
            this.drawDemoLandmarks(ctx, landmarks);
            
            // Detect gesture
            const gesture = this.detectDemoGesture(landmarks);
            this.processDemoGesture(gesture);
        }
    }
    
    drawDemoLandmarks(ctx, landmarks) {
        const canvas = document.getElementById('demoHandCanvas');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Draw connections
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        
        // Hand connections (simplified)
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [5, 9], [9, 10], [10, 11], [11, 12], // Middle
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring
            [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
        ];
        
        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            ctx.beginPath();
            ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
            ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
            ctx.stroke();
        });
        
        // Draw landmarks
        ctx.fillStyle = '#FF0000';
        landmarks.forEach(landmark => {
            ctx.beginPath();
            ctx.arc(
                landmark.x * canvas.width,
                landmark.y * canvas.height,
                3, 0, 2 * Math.PI
            );
            ctx.fill();
        });
    }
    
    detectDemoGesture(landmarks) {
        // Simple gesture detection (same as main game)
        const fingerTips = [4, 8, 12, 16, 20];
        const fingerPips = [3, 6, 10, 14, 18];
        
        let fingersUp = 0;
        
        // Check each finger
        for (let i = 0; i < fingerTips.length; i++) {
            if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) {
                fingersUp++;
            }
        }
        
        let action = null;
        let confidence = 0.8;
        
        if (fingersUp >= 4) {
            action = 'up';
        } else if (fingersUp <= 1) {
            action = 'down';
        }
        
        return { action, confidence };
    }
    
    processDemoGesture(gesture) {
        if (!gesture.action) return;
        
        this.gestureDemo.currentGesture = gesture.action;
        this.gestureDemo.gestureConfidence = gesture.confidence;
        
        // Update visual feedback
        this.updateDemoGestureDisplay(gesture);
        
        // Track practice progress
        this.trackPracticeProgress(gesture.action);
    }
    
    updateDemoGestureDisplay(gesture) {
        // Highlight current gesture
        const upItem = document.getElementById('demoGestureUp');
        const downItem = document.getElementById('demoGestureDown');
        
        // Remove previous highlighting
        upItem.classList.remove('practicing');
        downItem.classList.remove('practicing');
        
        // Add current gesture highlighting
        if (gesture.action === 'up') {
            upItem.classList.add('practicing');
            upItem.querySelector('.practice-status').textContent = `Great! Keep it up! (${Math.round(gesture.confidence * 100)}%)`;
        } else if (gesture.action === 'down') {
            downItem.classList.add('practicing');
            downItem.querySelector('.practice-status').textContent = `Perfect! Hold it! (${Math.round(gesture.confidence * 100)}%)`;
        }
    }
    
    trackPracticeProgress(action) {
        this.gestureDemo.practiceCount[action]++;
        
        // Consider gesture practiced after 10 detections
        if (this.gestureDemo.practiceCount[action] >= 10 && !this.gestureDemo.practiceProgress[action]) {
            this.gestureDemo.practiceProgress[action] = true;
            this.markGesturePracticed(action);
            this.checkDemoCompletion();
        }
    }
    
    markGesturePracticed(action) {
        const progressItem = document.getElementById(`progress${action.charAt(0).toUpperCase() + action.slice(1)}`);
        const gestureItem = document.getElementById(`demoGesture${action.charAt(0).toUpperCase() + action.slice(1)}`);
        
        // Update progress display
        progressItem.querySelector('.progress-status').textContent = '✅ Practiced!';
        progressItem.querySelector('.progress-status').classList.add('completed');
        
        // Mark gesture as completed
        gestureItem.classList.remove('practicing');
        gestureItem.classList.add('completed');
        gestureItem.querySelector('.practice-status').textContent = '✅ Mastered!';
        
        // Play success sound
        if (window.audioManager) {
            window.audioManager.playCorrectSound();
        }
    }
    
    checkDemoCompletion() {
        const allPracticed = this.gestureDemo.practiceProgress.up && this.gestureDemo.practiceProgress.down;
        
        if (allPracticed) {
            // Enable start game button
            const startBtn = document.getElementById('startGameBtn');
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.textContent = '🚀 START GAME - YOU\'RE READY!';
            
            // Show completion message
            this.showDemoCompletionMessage();
        }
    }
    
    showDemoCompletionMessage() {
        // Create completion notification
        const notification = document.createElement('div');
        notification.className = 'demo-completion-notification';
        notification.innerHTML = `
            <h3>🎉 Excellent Work, ${this.playerData.name}!</h3>
            <p>You've mastered the hand gestures! You're ready to start the quiz.</p>
        `;
        
        document.querySelector('.demo-content').appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    updateDemoCameraStatus(status) {
        const statusElement = document.getElementById('demoCameraStatus');
        const statusLight = statusElement.querySelector('.status-light');
        const statusText = statusElement.querySelector('span:last-child');
        
        switch (status) {
            case 'connected':
                statusLight.style.backgroundColor = '#01B27C';
                statusText.textContent = 'Camera: Ready for Demo';
                break;
            case 'error':
                statusLight.style.backgroundColor = '#FC6A59';
                statusText.textContent = 'Camera: Error - Check permissions';
                break;
            default:
                statusLight.style.backgroundColor = '#FFD700';
                statusText.textContent = 'Camera: Connecting...';
        }
    }
    
    showCameraFallbackOptions() {
        // Show instructions for manual progression if camera fails
        const demoArea = document.querySelector('.demo-area');
        const fallbackMsg = document.createElement('div');
        fallbackMsg.className = 'camera-fallback';
        fallbackMsg.innerHTML = `
            <div class="fallback-message">
                <h3>📷 Camera Not Available</h3>
                <p>Don't worry! You can still play the game with keyboard controls or skip the demo.</p>
                <button class="skip-demo-btn" onclick="playerRegistration.skipDemo()">Skip Demo & Start Game</button>
            </div>
        `;
        demoArea.appendChild(fallbackMsg);
    }
    
    skipDemo() {
        // Mark all gestures as practiced
        this.gestureDemo.practiceProgress.up = true;
        this.gestureDemo.practiceProgress.down = true;
        this.checkDemoCompletion();
    }
    
    startGameFromDemo() {
        // Stop demo camera
        this.stopGestureDemo();
        
        // Hide demo screen and show main game
        document.getElementById('gestureDemoScreen').classList.add('hidden');
        
        // Update game with player info
        if (window.game) {
            window.game.setPlayerInfo(this.playerData);
        }
        
        // Start the actual game
        startGame();
    }
    
    stopGestureDemo() {
        if (this.gestureDemo.camera) {
            this.gestureDemo.camera.getTracks().forEach(track => track.stop());
        }
        this.gestureDemo.isActive = false;
    }
    
    showPlayerRegistration() {
        // Go back to registration screen
        document.getElementById('gestureDemoScreen').classList.add('hidden');
        document.getElementById('playerRegistrationScreen').classList.remove('hidden');
        
        // Stop demo if running
        this.stopGestureDemo();
    }
}

// Global functions for HTML onclick handlers
function showGestureDemo() {
    if (window.playerRegistration) {
        window.playerRegistration.showGestureDemo();
    }
}

function showPlayerRegistration() {
    if (window.playerRegistration) {
        window.playerRegistration.showPlayerRegistration();
    }
}

function startGameFromDemo() {
    if (window.playerRegistration) {
        window.playerRegistration.startGameFromDemo();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.playerRegistration = new PlayerRegistrationSystem();
    
    // Auto-focus on name input
    setTimeout(() => {
        const nameInput = document.getElementById('playerName');
        if (nameInput) {
            nameInput.focus();
        }
    }, 500);
});
