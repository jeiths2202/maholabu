// Block System for Scratch-style Visual Programming
class BlockSystem {
    constructor() {
        this.workspace = document.getElementById('code-workspace');
        this.blocks = [];
        this.draggedBlock = null;
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupWorkspace();
    }

    setupDragAndDrop() {
        // Add event listeners to draggable blocks
        const draggableBlocks = document.querySelectorAll('.block[draggable="true"]');
        draggableBlocks.forEach(block => {
            block.addEventListener('dragstart', this.handleDragStart.bind(this));
            block.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    }

    setupWorkspace() {
        // Setup drop zone
        this.workspace.addEventListener('dragover', this.handleDragOver.bind(this));
        this.workspace.addEventListener('drop', this.handleDrop.bind(this));
        this.workspace.addEventListener('dragleave', this.handleDragLeave.bind(this));
    }

    handleDragStart(e) {
        this.draggedBlock = e.target.closest('.block');
        this.draggedBlock.classList.add('dragging');
        
        // Store block data
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'copy';
    }

    handleDragEnd(e) {
        if (this.draggedBlock) {
            this.draggedBlock.classList.remove('dragging');
            this.draggedBlock = null;
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        this.workspace.classList.add('drag-over');
    }

    handleDragLeave(e) {
        if (!this.workspace.contains(e.relatedTarget)) {
            this.workspace.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        this.workspace.classList.remove('drag-over');
        
        if (this.draggedBlock) {
            const blockCopy = this.createBlockCopy(this.draggedBlock);
            this.addBlockToWorkspace(blockCopy);
        }
    }

    createBlockCopy(originalBlock) {
        const copy = originalBlock.cloneNode(true);
        copy.draggable = false;
        copy.classList.remove('dragging');
        
        // Add remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-button';
        removeButton.innerHTML = '×';
        removeButton.onclick = () => this.removeBlock(copy);
        copy.appendChild(removeButton);
        
        // Handle special block types
        const blockType = copy.getAttribute('data-block-type');
        if (blockType === 'repeat') {
            this.setupRepeatBlock(copy);
        }
        
        return copy;
    }

    setupRepeatBlock(block) {
        // Create container for nested blocks
        const container = document.createElement('div');
        container.className = 'repeat-container';
        container.innerHTML = '<div class="repeat-drop-zone">여기에 반복할 블록을 드래그하세요</div>';
        
        // Setup nested drop zone
        const dropZone = container.querySelector('.repeat-drop-zone');
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
            
            if (this.draggedBlock && this.canNestBlock(this.draggedBlock)) {
                const nestedBlock = this.createBlockCopy(this.draggedBlock);
                nestedBlock.classList.add('nested-block');
                
                if (dropZone.children.length === 0) {
                    dropZone.innerHTML = '';
                }
                dropZone.appendChild(nestedBlock);
            }
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });
        
        block.appendChild(container);
    }

    canNestBlock(block) {
        const blockType = block.getAttribute('data-block-type');
        // Don't allow nesting repeat blocks (prevent infinite recursion)
        return blockType !== 'repeat';
    }

    addBlockToWorkspace(block) {
        // Remove placeholder text if it exists
        const dropZone = this.workspace.querySelector('.drop-zone');
        if (dropZone) {
            this.workspace.removeChild(dropZone);
        }
        
        this.workspace.appendChild(block);
        this.blocks.push(block);
        
        // Add to mobile touch handlers if needed
        if (document.body.classList.contains('mobile-device')) {
            this.addMobileTouchToBlock(block);
        }
    }

    addMobileTouchToBlock(block) {
        let startY, startTop;
        
        block.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startTop = block.offsetTop;
        });
        
        block.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            block.style.transform = `translateY(${deltaY}px)`;
        });
        
        block.addEventListener('touchend', () => {
            block.style.transform = '';
        });
    }

    removeBlock(block) {
        const index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
        }
        
        if (block.parentNode) {
            block.parentNode.removeChild(block);
        }
        
        // Add placeholder if workspace is empty
        if (this.blocks.length === 0) {
            this.addPlaceholder();
        }
    }

    addPlaceholder() {
        const placeholder = document.createElement('div');
        placeholder.className = 'drop-zone';
        placeholder.textContent = '여기에 블록을 드래그하세요';
        placeholder.setAttribute('data-i18n', 'drag_blocks_here');
        this.workspace.appendChild(placeholder);
    }

    clearWorkspace() {
        this.workspace.innerHTML = '';
        this.blocks = [];
        this.addPlaceholder();
    }

    getProgram() {
        const program = [];
        
        this.blocks.forEach(block => {
            const command = this.blockToCommand(block);
            if (command) {
                program.push(command);
            }
        });
        
        return program;
    }

    blockToCommand(block) {
        const blockType = block.getAttribute('data-block-type');
        
        switch (blockType) {
            case 'move-forward':
                return { type: 'move-forward' };
                
            case 'turn-left':
                return { type: 'turn-left' };
                
            case 'turn-right':
                return { type: 'turn-right' };
                
            case 'repeat':
                const countInput = block.querySelector('.repeat-count');
                const count = countInput ? parseInt(countInput.value) || 2 : 2;
                const children = this.getNestedCommands(block);
                return { 
                    type: 'repeat', 
                    count: count,
                    children: children
                };
                
            case 'if-wall':
                // TODO: Implement conditional logic
                return { type: 'if-wall' };
                
            default:
                console.warn('Unknown block type:', blockType);
                return null;
        }
    }

    getNestedCommands(repeatBlock) {
        const commands = [];
        const container = repeatBlock.querySelector('.repeat-container .repeat-drop-zone');
        
        if (container) {
            const nestedBlocks = container.querySelectorAll('.nested-block');
            nestedBlocks.forEach(nestedBlock => {
                const command = this.blockToCommand(nestedBlock);
                if (command) {
                    commands.push(command);
                }
            });
        }
        
        return commands;
    }

    // Visual feedback methods
    highlightBlock(block) {
        block.classList.add('success-animation');
        setTimeout(() => {
            block.classList.remove('success-animation');
        }, 500);
    }

    showError(block, message) {
        block.classList.add('error');
        
        // Show error tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'error-tooltip';
        tooltip.textContent = message;
        block.appendChild(tooltip);
        
        setTimeout(() => {
            block.classList.remove('error');
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }

    // Animation methods for program execution
    async executeVisualProgram() {
        let delay = 0;
        
        for (const block of this.blocks) {
            setTimeout(() => {
                this.highlightBlock(block);
            }, delay);
            delay += 600; // Sync with command execution timing
        }
    }

    // Utility methods
    validateProgram() {
        if (this.blocks.length === 0) {
            return { valid: false, error: '프로그램이 비어있습니다!' };
        }
        
        // Check for common issues
        let forwardCount = 0;
        let turnCount = 0;
        
        this.blocks.forEach(block => {
            const blockType = block.getAttribute('data-block-type');
            if (blockType === 'move-forward') forwardCount++;
            if (blockType === 'turn-left' || blockType === 'turn-right') turnCount++;
        });
        
        if (forwardCount === 0) {
            return { valid: false, error: '이동 블록이 필요합니다!' };
        }
        
        return { valid: true };
    }

    // Save/Load functionality for future enhancement
    serializeProgram() {
        return JSON.stringify(this.getProgram());
    }

    loadProgram(serializedProgram) {
        try {
            const program = JSON.parse(serializedProgram);
            this.clearWorkspace();
            
            // Reconstruct blocks from program
            program.forEach(command => {
                const block = this.commandToBlock(command);
                if (block) {
                    this.addBlockToWorkspace(block);
                }
            });
        } catch (error) {
            console.error('Failed to load program:', error);
        }
    }

    commandToBlock(command) {
        // TODO: Implement reverse conversion from command to block
        // This would be useful for loading saved programs or hints
        return null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlockSystem;
}