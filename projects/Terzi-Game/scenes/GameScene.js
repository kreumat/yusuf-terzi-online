import MobileControls from '../ui/MobileControls.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Define movement keys
        this.keys = null;
        
        // Cat character
        this.cat = null;
        
        // Map layers
        this.collisionLayer = null;
        
        // Movement speed
        this.catSpeed = 100;
        
        // Objectives state
        this.objectiveState = 'talkToChicken'; // Initial objective
        
        // Speech recognition
        this.recognition = null;
        this.isListening = false;
        
        // Mobile controls
        this.mobileControls = null;
        
        // Flag to track if we're on a mobile device
        this.isMobileDevice = window.innerWidth < 1024;
        
        console.log("GameScene: Initializing with screen width", window.innerWidth, "isMobile:", this.isMobileDevice);
    }
    
    preload() {
        // Load the Tiled map
        this.load.tilemapTiledJSON('map', 'map.json');
        
        // Load tilesets based on the map.json
        this.load.image('fence_alt', 'images/tiled_images/fence_alt.png');
        this.load.image('grass', 'images/tiled_images/grass.png');
        this.load.image('collusion', 'images/tiled_images/grass_tile.png');
        this.load.image('treetop', 'images/tiled_images/treetop.png');
        this.load.image('watergrass', 'images/tiled_images/watergrass.png');
        this.load.image('bridge_and_fences', 'images/tiled_images/bridge_and_fences.png');
        this.load.image('trunk_withnoshadows', 'images/tiled_images/trunk_withnoshadows.png');
        
        // Load cat sprite sheet
        this.load.spritesheet('cat', 'images/cat/white_cat.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        
        // Load chicken sprite sheet and portrait
        this.load.spritesheet('chicken', 'images/chicken/chicken_eat_front.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('chickenPortrait', 'images/chicken/chicken_portrait.png');
        
        // Load UI mark sprites
        this.load.spritesheet('marks', 'images/ui/marks.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Load campfire spritesheets
        this.load.spritesheet('campfire', 'images/campfire/campfire_burning.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('campfireNotBurning', 'images/campfire/campfire_notburning.png', {
            frameWidth: 32,
            frameHeight: 64
        });
        
        // Load sound effects
        this.load.audio('firePutout', 'sounds/fire_putout.mp3');
    }
    
    create() {
        // Create the map
        const map = this.make.tilemap({ key: 'map' });
        
        // Add tilesets
        const fenceAltTileset = map.addTilesetImage('fence_alt', 'fence_alt');
        const grassTileset = map.addTilesetImage('grass', 'grass');
        const collusionTileset = map.addTilesetImage('collusion', 'collusion');
        const treetopTileset = map.addTilesetImage('treetop', 'treetop');
        const watergrassTileset = map.addTilesetImage('watergrass', 'watergrass');
        const bridgeAndFencesTileset = map.addTilesetImage('bridge_and_fences', 'bridge_and_fences');
        const trunkTileset = map.addTilesetImage('trunk_withnoshadows', 'trunk_withnoshadows');
        
        // Create layers in order
        const landLayer = map.createLayer('land', [grassTileset]);
        const riverLayer = map.createLayer('river', [watergrassTileset]);
        const fenceLayer = map.createLayer('fence', [fenceAltTileset]);
        const bridgeBackFenceLayer = map.createLayer('bridgebackfence', [bridgeAndFencesTileset]);
        const bridgeLayer = map.createLayer('bridge', [bridgeAndFencesTileset]);
        
        // Create cat character at tile coordinates (4, 4)
        this.cat = this.physics.add.sprite(128, 128, 'cat', 0);
        this.cat.setOrigin(0.5);
        this.cat.setCollideWorldBounds(true);
        
        // Add chicken NPC at top-right (4 tiles from right, 4 tiles from top)
        // Calculate position based on map dimensions and tile size
        const mapWidth = map.width * map.tileWidth;
        const mapHeight = map.height * map.tileHeight;
        this.chicken = this.physics.add.sprite(
            mapWidth - 4 * 32, // 4 tiles from the right edge
            4 * 32, // 4 tiles from the top edge
            'chicken', 
            0
        );
        this.chicken.setImmovable(true);
        this.chicken.setScale(0.8); // Scale down the chicken for better proportion
        
        // Add campfire - Use origin point at bottom center for consistent positioning
        // when switching between different height sprites
        this.campfire = this.physics.add.sprite(
            mapWidth / 2, 
            mapHeight / 2 + 48, // Move campfire further down for better map integration
            'campfire',
            0
        );
        this.campfire.setImmovable(true);
        this.campfire.setOrigin(0.5, 1.0); // Set origin to bottom center for consistent ground position
        
        // Create the bridge front fence layer (displayed above the cat)
        const bridgeFrontFenceLayer = map.createLayer('bidgeforwardfence', [bridgeAndFencesTileset]);
        
        // Create tree and treetop layers (displayed above the cat)
        const treeLayer = map.createLayer('tree', [trunkTileset]);
        const treetopLayer = map.createLayer('treetop', [treetopTileset]);
        
        // Set appropriate depths for proper layering
        this.campfire.setDepth(10); // Between ground and trees
        this.chicken.setDepth(15);
        riverLayer.setDepth(16);
        fenceLayer.setDepth(17);
        bridgeBackFenceLayer.setDepth(18);
        bridgeLayer.setDepth(19);
        this.cat.setDepth(20); // Player above bridge floor but below front fence
        treeLayer.setDepth(25); // Tree trunk layer appears in front of player
        bridgeFrontFenceLayer.setDepth(35);
        treetopLayer.setDepth(40);
        
        // Set up collision layer
        this.collisionLayer = map.createLayer('collusion', [collusionTileset]);
        
        // Make collision layer invisible (it's just for collision detection)
        this.collisionLayer.setVisible(false);
        
        // Set up collisions
        this.collisionLayer.setCollisionByExclusion([-1]);
        
        // Make sure the collision layer properly reflects the map structure
        // Create a walkable path across the bridge by removing collision ONLY from the exact bridge tiles
        // The bridge is at row 3, columns 5-6
        const bridgeTile1 = this.collisionLayer.getTileAt(5, 3);
        const bridgeTile2 = this.collisionLayer.getTileAt(6, 3);
        if (bridgeTile1) bridgeTile1.setCollision(false);
        if (bridgeTile2) bridgeTile2.setCollision(false);
        
        // Make sure the bridge layer itself is walkable (no collision)
        // This ensures the cat can cross the bridge
        bridgeLayer.setCollisionByExclusion([]); // No collision on bridge floor
        
        // Make sure water and fences have collision
        fenceLayer.setCollisionByExclusion([-1]);
        
        // Add collider for fence
        this.physics.add.collider(this.cat, fenceLayer);
        
        this.physics.add.collider(this.cat, this.collisionLayer);
        this.physics.add.collider(this.cat, this.chicken);
        this.physics.add.collider(this.cat, this.campfire);
        
        // Create cat animations
        this.createCatAnimations();
        
        // Create chicken animations
        this.createChickenAnimations();
        
        // Create mark animations
        this.createMarkAnimations();
        
        // Create campfire animation
        this.createCampfireAnimations();
        
        // Add animated mark above chicken
        this.chickenMark = this.add.sprite(
            this.chicken.x,
            this.chicken.y - 35, // Position above chicken
            'marks',
            8 // Second row, first frame (frames are 0-indexed)
        );
        this.chickenMark.setScale(0.8); // Scale down to match chicken
        
        // Play the active mark animation (second row)
        this.chickenMark.anims.play('mark_active');
        
        // Set up keyboard input
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            esc: Phaser.Input.Keyboard.KeyCodes.ESC,
            f: Phaser.Input.Keyboard.KeyCodes.F
        });
        
        // Add ESC key event for pausing
        this.keys.esc.on('down', this.pauseGame, this);
        
        // Set world bounds to match map size
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        
        // Set up camera to follow the cat and stay within map boundaries
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.cat, true);
        this.cameras.main.setZoom(2); // Zoom in for better visibility
        
        // Create objectives panel (fixed to camera)
        this.createObjectivesPanel();
        
        // Create interaction prompt (invisible initially)
        this.interactionPrompt = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            "Say 'Hello' to talk to the chicken",
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '10px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.interactionPrompt.setOrigin(0.5);
        this.interactionPrompt.setScrollFactor(0); // Fixed to camera
        this.interactionPrompt.setDepth(200);
        this.interactionPrompt.setVisible(false);
        
        // Create fire interaction prompt (invisible initially)
        this.firePrompt = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            "Press F to extinguish the fire",
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '10px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        this.firePrompt.setOrigin(0.5);
        this.firePrompt.setScrollFactor(0); // Fixed to camera
        this.firePrompt.setDepth(200);
        this.firePrompt.setVisible(false);
        
        // Initialize speech recognition
        this.initSpeechRecognition();
        
        // Start animations
        this.chicken.anims.play('chicken_eat');
        this.campfire.anims.play('campfire_burning');
        
        // NOTE: We are now using HTML-based mobile controls instead of Phaser-based ones
        // This provides better touch handling and visibility on mobile devices
        console.log("GameScene: Using HTML-based mobile controls");
        
        // Export game instance to window for HTML controls to access
        window.gameInstance = this;
        
        // Set a global property to identify this scene for mobile controls
        this.registry.set('activeScene', 'GameScene');
    }
    
    createCatAnimations() {
        // Moving right animation (first row, frames 0-2)
        this.anims.create({
            key: 'cat_right',
            frames: this.anims.generateFrameNumbers('cat', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Moving up animation (second row, frames 3-5)
        this.anims.create({
            key: 'cat_up',
            frames: this.anims.generateFrameNumbers('cat', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Moving down animation (third row, frames 6-8)
        this.anims.create({
            key: 'cat_down',
            frames: this.anims.generateFrameNumbers('cat', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Moving left animation (fourth row, frames 9-11)
        this.anims.create({
            key: 'cat_left',
            frames: this.anims.generateFrameNumbers('cat', { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });
    }
    
    createChickenAnimations() {
        // Create chicken eating animation (frames 0-3 and back to 0)
        this.anims.create({
            key: 'chicken_eat',
            frames: [
                { key: 'chicken', frame: 0 },
                { key: 'chicken', frame: 1 },
                { key: 'chicken', frame: 2 },
                { key: 'chicken', frame: 3 },
                { key: 'chicken', frame: 2 },
                { key: 'chicken', frame: 1 },
                { key: 'chicken', frame: 0 }
            ],
            frameRate: 4,
            repeat: -1
        });
    }
    
    createMarkAnimations() {
        // Create active mark animation (second row - 8-15)
        this.anims.create({
            key: 'mark_active',
            frames: [
                { key: 'marks', frame: 8 },
                { key: 'marks', frame: 9 },
                { key: 'marks', frame: 10 },
                { key: 'marks', frame: 11 },
                { key: 'marks', frame: 12 },
                { key: 'marks', frame: 13 },
                { key: 'marks', frame: 14 },
                { key: 'marks', frame: 15 },
                { key: 'marks', frame: 14 },
                { key: 'marks', frame: 13 },
                { key: 'marks', frame: 12 },
                { key: 'marks', frame: 11 },
                { key: 'marks', frame: 10 },
                { key: 'marks', frame: 9 },
                { key: 'marks', frame: 10 },
                { key: 'marks', frame: 11 },
                { key: 'marks', frame: 12 },
                { key: 'marks', frame: 13 },
                { key: 'marks', frame: 14 },
                { key: 'marks', frame: 15 },
                { key: 'marks', frame: 14 },
                { key: 'marks', frame: 13 },
                { key: 'marks', frame: 12 },
                { key: 'marks', frame: 11 },
                { key: 'marks', frame: 10 },
                { key: 'marks', frame: 9 }
            ],
            frameRate: 8,
            repeat: -1
        });
        
        // Create completed mark animation (first row - 0-7)
        this.anims.create({
            key: 'mark_completed',
            frames: [
                { key: 'marks', frame: 0 },
                { key: 'marks', frame: 1 },
                { key: 'marks', frame: 2 },
                { key: 'marks', frame: 3 },
                { key: 'marks', frame: 4 },
                { key: 'marks', frame: 5 },
                { key: 'marks', frame: 6 },
                { key: 'marks', frame: 7 },
                { key: 'marks', frame: 6 },
                { key: 'marks', frame: 5 },
                { key: 'marks', frame: 4 },
                { key: 'marks', frame: 3 },
                { key: 'marks', frame: 2 },
                { key: 'marks', frame: 1 },
                { key: 'marks', frame: 2 },
                { key: 'marks', frame: 3 },
                { key: 'marks', frame: 4 },
                { key: 'marks', frame: 5 },
                { key: 'marks', frame: 6 },
                { key: 'marks', frame: 7 },
                { key: 'marks', frame: 6 },
                { key: 'marks', frame: 5 },
                { key: 'marks', frame: 4 },
                { key: 'marks', frame: 3 },
                { key: 'marks', frame: 2 },
                { key: 'marks', frame: 1 }
            ],
            frameRate: 8,
            repeat: -1
        });
    }
    
    createCampfireAnimations() {
        // Create campfire burning animation
        this.anims.create({
            key: 'campfire_burning',
            frames: this.anims.generateFrameNumbers('campfire', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        // Create extinguished campfire animation
        this.anims.create({
            key: 'campfire_extinguished',
            frames: this.anims.generateFrameNumbers('campfireNotBurning', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        
        // Create extinguishing transition animation
        this.anims.create({
            key: 'campfire_extinguishing',
            frames: [
                { key: 'campfire', frame: 0 },
                { key: 'campfire', frame: 1 },
                { key: 'campfire', frame: 2 },
                { key: 'campfire', frame: 3 },
                { key: 'campfire', frame: 2 },
                { key: 'campfire', frame: 1 },
                { key: 'campfire', frame: 0 }
            ],
            frameRate: 12,
            repeat: 0
        });
    }
    
    createObjectivesPanel() {
        // Create a panel for objectives at the bottom-left of the screen
        this.objectivesPanel = this.add.container(10, this.cameras.main.height - 50);
        this.objectivesPanel.setScrollFactor(0); // Fixed to camera
        this.objectivesPanel.setDepth(1000); // Ensure it's on top of everything
        
        // Add background
        const panelBg = this.add.rectangle(0, 0, 200, 40, 0x000000, 0.8);
        panelBg.setOrigin(0, 0);
        this.objectivesPanel.add(panelBg);
        
        // Add header text
        const headerText = this.add.text(10, 5, "OBJECTIVE:", {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#ffff00',
            align: 'left'
        });
        this.objectivesPanel.add(headerText);
        
        // Add objective text
        this.objectiveText = this.add.text(10, 20, "Talk to the chicken", {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            color: '#ffffff',
            align: 'left'
        });
        this.objectivesPanel.add(this.objectiveText);
    }
    
    initSpeechRecognition() {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure speech recognition
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            // Set up event handlers
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log('Speech recognized:', transcript);
                
                // Check if the player said "hello"
                if (transcript.includes('hello')) {
                    this.handleChickenInteraction();
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                
                // Only restart if we're in the right objective state and near the chicken
                if (this.objectiveState === 'talkToChicken' && this.isNearChicken()) {
                    this.startListening();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }
    
    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
                console.log('Listening for speech...');
            } catch (e) {
                console.error('Error starting speech recognition:', e);
            }
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                this.isListening = false;
                console.log('Stopped listening');
            } catch (e) {
                console.error('Error stopping speech recognition:', e);
            }
        }
    }
    
    isNearChicken() {
        // Check if player is near the chicken (within 2 tiles = 64 pixels)
        const distance = Phaser.Math.Distance.Between(
            this.cat.x, this.cat.y,
            this.chicken.x, this.chicken.y
        );
        return distance < 64;
    }
    
    isNearCampfire() {
        // Check if player is near the campfire (within 2 tiles = 64 pixels)
        const distance = Phaser.Math.Distance.Between(
            this.cat.x, this.cat.y,
            this.campfire.x, this.campfire.y
        );
        return distance < 64;
    }
    
    handleChickenInteraction() {
        // Only proceed if we haven't talked to the chicken yet
        if (this.objectiveState !== 'talkToChicken') return;
        
        // Stop listening
        this.stopListening();
        
        // Hide the interaction prompt
        this.interactionPrompt.setVisible(false);
        
        // Show dialogue
        this.showChickenDialogue();
        
        // Change mark animation to completed
        this.chickenMark.anims.play('mark_completed');
        
        // Update objective state
        this.objectiveState = 'putOutFire';
    }
    
    showChickenDialogue() {
        // Create dialogue panel
        this.dialoguePanel = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
        this.dialoguePanel.setScrollFactor(0); // Fixed to camera
        this.dialoguePanel.setDepth(200);
        
        // Add background
        const dialogueBg = this.add.rectangle(0, 0, 400, 150, 0x000000, 0.9);
        dialogueBg.setOrigin(0.5);
        this.dialoguePanel.add(dialogueBg);
        
        // Add chicken portrait (left side)
        const portrait = this.add.image(-150, 0, 'chickenPortrait');
        portrait.setOrigin(0.5);
        portrait.setScale(2);
        this.dialoguePanel.add(portrait);
        
        // Add dialogue text
        const dialogueText = this.add.text(0, 0, "Can you put out the campfire for me?", {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 200 }
        });
        dialogueText.setOrigin(0.5);
        this.dialoguePanel.add(dialogueText);
        
        // Update objective text
        this.updateObjective("Put out the fire");
        
        // Auto-close dialogue after 5 seconds
        this.time.delayedCall(5000, () => {
            this.dialoguePanel.destroy();
        });
    }
    
    updateObjective(text) {
        // Update the objective text
        this.objectiveText.setText(text);
    }
    
    pauseGame() {
        console.log("Pause/ESC button pressed");
        
        // Check if OptionsMenu is active - if so, resume game instead
        if (this.scene.isActive('OptionsMenu')) {
            // Options menu is open, close it and resume game
            this.scene.stop('OptionsMenu');
            this.resumeGame();
        } else {
            // Pause physics and animations
            this.physics.pause();
            this.anims.pauseAll();
            
            // Pause the scene
            this.scene.pause();
            
            // Create a semi-transparent overlay to darken the game
            if (!this.pauseOverlay) {
                this.pauseOverlay = this.add.rectangle(
                    0, 0,
                    this.cameras.main.width * 2, // Make it larger than the camera view
                    this.cameras.main.height * 2,
                    0x000000, 0.5
                );
                this.pauseOverlay.setScrollFactor(0); // Fixed to camera
                this.pauseOverlay.setDepth(1000); // Very high depth
                this.pauseOverlay.setOrigin(0, 0);
                this.pauseOverlay.visible = false;
            }
            
            // Make overlay visible
            this.pauseOverlay.visible = true;
            
            // Start options menu with context that we're coming from game
            this.scene.launch('OptionsMenu', { fromScene: 'GameScene' });
            
            // Make sure options menu is on top
            this.scene.bringToTop('OptionsMenu');
        }
    }
    
    resumeGame() {
        // Resume physics and animations
        this.physics.resume();
        this.anims.resumeAll();
        
        // Hide the pause overlay if it exists
        if (this.pauseOverlay) {
            this.pauseOverlay.visible = false;
        }
    }
    
    fButtonPressed() {
        // This method is called directly by the mobile controls
        console.log("F button pressed from mobile controls");
        
        // Check if near campfire and in correct state
        if (this.isNearCampfire() && this.objectiveState === 'putOutFire') {
            // We're near the campfire and in the right state, extinguish it
            this.handlePutOutFire();
        } else {
            console.log("F button pressed but not near campfire or wrong state:", 
                        "Near campfire:", this.isNearCampfire(), 
                        "State:", this.objectiveState);
        }
    }
    
    
    update() {
        // Reset velocity
        this.cat.setVelocity(0);
        
        // Track if any movement is happening (from keyboard or virtual joystick)
        let isMoving = false;
        
        // We no longer need to check Phaser-based mobile controls
        // as we're using HTML-based controls that directly manipulate key states
        
        // Handle keyboard movement input
        if (this.keys.up.isDown) {
            this.cat.setVelocityY(-this.catSpeed);
            this.cat.anims.play('cat_up', true);
            isMoving = true;
        } else if (this.keys.down.isDown) {
            this.cat.setVelocityY(this.catSpeed);
            this.cat.anims.play('cat_down', true);
            isMoving = true;
        }
        
        if (this.keys.left.isDown) {
            this.cat.setVelocityX(-this.catSpeed);
            this.cat.anims.play('cat_left', true);
            isMoving = true;
        } else if (this.keys.right.isDown) {
            this.cat.setVelocityX(this.catSpeed);
            this.cat.anims.play('cat_right', true);
            isMoving = true;
        }
        
        // The HTML mobile controls directly set key states, so we don't need 
        // additional code to check for mobile input - it's handled like keyboard input
        
        // If no movement is happening, stop animations
        if (!isMoving) {
            this.cat.anims.stop();
        }
        
        // Handle diagonal movement (normalize velocity)
        if (this.cat.body.velocity.x !== 0 && this.cat.body.velocity.y !== 0) {
            const normalizedVelocity = new Phaser.Math.Vector2(this.cat.body.velocity).normalize().scale(this.catSpeed);
            this.cat.setVelocity(normalizedVelocity.x, normalizedVelocity.y);
        }
        
        // Check proximity to chicken for interaction
        if (this.isNearChicken() && this.objectiveState === 'talkToChicken') {
            // Show interaction prompt
            this.interactionPrompt.setVisible(true);
            
            // Start listening for voice commands if not already listening
            if (!this.isListening && this.recognition) {
                this.startListening();
            }
        } else {
            // Hide interaction prompt
            this.interactionPrompt.setVisible(false);
            
            // Stop listening if we're too far from the chicken
            if (this.isListening) {
                this.stopListening();
            }
        }
        
        // Check proximity to campfire (if that's the current objective)
        if (this.objectiveState === 'putOutFire') {
            if (this.isNearCampfire()) {
                // Show fire interaction prompt
                this.firePrompt.setVisible(true);
                
                // Check for F key press when near fire
                if (Phaser.Input.Keyboard.JustDown(this.keys.f)) {
                    this.handlePutOutFire();
                }
            } else {
                // Hide fire interaction prompt when not near
                this.firePrompt.setVisible(false);
            }
        }
    }
    
    handlePutOutFire() {
        // Only proceed if we haven't already put out the fire
        if (this.objectiveState !== 'putOutFire') return;
        
        // Hide the fire prompt
        this.firePrompt.setVisible(false);
        
        // Play sound effect
        this.sound.play('firePutout');
        
        // Remove the chicken marker immediately
        if (this.chickenMark) {
            this.chickenMark.destroy();
            this.chickenMark = null;
        }
        
        // Update objective
        this.updateObjective("You completed all objectives!");
        
        // Update objective state
        this.objectiveState = 'gameFinished';
        
        // Store the original bottom position of the campfire to maintain visual consistency
        const campfireBottomY = this.campfire.y;
        
        // Add simple smoke particles with tweens before changing the texture
        for (let i = 0; i < 5; i++) {
            const smokeParticle = this.add.sprite(
                this.campfire.x + Phaser.Math.Between(-5, 5),
                campfireBottomY - 20 + Phaser.Math.Between(-5, 5),
                'campfire',
                0
            );
            smokeParticle.setAlpha(0.5);
            smokeParticle.setScale(0.3);
            
            // Simple tween to move the particle up and fade it out
            this.tweens.add({
                targets: smokeParticle,
                y: smokeParticle.y - 30,
                alpha: 0,
                scale: 0.1,
                duration: 600,
                onComplete: () => {
                    smokeParticle.destroy();
                }
            });
        }
        
        // Switch the campfire texture to the extinguished version
        // Origin is already set to bottom-center (0.5, 1.0) in create(), 
        // so it will maintain the same ground position despite being taller
        this.campfire.setTexture('campfireNotBurning');
        this.campfire.play('campfire_extinguished');
        
        // Show chicken dialogue after a short delay
        this.time.delayedCall(300, () => {
            this.showChickenThankYouDialogue();
        });
    }
    
    showChickenThankYouDialogue() {
        // Use exactly the same code as showChickenDialogue to ensure consistency
        // Create dialogue panel
        const dialoguePanel = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
        dialoguePanel.setScrollFactor(0); // Fixed to camera
        dialoguePanel.setDepth(200);
        
        // Add background
        const dialogueBg = this.add.rectangle(0, 0, 400, 150, 0x000000, 0.9);
        dialogueBg.setOrigin(0.5);
        dialoguePanel.add(dialogueBg);
        
        // Add chicken portrait (left side)
        const portrait = this.add.image(-150, 0, 'chickenPortrait');
        portrait.setOrigin(0.5);
        portrait.setScale(2);
        dialoguePanel.add(portrait);
        
        // Add dialogue text
        const dialogueText = this.add.text(0, 0, "Thank you! You finished the game!", {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 200 }
        });
        dialogueText.setOrigin(0.5);
        dialoguePanel.add(dialogueText);
        
        // Auto-close dialogue after 5 seconds using a simple timer
        this.time.delayedCall(5000, () => {
            dialoguePanel.destroy();
        });
    }
}