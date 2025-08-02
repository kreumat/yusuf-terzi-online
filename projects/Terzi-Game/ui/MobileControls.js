export default class MobileControls {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        
        // Create containers for the controls
        this.joystickContainer = this.scene.add.container(0, 0);
        this.actionButtonsContainer = this.scene.add.container(0, 0);
        
        // Set depth to ensure controls appear above game elements
        this.joystickContainer.setDepth(1000);
        this.actionButtonsContainer.setDepth(1000);
        
        // Set scrollFactor to 0 to fix to camera
        this.joystickContainer.setScrollFactor(0);
        this.actionButtonsContainer.setScrollFactor(0);
        
        // Initialize joystick and buttons
        this.createJoystick();
        this.createActionButtons();
        
        // Initially hide controls
        this.setVisible(false);
        
        // Bind the resize handler to this instance
        this.handleResize = this.handleResize.bind(this);
        
        // Add resize listener to show/hide controls based on screen size
        this.scene.scale.on('resize', this.handleResize, this);
        window.addEventListener('resize', this.handleResize);
        
        // Initial check with a slight delay to ensure correct size detection
        setTimeout(() => {
            this.handleResize();
        }, 100);
    }
    
    createJoystick() {
        const { width, height } = this.scene.cameras.main;
        
        // Position in bottom left with padding
        const x = 100;
        const y = height - 100;
        
        // Create joystick background
        this.joystickBg = this.scene.add.circle(x, y, 60, 0x000000, 0.7);
        this.joystickBg.setStrokeStyle(3, 0xffffff);
        
        // Create joystick handle
        this.joystickHandle = this.scene.add.circle(x, y, 25, 0xffffff, 0.7);
        
        // Add to container
        this.joystickContainer.add(this.joystickBg);
        this.joystickContainer.add(this.joystickHandle);
        
        // Make joystick interactive
        this.joystickBg.setInteractive();
        
        // Track joystick state
        this.joystickActive = false;
        this.joystickVector = { x: 0, y: 0 };
        this.joystickKeys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Set up input events
        this.setupJoystickEvents();
    }
    
    setupJoystickEvents() {
        // Track input pointer
        this.scene.input.on('pointerdown', (pointer) => {
            // Only handle input in the joystick area
            if (this.visible && Phaser.Math.Distance.Between(
                pointer.x, pointer.y,
                this.joystickBg.x, this.joystickBg.y
            ) <= 50) {
                this.joystickActive = true;
                this.processJoystickMovement(pointer);
            }
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (this.visible && this.joystickActive) {
                this.processJoystickMovement(pointer);
            }
        });
        
        this.scene.input.on('pointerup', () => {
            if (this.visible && this.joystickActive) {
                this.joystickActive = false;
                this.resetJoystick();
            }
        });
        
        this.scene.input.on('pointerout', () => {
            if (this.visible && this.joystickActive) {
                this.joystickActive = false;
                this.resetJoystick();
            }
        });
    }
    
    processJoystickMovement(pointer) {
        // Calculate distance from center
        const distance = Phaser.Math.Distance.Between(
            pointer.x, pointer.y,
            this.joystickBg.x, this.joystickBg.y
        );
        
        // Calculate angle
        const angle = Phaser.Math.Angle.Between(
            this.joystickBg.x, this.joystickBg.y,
            pointer.x, pointer.y
        );
        
        // Maximum handle distance
        const maxDistance = 40;
        
        // Set handle position with clamping to max distance
        const clampedDistance = Math.min(distance, maxDistance);
        const handleX = this.joystickBg.x + clampedDistance * Math.cos(angle);
        const handleY = this.joystickBg.y + clampedDistance * Math.sin(angle);
        this.joystickHandle.setPosition(handleX, handleY);
        
        // Calculate normalized vector (-1 to 1)
        const normalizedX = Math.cos(angle) * (clampedDistance / maxDistance);
        const normalizedY = Math.sin(angle) * (clampedDistance / maxDistance);
        
        // Update joystick vector
        this.joystickVector = { x: normalizedX, y: normalizedY };
        
        // Convert to directional inputs (for WASD emulation)
        // Using a deadzone of 0.3
        const deadzone = 0.3;
        this.joystickKeys = {
            up: normalizedY < -deadzone,
            down: normalizedY > deadzone,
            left: normalizedX < -deadzone,
            right: normalizedX > deadzone
        };
    }
    
    resetJoystick() {
        // Reset handle position
        this.joystickHandle.setPosition(this.joystickBg.x, this.joystickBg.y);
        
        // Reset joystick state
        this.joystickVector = { x: 0, y: 0 };
        this.joystickKeys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }
    
    createActionButtons() {
        const { width, height } = this.scene.cameras.main;
        
        // Button style
        const buttonStyle = {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        };
        
        // Create F button
        this.fButton = this.createActionButton(
            width - 160, height - 100, 
            "F", 0x8c3d3d, 60, 
            () => this.handleFButtonPress()
        );
        
        // Create ESC button
        this.escButton = this.createActionButton(
            width - 60, height - 100,
            "ESC", 0x3d5c8c, 60,
            () => this.handleEscButtonPress()
        );
        
        // Add to container
        this.actionButtonsContainer.add([
            this.fButton.bg, this.fButton.text,
            this.escButton.bg, this.escButton.text
        ]);
    }
    
    createActionButton(x, y, label, color, size, callback) {
        // Create background circle
        const bg = this.scene.add.circle(x, y, size, color, 0.8);
        bg.setStrokeStyle(3, 0xffffff);
        
        // Create text
        const text = this.scene.add.text(x, y, label, {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#ffffff'
        });
        text.setOrigin(0.5);
        
        // Make interactive
        bg.setInteractive();
        
        // Add events
        bg.on('pointerdown', () => {
            bg.fillAlpha = 1;
            text.y += 2; // Press effect
        });
        
        bg.on('pointerup', () => {
            bg.fillAlpha = 0.7;
            text.y -= 2; // Release effect
            callback();
        });
        
        bg.on('pointerout', () => {
            bg.fillAlpha = 0.7;
            text.y = y; // Reset position if pointer leaves
        });
        
        return { bg, text };
    }
    
    handleFButtonPress() {
        // Simulate F key press
        const keyEvent = new KeyboardEvent('keydown', {
            code: 'KeyF',
            key: 'f',
            keyCode: 70,
            which: 70,
            bubbles: true
        });
        document.dispatchEvent(keyEvent);
        
        // Notify the scene that F was pressed
        if (this.scene.fButtonPressed) {
            this.scene.fButtonPressed();
        }
    }
    
    handleEscButtonPress() {
        // Call the pause game method directly
        if (this.scene.pauseGame) {
            this.scene.pauseGame();
        }
    }
    
    handleResize() {
        // Get both the game size and window size
        const gameSize = this.scene.scale.gameSize;
        const windowWidth = window.innerWidth;
        
        // Show controls on small screens (less than 1024px wide)
        // Check both game size and window size to be sure
        const shouldBeVisible = gameSize.width < 1024 || windowWidth < 1024;
        
        console.log('Screen size check:', {
            gameWidth: gameSize.width,
            windowWidth: windowWidth,
            shouldShowControls: shouldBeVisible
        });
        
        this.setVisible(shouldBeVisible);
        
        // Update positions based on new size
        if (shouldBeVisible) {
            this.updatePositions();
        }
    }
    
    updatePositions() {
        const { width, height } = this.scene.cameras.main;
        
        // Update joystick position
        this.joystickBg.setPosition(100, height - 100);
        this.joystickHandle.setPosition(100, height - 100);
        
        // Update action buttons position
        this.fButton.bg.setPosition(width - 160, height - 100);
        this.fButton.text.setPosition(width - 160, height - 100);
        this.escButton.bg.setPosition(width - 60, height - 100);
        this.escButton.text.setPosition(width - 60, height - 100);
    }
    
    setVisible(visible) {
        this.visible = visible;
        this.joystickContainer.setVisible(visible);
        this.actionButtonsContainer.setVisible(visible);
    }
    
    update() {
        // No need to update if not visible
        if (!this.visible) return;
        
        // Return joystick state to be used by the game scene
        return {
            keys: this.joystickKeys,
            vector: this.joystickVector
        };
    }
}