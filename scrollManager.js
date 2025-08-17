// Scroll Management for Color Quiz Game
class ScrollManager {
    constructor() {
        this.scrollIndicator = document.getElementById('scrollIndicator');
        this.gameContainer = document.querySelector('.game-container');
        this.gameMain = document.querySelector('.game-main');
        
        this.init();
    }
    
    init() {
        this.checkOverflow();
        this.setupScrollIndicator();
        this.setupScrollHandling();
        
        // Re-check on window resize
        window.addEventListener('resize', () => {
            setTimeout(() => this.checkOverflow(), 100);
        });
        
        // Re-check when content changes
        const observer = new MutationObserver(() => {
            this.checkOverflow();
        });
        
        observer.observe(this.gameContainer, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
    
    checkOverflow() {
        const windowHeight = window.innerHeight;
        const containerHeight = this.gameContainer.scrollHeight;
        const isOverflowing = containerHeight > windowHeight;
        
        if (isOverflowing && this.scrollIndicator) {
            this.scrollIndicator.classList.add('show');
            this.showScrollHint();
        } else if (this.scrollIndicator) {
            this.scrollIndicator.classList.remove('show');
        }
        
        // Check if main area needs scrolling
        this.checkMainAreaScroll();
    }
    
    checkMainAreaScroll() {
        if (!this.gameMain) return;
        
        const mainHeight = this.gameMain.scrollHeight;
        const mainVisibleHeight = this.gameMain.clientHeight;
        
        if (mainHeight > mainVisibleHeight) {
            this.gameMain.style.overflowY = 'auto';
        } else {
            this.gameMain.style.overflowY = 'hidden';
        }
    }
    
    setupScrollIndicator() {
        if (!this.scrollIndicator) return;
        
        this.scrollIndicator.addEventListener('click', () => {
            this.scrollToBottom();
        });
        
        // Hide indicator when user scrolls
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            
            if (scrollPercent > 80) {
                this.scrollIndicator.classList.remove('show');
            }
        });
    }
    
    setupScrollHandling() {
        // Smooth scrolling for better UX
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add keyboard shortcuts for scrolling
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Home':
                    e.preventDefault();
                    this.scrollToTop();
                    break;
                case 'End':
                    e.preventDefault();
                    this.scrollToBottom();
                    break;
                case 'PageDown':
                    e.preventDefault();
                    this.scrollDown();
                    break;
                case 'PageUp':
                    e.preventDefault();
                    this.scrollUp();
                    break;
            }
        });
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    scrollToBottom() {
        window.scrollTo({ 
            top: document.documentElement.scrollHeight, 
            behavior: 'smooth' 
        });
    }
    
    scrollDown() {
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
    }
    
    scrollUp() {
        window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
    }
    
    showScrollHint() {
        // Show a temporary hint that the page is scrollable
        if (document.querySelector('.scroll-hint')) return;
        
        const hint = document.createElement('div');
        hint.className = 'scroll-hint-notification';
        hint.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary-color);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                font-size: 0.9rem;
                z-index: 1001;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                animation: slideInRight 0.5s ease-out;
            ">
                📜 Page is scrollable!<br>
                <small>Use mouse wheel or arrow keys</small>
            </div>
        `;
        
        document.body.appendChild(hint);
        
        // Remove hint after 4 seconds
        setTimeout(() => {
            hint.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                hint.remove();
            }, 500);
        }, 4000);
    }
}

// CSS animations for scroll hint
const scrollHintStyles = document.createElement('style');
scrollHintStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(scrollHintStyles);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScrollManager();
});

// Export for use in other scripts
window.ScrollManager = ScrollManager;
