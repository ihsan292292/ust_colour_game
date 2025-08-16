// Hand Tracking Module using MediaPipe
class HandTracking {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.onResults = null;
        this.isInitialized = false;
        this.lastGesture = null;
        this.gestureConfidence = 0;
        this.gestureHistory = [];
        this.smoothingFrames = 5;
    }

    async initialize() {
        try {
            // Get video element and canvas
            this.videoElement = document.getElementById('videoElement');
            this.canvasElement = document.getElementById('handCanvas');
            this.canvasCtx = this.canvasElement.getContext('2d');

            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults(this.onHandResults.bind(this));

            // Initialize camera
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: this.videoElement });
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            this.isInitialized = true;
            this.updateCameraStatus(true);

            return true;
        } catch (error) {
            console.error('Hand tracking initialization failed:', error);
            this.updateCameraStatus(false);
            return false;
        }
    }

    onHandResults(results) {
        // Clear canvas
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Draw hand landmarks
            drawConnectors(this.canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF88', lineWidth: 2
            });
            drawLandmarks(this.canvasCtx, landmarks, {
                color: '#4ECDC4', lineWidth: 2, radius: 3
            });

            // Recognize gesture
            const gesture = this.recognizeGesture(landmarks);
            this.updateGesture(gesture);
        } else {
            this.updateGesture('none');
        }

        this.canvasCtx.restore();
    }

    recognizeGesture(landmarks) {
        if (!landmarks || landmarks.length === 0) return 'none';

        const fingers = this.getFingerStates(landmarks);
        const handOpen = this.isHandOpen(landmarks);
        
        // Simplified gesture recognition - only 3 gestures
        if (this.isClosedFist(fingers)) {
            return { type: 'fist', confidence: 0.95, action: 'down' };
        }
        
        if (this.isOpenHand(fingers, handOpen)) {
            return { type: 'open', confidence: 0.95, action: 'up' };
        }
        
        if (this.isPointingUp(fingers)) {
            return { type: 'point', confidence: 0.9, action: 'shoot' };
        }

        return { type: 'unknown', confidence: 0.1, action: 'none' };
    }

    getFingerStates(landmarks) {
        const fingers = [];
        const tipIds = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
        const pipIds = [3, 6, 10, 14, 18]; // PIP joints

        // Thumb (different logic due to orientation)
        fingers.push(landmarks[tipIds[0]].x > landmarks[pipIds[0]].x ? 1 : 0);

        // Other fingers
        for (let i = 1; i < 5; i++) {
            fingers.push(landmarks[tipIds[i]].y < landmarks[pipIds[i]].y ? 1 : 0);
        }

        return fingers;
    }

    getPalmDirection(landmarks) {
        const wrist = landmarks[0];
        const middleFingerMcp = landmarks[9];
        return {
            x: middleFingerMcp.x - wrist.x,
            y: middleFingerMcp.y - wrist.y
        };
    }

    isHandOpen(landmarks) {
        const wrist = landmarks[0];
        const fingertips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
        
        let totalDistance = 0;
        fingertips.forEach(tip => {
            const distance = Math.sqrt(
                Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2)
            );
            totalDistance += distance;
        });

        return totalDistance > 1.2; // Threshold for open hand
    }

    isClosedFist(fingers) {
        return fingers.every(finger => finger === 0);
    }

    isOpenHand(fingers, handOpen) {
        // At least 4 fingers up and hand is open
        const openFingers = fingers.filter(finger => finger === 1).length;
        return openFingers >= 4 && handOpen;
    }

    isPointingUp(fingers) {
        return fingers[1] === 1 && fingers[0] === 0 && fingers[2] === 0 && fingers[3] === 0 && fingers[4] === 0;
    }

    isPeaceSign(fingers) {
        return fingers[1] === 1 && fingers[2] === 1 && fingers[0] === 0 && fingers[3] === 0 && fingers[4] === 0;
    }

    isThumbsUp(fingers) {
        return fingers[0] === 1 && fingers[1] === 0 && fingers[2] === 0 && fingers[3] === 0 && fingers[4] === 0;
    }

    updateGesture(gesture) {
        if (gesture === 'none' || gesture.type === 'unknown') {
            this.lastGesture = null;
            this.gestureConfidence = 0;
            this.updateUI('🤷‍♂️ No Gesture', 0);
            return;
        }

        // Smooth gesture recognition
        this.gestureHistory.push(gesture);
        if (this.gestureHistory.length > this.smoothingFrames) {
            this.gestureHistory.shift();
        }

        // Find most common gesture in recent history
        const gestureTypes = this.gestureHistory.map(g => g.type);
        const mostCommon = this.getMostCommonGesture(gestureTypes);
        
        if (mostCommon) {
            const matchingGestures = this.gestureHistory.filter(g => g.type === mostCommon);
            const avgConfidence = matchingGestures.reduce((sum, g) => sum + g.confidence, 0) / matchingGestures.length;
            
            this.lastGesture = {
                type: mostCommon,
                action: matchingGestures[matchingGestures.length - 1].action,
                confidence: avgConfidence
            };
            
            this.gestureConfidence = avgConfidence;
            this.updateUI(this.getGestureEmoji(mostCommon), avgConfidence);
            
            // Trigger game action
            if (this.onResults) {
                this.onResults(this.lastGesture);
            }
        }
    }

    getMostCommonGesture(gestures) {
        if (gestures.length === 0) return null;
        
        const counts = {};
        gestures.forEach(gesture => {
            counts[gesture] = (counts[gesture] || 0) + 1;
        });
        
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    getGestureEmoji(gestureType) {
        const emojis = {
            'fist': '✊ Closed Fist',
            'open': '✋ Open Hand',
            'point': '☝️ Pointing Up'
        };
        return emojis[gestureType] || '🤷‍♂️ Unknown';
    }

    updateUI(gestureText, confidence) {
        const gestureDisplay = document.getElementById('currentGesture');
        const confidenceBar = document.getElementById('confidenceBar');
        const confidenceText = document.getElementById('confidenceText');

        if (gestureDisplay) {
            gestureDisplay.textContent = gestureText;
        }
        
        if (confidenceBar && confidenceText) {
            const confidencePercent = Math.round(confidence * 100);
            confidenceBar.style.width = `${confidencePercent}%`;
            confidenceText.textContent = `${confidencePercent}%`;
        }
    }

    updateCameraStatus(isActive) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = statusIndicator.querySelector('span:last-child');
        const statusLight = statusIndicator.querySelector('.status-light');

        if (isActive) {
            statusText.textContent = 'Camera: Active';
            statusLight.classList.add('active');
        } else {
            statusText.textContent = 'Camera: Error';
            statusLight.classList.remove('active');
        }
    }

    getCurrentGesture() {
        return this.lastGesture;
    }

    getConfidence() {
        return this.gestureConfidence;
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
    }

    setResultsCallback(callback) {
        this.onResults = callback;
    }
}

// Export for use in other modules
window.HandTracking = HandTracking;
