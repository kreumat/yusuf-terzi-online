import Button from '../ui/Button.js';

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        // Load background layers
        for (let i = 1; i <= 6; i++) {
            this.load.image(`bg-layer-${i}`, `./images/menu_background/layer-${i}.png`);
        }
    }

    create() {
        // Create background layers with parallax effect
        this.backgroundLayers = [];
        
        // Speed multipliers for each layer (from back to front)
        const speeds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
        
        // Create each layer
        for (let i = 1; i <= 6; i++) {
            // Create two instances of each layer for seamless scrolling
            const layer1 = this.add.image(0, 0, `bg-layer-${i}`);
            const layer2 = this.add.image(0, 0, `bg-layer-${i}`);
            
            // Set origin to top-left for easier positioning
            layer1.setOrigin(0, 0);
            layer2.setOrigin(0, 0);
            
            // Store layer and its speed for update method
            this.backgroundLayers.push({
                layer1: layer1,
                layer2: layer2,
                speed: speeds[i-1]
            });
        }
        
        // Add game title
        this.title = this.add.text(this.cameras.main.width / 2, 150, 'TERZI GAME', {
            fontFamily: '"Press Start 2P"',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center'
        });
        this.title.setOrigin(0.5);
        
        // Create menu buttons
        this.createMenuButtons();
    }

    createMenuButtons() {
        // Center position for buttons
        const centerX = this.cameras.main.width / 2;
        
        // Play button
        this.playButton = new Button(
            this,
            centerX,
            this.cameras.main.height / 2 + 32,
            'PLAY',
            () => {
                this.scene.start('GameScene');
            },
            {
                width: 192,
                height: 64,
                fontSize: 20
            }
        );
        
        // Options button
        this.optionsButton = new Button(
            this,
            centerX,
            this.cameras.main.height / 2 + 128,
            'OPTIONS',
            () => {
                this.scene.start('OptionsMenu');
            },
            {
                width: 192,
                height: 64,
                fontSize: 20
            }
        );
    }

    update() {
        // Update background layer positions for parallax effect
        this.backgroundLayers.forEach(bgLayer => {
            // Move both instances of the layer
            bgLayer.layer1.x -= bgLayer.speed;
            bgLayer.layer2.x -= bgLayer.speed;
            
            // When the first instance goes completely off-screen to the left
            if (bgLayer.layer1.x <= -bgLayer.layer1.width) {
                // Reset its position to the right of the second instance
                bgLayer.layer1.x = bgLayer.layer2.x + bgLayer.layer2.width;
            }
            
            // Same for the second instance
            if (bgLayer.layer2.x <= -bgLayer.layer2.width) {
                bgLayer.layer2.x = bgLayer.layer1.x + bgLayer.layer1.width;
            }
            
            // Initialize layer2 position if it's the first update
            if (bgLayer.layer2.x === 0) {
                bgLayer.layer2.x = bgLayer.layer1.width;
            }
        });
    }
}