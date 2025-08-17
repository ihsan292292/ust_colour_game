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
        console.log('🏅 HighScoreManager.addScore() called with score:', score);
        console.log('👤 Current player:', this.currentPlayer);
        
        const newEntry = {
            name: this.currentPlayer.name,
            account: this.currentPlayer.account,
            score: score,
            date: new Date().toISOString()
        };
        
        console.log('📝 New high score entry:', newEntry);
        
        this.highScores.push(newEntry);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Keep top 10
        
        console.log('📊 Updated high scores:', this.highScores);
        
        this.saveHighScores();
        this.updateScoreListDisplay();
        
        const rank = this.getPlayerRank(score);
        console.log('🎯 Player rank:', rank);
        return rank;
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
        const noScoresMessage = document.getElementById('noScoresMessage');
        
        if (!scoreListEl) return;
        
        const topScores = this.highScores.slice(0, 10); // Show top 10 (increased from 5)
        
        if (topScores.length === 0) {
            // Show "no scores" message
            if (noScoresMessage) {
                noScoresMessage.style.display = 'block';
            }
            // Clear any existing score items
            const existingItems = scoreListEl.querySelectorAll('.score-item');
            existingItems.forEach(item => item.remove());
        } else {
            // Hide "no scores" message
            if (noScoresMessage) {
                noScoresMessage.style.display = 'none';
            }
            
            // Create score items HTML
            const scoresHTML = topScores.map((entry, index) => {
                const rankText = this.getRankText(index + 1);
                return `
                    <div class="score-item ${this.isCurrentPlayer(entry) ? 'current-player-score' : ''}">
                        <div class="rank">${rankText}</div>
                        <div class="player-data">
                            <div class="name">${this.truncateText(entry.name, 15)}</div>
                            <div class="account">${this.truncateText(entry.account, 20)}</div>
                        </div>
                        <div class="score">${entry.score}</div>
                    </div>
                `;
            }).join('');
            
            // Update only the score items, keeping the no-scores message element
            const existingItems = scoreListEl.querySelectorAll('.score-item');
            existingItems.forEach(item => item.remove());
            
            if (noScoresMessage) {
                noScoresMessage.insertAdjacentHTML('afterend', scoresHTML);
            } else {
                scoreListEl.innerHTML = scoresHTML;
            }
        }
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
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Could not load high scores:', error);
            return [];
        }
    }
    
    saveHighScores() {
        try {
            localStorage.setItem('ustColorGameHighScores', JSON.stringify(this.highScores));
        } catch (error) {
            console.warn('Could not save high scores:', error);
        }
    }
    
    clearAllScores() {
        this.highScores = [];
        this.saveHighScores();
        this.updateScoreListDisplay();
        console.log('All high scores cleared');
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
