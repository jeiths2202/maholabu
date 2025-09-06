// Game Platform JavaScript
class GamePlatform {
    constructor() {
        this.currentGame = null;
        this.init();
    }

    init() {
        // Initialize i18n if not already loaded
        if (typeof window.i18n === 'undefined') {
            this.loadI18n();
        } else {
            this.setupPlatform();
        }
    }

    async loadI18n() {
        try {
            // Load i18n script dynamically if needed
            if (typeof I18nManager !== 'undefined') {
                window.i18n = new I18nManager();
                await window.i18n.init();
            }
            this.setupPlatform();
        } catch (error) {
            console.error('Failed to load i18n:', error);
            this.setupPlatform();
        }
    }

    setupPlatform() {
        // Add game coding specific translations
        this.addGameTranslations();
        
        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }

        // Add event listeners
        this.addEventListeners();
        
        // Check for mobile device
        this.checkMobileDevice();
    }

    addGameTranslations() {
        // This would typically be loaded from locale files
        const gameTranslations = {
            ja: {
                game_coding_title: 'ゲームコーディング',
                game_coding_subtitle: 'ゲームで学ぶコーディングの世界',
                roblox_adventure_title: '3D ロブロックスアドベンチャー',
                roblox_adventure_desc: 'スクラッチ型コーディングで3D世界を探検しよう！',
                difficulty_beginner: '初級',
                target_age_elementary: '小学5-6年生',
                space_coding_title: '宇宙コーディング探検',
                space_coding_desc: '宇宙船を操縦してアルゴリズムを学ぼう！',
                castle_defense_title: '城防御コーディング',
                castle_defense_desc: 'コーディングで城を守る戦略ゲーム！',
                coming_soon: '近日公開',
                back_to_main: 'メインに戻る'
            },
            en: {
                game_coding_title: 'Game Coding',
                game_coding_subtitle: 'Learn coding through games',
                roblox_adventure_title: '3D Roblox Adventure',
                roblox_adventure_desc: 'Explore the 3D world with Scratch-style coding!',
                difficulty_beginner: 'Beginner',
                target_age_elementary: 'Elementary 5-6',
                space_coding_title: 'Space Coding Explorer',
                space_coding_desc: 'Control spaceships and learn algorithms!',
                castle_defense_title: 'Castle Defense Coding',
                castle_defense_desc: 'Strategic game to defend castles with coding!',
                coming_soon: 'Coming Soon',
                back_to_main: 'Back to Main'
            },
            ko: {
                game_coding_title: '게임 코딩',
                game_coding_subtitle: '게임으로 배우는 코딩의 세계',
                roblox_adventure_title: '3D 로블록스 어드벤처',
                roblox_adventure_desc: '스크래치형 코딩으로 3D 세계를 탐험하세요!',
                difficulty_beginner: '초급',
                target_age_elementary: '초등 5-6학년',
                space_coding_title: '우주 코딩 탐험',
                space_coding_desc: '우주선을 조종하며 알고리즘을 배워보세요!',
                castle_defense_title: '성 방어 코딩',
                castle_defense_desc: '코딩으로 성을 방어하는 전략 게임!',
                coming_soon: '출시 예정',
                back_to_main: '메인으로 돌아가기'
            }
        };

        // Extend i18n messages if available
        if (window.i18n && window.i18n.messages) {
            Object.assign(window.i18n.messages, gameTranslations[window.i18n.currentLanguage] || gameTranslations.ko);
        }
    }

    addEventListeners() {
        // Add click animations to game cards
        const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
        gameCards.forEach(card => {
            card.addEventListener('click', this.handleGameCardClick.bind(this));
        });

        // Add hover effects for mobile
        if (this.isMobile()) {
            this.addMobileInteractions();
        }
    }

    handleGameCardClick(event) {
        const card = event.currentTarget;
        
        // Add click animation
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    }

    checkMobileDevice() {
        const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
        }
    }

    isMobile() {
        return document.body.classList.contains('mobile-device');
    }

    addMobileInteractions() {
        // Add touch-friendly interactions for mobile
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('touchstart', () => {
                card.classList.add('touch-active');
            });
            
            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    card.classList.remove('touch-active');
                }, 100);
            });
        });
    }
}

// Global functions
function startGame(gameId) {
    switch(gameId) {
        case 'roblox-scratch-adventure':
            window.location.href = 'games/roblox-adventure/index.html';
            break;
        default:
            alert('Game not yet implemented!');
    }
}

function goBack() {
    // Navigate back to main VS Code interface
    window.history.back();
}

// Initialize platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gamePlatform = new GamePlatform();
});

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    if (window.gamePlatform) {
        window.gamePlatform.checkMobileDevice();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamePlatform;
}