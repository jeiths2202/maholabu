// 3D World using Three.js for Roblox Adventure
class World3D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.goal = null;
        this.walls = [];
        this.worldData = null;
        this.playerPosition = { x: 0, y: 0 };
        this.playerDirection = 'east'; // east, west, north, south
        
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 8, 8);
        this.camera.lookAt(2.5, 0, 2.5);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add lights
        this.addLights();
        
        // Add camera controls for better viewing
        this.addCameraControls();
        
        // Start render loop
        this.animate();
    }

    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
    }

    addCameraControls() {
        // Simple camera rotation for better view
        let isRotating = false;
        let lastMouseX = 0;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isRotating = true;
            lastMouseX = e.clientX;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (isRotating && this.worldData) {
                const deltaX = e.clientX - lastMouseX;
                const centerX = this.worldData.size.width / 2;
                const centerZ = this.worldData.size.height / 2;
                
                // Rotate camera around the center of the world
                const radius = 10;
                const angle = deltaX * 0.01;
                const currentAngle = Math.atan2(
                    this.camera.position.z - centerZ,
                    this.camera.position.x - centerX
                );
                const newAngle = currentAngle + angle;
                
                this.camera.position.x = centerX + radius * Math.cos(newAngle);
                this.camera.position.z = centerZ + radius * Math.sin(newAngle);
                this.camera.lookAt(centerX, 0, centerZ);
                
                lastMouseX = e.clientX;
            }
        });
        
        document.addEventListener('mouseup', () => {
            isRotating = false;
        });
    }

    loadLevel(worldData) {
        this.worldData = worldData;
        this.playerPosition = { ...worldData.player };
        this.playerDirection = worldData.player.direction;
        
        // Clear existing objects
        this.clearWorld();
        
        // Create ground
        this.createGround(worldData.size);
        
        // Create walls
        this.createWalls(worldData.walls);
        
        // Create player
        this.createPlayer(worldData.player);
        
        // Create goal
        this.createGoal(worldData.goal);
        
        // Position camera
        this.positionCamera(worldData.size);
    }

    clearWorld() {
        // Remove all objects except lights
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child.userData.type === 'game-object') {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
        });
        
        this.walls = [];
        this.player = null;
        this.goal = null;
    }

    createGround(size) {
        const groundGeometry = new THREE.PlaneGeometry(size.width, size.height);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(size.width / 2 - 0.5, -0.1, size.height / 2 - 0.5);
        ground.receiveShadow = true;
        ground.userData.type = 'game-object';
        
        this.scene.add(ground);

        // Add grid lines
        for (let i = 0; i <= size.width; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i - 0.5, 0, -0.5),
                new THREE.Vector3(i - 0.5, 0, size.height - 0.5)
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0x666666 });
            const line = new THREE.Line(geometry, material);
            line.userData.type = 'game-object';
            this.scene.add(line);
        }
        
        for (let i = 0; i <= size.height; i++) {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-0.5, 0, i - 0.5),
                new THREE.Vector3(size.width - 0.5, 0, i - 0.5)
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0x666666 });
            const line = new THREE.Line(geometry, material);
            line.userData.type = 'game-object';
            this.scene.add(line);
        }
    }

    createWalls(wallPositions) {
        wallPositions.forEach(pos => {
            const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
            const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            
            wall.position.set(pos.x, 0.5, pos.y);
            wall.castShadow = true;
            wall.userData.type = 'game-object';
            wall.userData.gameType = 'wall';
            
            this.walls.push(wall);
            this.scene.add(wall);
        });
    }

    createPlayer(playerData) {
        // Create robot-like character
        const group = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        body.castShadow = true;
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.0;
        head.castShadow = true;
        group.add(head);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.05, 0.2);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.05, 0.2);
        group.add(rightEye);
        
        // Position the player
        group.position.set(playerData.x, 0, playerData.y);
        group.userData.type = 'game-object';
        group.userData.gameType = 'player';
        
        // Set initial rotation based on direction
        this.setPlayerRotation(group, playerData.direction);
        
        this.player = group;
        this.scene.add(group);
    }

    createGoal(goalData) {
        // Create treasure chest
        const group = new THREE.Group();
        
        // Chest base
        const baseGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.6);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.2;
        base.castShadow = true;
        group.add(base);
        
        // Chest lid
        const lidGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.6);
        const lidMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const lid = new THREE.Mesh(lidGeometry, lidMaterial);
        lid.position.y = 0.45;
        lid.castShadow = true;
        group.add(lid);
        
        // Gold trim
        const trimGeometry = new THREE.BoxGeometry(0.9, 0.05, 0.7);
        const trimMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const trim = new THREE.Mesh(trimGeometry, trimMaterial);
        trim.position.y = 0.25;
        group.add(trim);
        
        // Add sparkle effect
        const sparkleGeometry = new THREE.SphereGeometry(0.02);
        const sparkleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 5; i++) {
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
            sparkle.position.set(
                (Math.random() - 0.5) * 1.5,
                0.5 + Math.random() * 0.5,
                (Math.random() - 0.5) * 1.5
            );
            group.add(sparkle);
        }
        
        group.position.set(goalData.x, 0, goalData.y);
        group.userData.type = 'game-object';
        group.userData.gameType = 'goal';
        
        // Add gentle rotation animation
        group.userData.animate = true;
        
        this.goal = group;
        this.scene.add(group);
    }

    setPlayerRotation(player, direction) {
        const rotations = {
            'east': 0,
            'south': Math.PI / 2,
            'west': Math.PI,
            'north': -Math.PI / 2
        };
        
        player.rotation.y = rotations[direction] || 0;
    }

    positionCamera(size) {
        const centerX = size.width / 2 - 0.5;
        const centerZ = size.height / 2 - 0.5;
        const maxDimension = Math.max(size.width, size.height);
        const distance = maxDimension * 1.5 + 3;
        
        this.camera.position.set(centerX + distance, distance, centerZ + distance);
        this.camera.lookAt(centerX, 0, centerZ);
    }

    async executeProgram(program) {
        if (!program || program.length === 0) {
            return { success: false, error: '프로그램이 비어있습니다!' };
        }
        
        // Reset player position
        this.playerPosition = { ...this.worldData.player };
        this.playerDirection = this.worldData.player.direction;
        this.player.position.set(this.playerPosition.x, 0, this.playerPosition.y);
        this.setPlayerRotation(this.player, this.playerDirection);
        
        let steps = 0;
        const maxSteps = 50; // Prevent infinite loops
        
        try {
            for (const command of program) {
                if (steps >= maxSteps) {
                    return { success: false, error: '프로그램이 너무 많은 단계를 실행했습니다!' };
                }
                
                const result = await this.executeCommand(command);
                if (!result.success) {
                    return result;
                }
                
                steps++;
                
                // Check if goal is reached
                if (this.playerPosition.x === this.worldData.goal.x && 
                    this.playerPosition.y === this.worldData.goal.y) {
                    const score = Math.max(100 - steps * 5, 10); // Score based on efficiency
                    return { success: true, score: score };
                }
                
                // Add delay between commands for visual effect
                await this.delay(500);
            }
            
            return { success: false, error: '목표에 도달하지 못했습니다!' };
            
        } catch (error) {
            return { success: false, error: '프로그램 실행 중 오류가 발생했습니다: ' + error.message };
        }
    }

    async executeCommand(command) {
        switch (command.type) {
            case 'move-forward':
                return await this.moveForward();
            case 'turn-left':
                return this.turnLeft();
            case 'turn-right':
                return this.turnRight();
            case 'repeat':
                return await this.executeRepeat(command);
            default:
                return { success: false, error: '알 수 없는 명령입니다: ' + command.type };
        }
    }

    async moveForward() {
        const directions = {
            'east': { x: 1, y: 0 },
            'west': { x: -1, y: 0 },
            'north': { x: 0, y: -1 },
            'south': { x: 0, y: 1 }
        };
        
        const delta = directions[this.playerDirection];
        const newX = this.playerPosition.x + delta.x;
        const newY = this.playerPosition.y + delta.y;
        
        // Check bounds
        if (newX < 0 || newX >= this.worldData.size.width || 
            newY < 0 || newY >= this.worldData.size.height) {
            return { success: false, error: '경계를 벗어날 수 없습니다!' };
        }
        
        // Check walls
        const hasWall = this.worldData.walls.some(wall => wall.x === newX && wall.y === newY);
        if (hasWall) {
            return { success: false, error: '벽에 막혔습니다!' };
        }
        
        // Move player
        this.playerPosition.x = newX;
        this.playerPosition.y = newY;
        
        // Animate movement
        await this.animatePlayerMovement(newX, newY);
        
        return { success: true };
    }

    turnLeft() {
        const rotationOrder = ['north', 'west', 'south', 'east'];
        const currentIndex = rotationOrder.indexOf(this.playerDirection);
        this.playerDirection = rotationOrder[(currentIndex + 1) % 4];
        
        this.animatePlayerRotation();
        
        return { success: true };
    }

    turnRight() {
        const rotationOrder = ['north', 'east', 'south', 'west'];
        const currentIndex = rotationOrder.indexOf(this.playerDirection);
        this.playerDirection = rotationOrder[(currentIndex + 1) % 4];
        
        this.animatePlayerRotation();
        
        return { success: true };
    }

    async executeRepeat(command) {
        const repeatCount = command.count || 2;
        const childCommands = command.children || [];
        
        for (let i = 0; i < repeatCount; i++) {
            for (const childCommand of childCommands) {
                const result = await this.executeCommand(childCommand);
                if (!result.success) {
                    return result;
                }
            }
        }
        
        return { success: true };
    }

    async animatePlayerMovement(targetX, targetY) {
        return new Promise((resolve) => {
            const startPos = this.player.position.clone();
            const endPos = new THREE.Vector3(targetX, 0, targetY);
            const duration = 500;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Smooth easing
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                this.player.position.lerpVectors(startPos, endPos, easeProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    animatePlayerRotation() {
        this.setPlayerRotation(this.player, this.playerDirection);
    }

    resetLevel() {
        if (!this.worldData) return;
        
        this.playerPosition = { ...this.worldData.player };
        this.playerDirection = this.worldData.player.direction;
        this.player.position.set(this.playerPosition.x, 0, this.playerPosition.y);
        this.setPlayerRotation(this.player, this.playerDirection);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Animate goal sparkles
        if (this.goal && this.goal.userData.animate) {
            this.goal.rotation.y += 0.01;
            
            // Animate sparkles
            this.goal.children.forEach((child, index) => {
                if (index >= 5) { // Sparkles start from index 5
                    child.position.y += Math.sin(Date.now() * 0.005 + index) * 0.002;
                }
            });
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = World3D;
}