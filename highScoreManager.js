// High Score Management for Color Quiz Game
class HighScoreManager {
    constructor() {
        this.currentPlayer = {
            name: 'Player',
            account: 'Guest',
            score: 0
        };
        this.highScores = this.loadHighScores();
        this.updateDisplay();
    }
    
    setCurrentPlayer(name, account) {
        this.currentPlayer.name = name || 'Player';
        this.currentPlayer.account = account || 'Guest';
        this.currentPlayer.score = 0;
        this.updateCurrentPlayerDisplay();
    }
    
    updateCurrentPlayerScore(score) {
        this.currentPlayer.score = score;
        this.updateCurrentPlayerDisplay();
    }
    
    updateCurrentPlayerDisplay() {
        const nameEl = document.getElementById('currentPlayerName');
        const accountEl = document.getElementById('currentPlayerAccount');
        const scoreEl = document.getElementById('currentPlayerScore');
        
        if (nameEl) nameEl.textContent = this.currentPlayer.name;
        if (accountEl) accountEl.textContent = this.currentPlayer.account;
        if (scoreEl) scoreEl.textContent = this.currentPlayer.score;
    }
    
    addScore(score) {
        const newEntry = {
            name: this.currentPlayer.name,
            account: this.currentPlayer.account,
            score: score,
            date: new Date().toISOString()
        };
        
        this.highScores.push(newEntry);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Keep top 10
        
        this.saveHighScores();
        this.updateScoreListDisplay();
        
        return this.getPlayerRank(score);
    }
    
    getPlayerRank(score) {
        return this.highScores.findIndex(entry => 
            entry.name === this.currentPlayer.name && 
            entry.account === this.currentPlayer.account && 
            entry.score === score
        ) + 1;
    }
    
    updateScoreListDisplay() {
        const scoreListEl = document.getElementById('scoreList');
        if (!scoreListEl) return;
        
        const topScores = this.highScores.slice(0, 5); // Show top 5
        
        scoreListEl.innerHTML = topScores.map((entry, index) => {
            const rankText = this.getRankText(index + 1);
            return `
                <div class="score-item ${this.isCurrentPlayer(entry) ? 'current-player-score' : ''}">
                    <div class="rank">${rankText}</div>
                    <div class="player-data">
                        <div class="name">${this.truncateText(entry.name, 12)}</div>
                        <div class="account">${this.truncateText(entry.account, 15)}</div>
                    </div>
                    <div class="score">${entry.score}</div>
                </div>
            `;
        }).join('');
    }
    
    isCurrentPlayer(entry) {
        return entry.name === this.currentPlayer.name && 
               entry.account === this.currentPlayer.account;
    }
    
    getRankText(rank) {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `${rank}th`;
        }
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    
    loadHighScores() {
        try {
            const saved = localStorage.getItem('ustColorGameHighScores');
            return saved ? JSON.parse(saved) : this.getDefaultScores();
        } catch (error) {
            console.warn('Could not load high scores:', error);
            return this.getDefaultScores();
        }
    }
    
    saveHighScores() {
        try {
            localStorage.setItem('ustColorGameHighScores', JSON.stringify(this.highScores));
        } catch (error) {
            console.warn('Could not save high scores:', error);
        }
    }
    
    getDefaultScores() {
        return [
            { name: 'Demo Player', account: 'demo@ust.hk', score: 2500, date: new Date().toISOString() },
            { name: 'Test User', account: 'test@ust.hk', score: 2100, date: new Date().toISOString() },
            { name: 'Quiz Master', account: 'quiz@ust.hk', score: 1800, date: new Date().toISOString() },
            { name: 'Color Expert', account: 'expert@ust.hk', score: 1500, date: new Date().toISOString() },
            { name: 'UST Student', account: 'student@ust.hk', score: 1200, date: new Date().toISOString() }
        ];
    }
    
    updateDisplay() {
        this.updateCurrentPlayerDisplay();
        this.updateScoreListDisplay();
    }
    
    resetCurrentPlayer() {
        this.currentPlayer = {
            name: 'Player',
            account: 'Guest',
            score: 0
        };
        this.updateCurrentPlayerDisplay();
    }
    
    exportScores() {
        return {
            currentPlayer: this.currentPlayer,
            highScores: this.highScores,
            exportDate: new Date().toISOString()
        };
    }
}

// Initialize high score manager
let highScoreManager;
document.addEventListener('DOMContentLoaded', () => {
    highScoreManager = new HighScoreManager();
    // Make it globally accessible
    window.highScoreManager = highScoreManager;
});

// Function to start game directly from registration
function startGameDirectly() {
    const playerName = document.getElementById('playerName')?.value || 'Player';
    const playerAccount = document.getElementById('playerAccount')?.value || 'Guest';
    
    // Set player info in high score manager
    if (window.highScoreManager) {
        window.highScoreManager.setCurrentPlayer(playerName, playerAccount);
    }
    
    // Set player info in game
    if (window.game && window.game.setPlayerInfo) {
        window.game.setPlayerInfo({
            name: playerName,
            account: playerAccount
        });
    }
    
    // Hide registration screen and start game
    document.getElementById('playerRegistrationScreen').classList.add('hidden');
    
    // Start the game directly
    if (window.game) {
        window.game.start();
    }
    
    // Start background music
    if (window.audioManager) {
        window.audioManager.playBackgroundMusic();
    }
    
    console.log(`Game started for ${playerName} (${playerAccount})`);
}
