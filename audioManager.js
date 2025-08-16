// Audio Manager for Color Quiz Game
class AudioManager {
    constructor() {
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.correctSound = document.getElementById('correctSound');
        this.wrongSound = document.getElementById('wrongSound');
        this.audioToggle = document.getElementById('audioToggle');
        
        this.isMuted = false;
        this.musicVolume = 0.3; // Background music at 30% volume
        this.sfxVolume = 0.7;   // Sound effects at 70% volume
        
        this.init();
    }
    
    init() {
        // Set initial volumes
        this.backgroundMusic.volume = this.musicVolume;
        this.correctSound.volume = this.sfxVolume;
        this.wrongSound.volume = this.sfxVolume;
        
        // Set up audio toggle button
        this.audioToggle.addEventListener('click', () => this.toggleMute());
        
        // Try to load free background music from freesound or create silence
        this.setupBackgroundMusic();
        
        // Handle audio context for modern browsers
        this.setupAudioContext();
    }
    
    setupBackgroundMusic() {
        // Create a simple background music using Web Audio API if external files fail
        this.backgroundMusic.addEventListener('error', () => {
            console.log('External audio failed, creating synthetic background music');
            this.createSyntheticMusic();
        });
        
        // Set loop and preload
        this.backgroundMusic.loop = true;
        this.backgroundMusic.preload = 'auto';
    }
    
    setupAudioContext() {
        // Modern browsers require user interaction before playing audio
        document.addEventListener('click', () => {
            if (this.backgroundMusic.paused && !this.isMuted) {
                this.playBackgroundMusic();
            }
        }, { once: true });
    }
    
    createSyntheticMusic() {
        // Create a simple, pleasant background tone using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a gentle, ambient sound
            this.synthMusic = { oscillator, gainNode, audioContext };
        } catch (error) {
            console.log('Web Audio API not supported');
        }
    }
    
    playBackgroundMusic() {
        if (this.isMuted) return;
        
        try {
            this.backgroundMusic.currentTime = 0;
            const playPromise = this.backgroundMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Background music play failed:', error);
                    // Fallback to synthetic music
                    this.playSyntheticMusic();
                });
            }
        } catch (error) {
            console.log('Background music error:', error);
            this.playSyntheticMusic();
        }
    }
    
    playSyntheticMusic() {
        if (this.synthMusic && !this.isMuted) {
            try {
                this.synthMusic.oscillator.start();
            } catch (error) {
                // Oscillator already started
            }
        }
    }
    
    stopBackgroundMusic() {
        this.backgroundMusic.pause();
        if (this.synthMusic) {
            try {
                this.synthMusic.oscillator.stop();
            } catch (error) {
                // Oscillator already stopped
            }
        }
    }
    
    playCorrectSound() {
        if (this.isMuted) return;
        
        try {
            this.correctSound.currentTime = 0;
            this.correctSound.play().catch(() => {
                // Fallback: create a positive beep
                this.createBeep(800, 200); // High frequency, short duration
            });
        } catch (error) {
            this.createBeep(800, 200);
        }
    }
    
    playWrongSound() {
        if (this.isMuted) return;
        
        try {
            this.wrongSound.currentTime = 0;
            this.wrongSound.play().catch(() => {
                // Fallback: create a negative buzz
                this.createBeep(200, 400); // Low frequency, longer duration
            });
        } catch (error) {
            this.createBeep(200, 400);
        }
    }
    
    createBeep(frequency, duration) {
        if (this.isMuted) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.log('Web Audio API beep failed:', error);
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopBackgroundMusic();
            this.audioToggle.classList.add('muted');
            this.audioToggle.innerHTML = '🔇';
            this.audioToggle.title = 'Enable Background Music';
        } else {
            this.playBackgroundMusic();
            this.audioToggle.classList.remove('muted');
            this.audioToggle.innerHTML = '🔊';
            this.audioToggle.title = 'Disable Background Music';
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.backgroundMusic.volume = this.musicVolume;
        
        if (this.synthMusic) {
            this.synthMusic.gainNode.gain.setValueAtTime(this.musicVolume * 0.1, this.synthMusic.audioContext.currentTime);
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.correctSound.volume = this.sfxVolume;
        this.wrongSound.volume = this.sfxVolume;
    }
}

// Initialize audio manager when DOM is loaded
let audioManager;
document.addEventListener('DOMContentLoaded', () => {
    audioManager = new AudioManager();
    // Make it globally accessible
    window.audioManager = audioManager;
});
