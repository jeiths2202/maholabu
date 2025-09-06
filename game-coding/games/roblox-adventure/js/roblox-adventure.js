// Roblox Adventure Game Main Controller
class RobloxAdventureGame {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.score = 0;
        this.isRunning = false;
        this.world3D = null;
        this.blockSystem = null;
        this.levelData = this.generateLevelData();
        
        this.init();
    }

    init() {
        // Initialize 3D world
        this.world3D = new World3D('game-canvas');
        
        // Initialize block system
        this.blockSystem = new BlockSystem();
        
        // Load current level
        this.loadLevel(this.currentLevel);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize i18n
        this.initI18n();
        
        // Setup mobile optimizations
        this.setupMobileOptimizations();
    }

    initI18n() {
        // Add game-specific translations
        const gameTranslations = {
            ja: {
                level: 'レベル',
                score: 'スコア',
                robot_name: 'ロボット',
                objective: '目標',
                coding_blocks: 'コーディングブロック',
                help: 'ヘルプ',
                movement: '移動',
                move_forward: '前進',
                turn_left: '左回転',
                turn_right: '右回転',
                loops: 'ループ',
                repeat: '繰り返し',
                conditions: '条件',
                if_wall: '壁があれば',
                your_program: 'あなたのプログラム',
                drag_blocks_here: 'ブロックをここにドラッグ',
                run: '実行',
                reset: 'リセット',
                clear: 'クリア',
                back_to_games: 'ゲーム一覧に戻る',
                next_level: '次のレベル',
                level_complete: 'レベル完了！',
                continue: '続ける',
                how_to_play: '遊び方',
                help_instruction1: '1. 左側からコーディングブロックをドラッグ',
                help_instruction2: '2. プログラミングエリアにブロックを配置',
                help_instruction3: '3. 実行ボタンを押してロボットを移動',
                help_instruction4: '4. 宝箱に到達すればレベルクリア！',
                close: '閉じる'
            },
            en: {
                level: 'Level',
                score: 'Score',
                robot_name: 'Robot',
                objective: 'Objective',
                coding_blocks: 'Coding Blocks',
                help: 'Help',
                movement: 'Movement',
                move_forward: 'Move Forward',
                turn_left: 'Turn Left',
                turn_right: 'Turn Right',
                loops: 'Loops',
                repeat: 'Repeat',
                conditions: 'Conditions',
                if_wall: 'If Wall',
                your_program: 'Your Program',
                drag_blocks_here: 'Drag blocks here',
                run: 'Run',
                reset: 'Reset',
                clear: 'Clear',
                back_to_games: 'Back to Games',
                next_level: 'Next Level',
                level_complete: 'Level Complete!',
                continue: 'Continue',
                how_to_play: 'How to Play',
                help_instruction1: '1. Drag coding blocks from the left',
                help_instruction2: '2. Place blocks in programming area',
                help_instruction3: '3. Press run to move the robot',
                help_instruction4: '4. Reach treasure chest to complete level!',
                close: 'Close'
            },
            ko: {
                level: '레벨',
                score: '점수',
                robot_name: '로봇',
                objective: '목표',
                coding_blocks: '코딩 블록',
                help: '도움말',
                movement: '이동',
                move_forward: '앞으로 이동',
                turn_left: '왼쪽 회전',
                turn_right: '오른쪽 회전',
                loops: '반복',
                repeat: '반복',
                conditions: '조건',
                if_wall: '벽이 있으면',
                your_program: '당신의 프로그램',
                drag_blocks_here: '여기에 블록을 드래그하세요',
                run: '실행',
                reset: '리셋',
                clear: '지우기',
                back_to_games: '게임 목록으로',
                next_level: '다음 레벨',
                level_complete: '레벨 완료!',
                continue: '계속하기',
                how_to_play: '게임 방법',
                help_instruction1: '1. 왼쪽에서 코딩 블록을 드래그하세요',
                help_instruction2: '2. 프로그래밍 영역에 블록을 배치하세요',
                help_instruction3: '3. 실행 버튼을 눌러 로봇을 움직이세요',
                help_instruction4: '4. 보물상자에 도달하면 레벨 완료!',
                close: '닫기'
            }
        };

        // Extend i18n messages
        if (window.i18n) {
            Object.assign(window.i18n.messages, 
                gameTranslations[window.i18n.currentLanguage] || gameTranslations.ko);
            window.i18n.applyTranslations();
        }
    }

    generateLevelData() {
        return [
            {
                level: 1,
                objective: "보물상자에 도달하세요!",
                world: {
                    size: { width: 5, height: 5 },
                    player: { x: 0, y: 0, direction: 'east' },
                    goal: { x: 4, y: 0 },
                    walls: [],
                    obstacles: []
                },
                maxBlocks: 5,
                targetSteps: 4
            },
            {
                level: 2,
                objective: "벽을 피해 보물상자로 가세요!",
                world: {
                    size: { width: 5, height: 5 },
                    player: { x: 0, y: 0, direction: 'east' },
                    goal: { x: 4, y: 2 },
                    walls: [{ x: 2, y: 0 }, { x: 2, y: 1 }],
                    obstacles: []
                },
                maxBlocks: 8,
                targetSteps: 6
            },
            {
                level: 3,
                objective: "반복을 사용해서 효율적으로 이동하세요!",
                world: {
                    size: { width: 6, height: 4 },
                    player: { x: 0, y: 0, direction: 'east' },
                    goal: { x: 5, y: 3 },
                    walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }],
                    obstacles: []
                },
                maxBlocks: 6,
                targetSteps: 8
            },
            // Add more levels...
        ];
    }

    loadLevel(levelNum) {
        const levelData = this.levelData[levelNum - 1];
        if (!levelData) return;

        // Update UI
        document.getElementById('current-level').textContent = levelNum;
        document.getElementById('objective-text').textContent = levelData.objective;
        
        // Update progress bar
        const progress = (levelNum / this.maxLevel) * 100;
        document.getElementById('level-progress').style.width = progress + '%';
        
        // Load 3D world
        this.world3D.loadLevel(levelData.world);
        
        // Clear programming area
        this.blockSystem.clearWorkspace();
        
        // Hide next level button
        document.getElementById('next-level-btn').style.display = 'none';
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.world3D.onWindowResize();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.runProgram();
            } else if (e.code === 'Escape') {
                this.resetProgram();
            }
        });
    }

    setupMobileOptimizations() {
        const isMobile = window.innerWidth <= 768 || 
            /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            document.body.classList.add('mobile-device');
            
            // Add touch-friendly interactions
            this.addMobileTouchHandlers();
        }
    }

    addMobileTouchHandlers() {
        // Add touch handlers for better mobile experience
        const blocks = document.querySelectorAll('.block[draggable="true"]');
        blocks.forEach(block => {
            block.addEventListener('touchstart', this.handleTouchStart.bind(this));
            block.addEventListener('touchmove', this.handleTouchMove.bind(this));
            block.addEventListener('touchend', this.handleTouchEnd.bind(this));
        });
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const block = e.currentTarget;
        
        block.classList.add('dragging');
        
        // Store initial position
        this.touchData = {
            block: block,
            startX: touch.clientX,
            startY: touch.clientY,
            originalParent: block.parentNode
        };
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.touchData) return;
        
        const touch = e.touches[0];
        // Update visual feedback
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (!this.touchData) return;
        
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Handle drop logic
        if (elementBelow && elementBelow.classList.contains('code-workspace')) {
            this.blockSystem.addBlockToWorkspace(this.touchData.block.cloneNode(true));
        }
        
        this.touchData.block.classList.remove('dragging');
        this.touchData = null;
    }

    async runProgram() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const runButton = document.querySelector('.run-button');
        const originalText = runButton.textContent;
        runButton.innerHTML = '<div class="loading"></div>';
        runButton.disabled = true;
        
        try {
            const program = this.blockSystem.getProgram();
            const result = await this.world3D.executeProgram(program);
            
            if (result.success) {
                this.levelCompleted(result.score);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Program execution error:', error);
            this.showError('프로그램 실행 중 오류가 발생했습니다.');
        } finally {
            this.isRunning = false;
            runButton.textContent = originalText;
            runButton.disabled = false;
        }
    }

    resetProgram() {
        if (this.isRunning) return;
        
        this.world3D.resetLevel();
    }

    levelCompleted(earnedScore) {
        this.score += earnedScore;
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('level-score').textContent = earnedScore;
        
        // Calculate stars based on efficiency
        const stars = this.calculateStars(earnedScore);
        document.getElementById('star-rating').textContent = '⭐'.repeat(stars);
        
        // Show success modal
        document.getElementById('success-modal').style.display = 'flex';
        
        // Show next level button
        if (this.currentLevel < this.maxLevel) {
            document.getElementById('next-level-btn').style.display = 'block';
        }
    }

    calculateStars(score) {
        const levelData = this.levelData[this.currentLevel - 1];
        const efficiency = score / (levelData.targetSteps * 10);
        
        if (efficiency >= 1.5) return 3;
        if (efficiency >= 1.0) return 2;
        return 1;
    }

    showError(message) {
        alert(message); // Replace with better error UI
    }

    nextLevel() {
        document.getElementById('success-modal').style.display = 'none';
        
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
        } else {
            // Game completed
            alert('모든 레벨을 완료했습니다! 축하합니다!');
            goBackToMenu();
        }
    }
}

// Global functions
function runProgram() {
    if (window.game) {
        window.game.runProgram();
    }
}

function resetProgram() {
    if (window.game) {
        window.game.resetProgram();
    }
}

function clearWorkspace() {
    if (window.game && window.game.blockSystem) {
        window.game.blockSystem.clearWorkspace();
    }
}

function nextLevel() {
    if (window.game) {
        window.game.nextLevel();
    }
}

function showHelp() {
    document.getElementById('help-modal').style.display = 'flex';
}

function closeHelp() {
    document.getElementById('help-modal').style.display = 'none';
}

function goBackToMenu() {
    window.location.href = '../../index.html';
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new RobloxAdventureGame();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RobloxAdventureGame;
}