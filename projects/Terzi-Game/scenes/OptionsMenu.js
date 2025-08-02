import Button from '../ui/Button.js';

export default class OptionsMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'OptionsMenu' });
        
        // Track which scene launched this menu
        this.fromScene = 'MainMenu';
    }

    preload() {
        // Load assets
        this.load.image('yusuf', './images/yusuf.png');
        this.load.image('locked', './images/locked.png');
        this.load.audio('game-music', './sounds/game_music.mp3');
    }

    create(data) {
        // Check if we have data about where we came from
        if (data && data.fromScene) {
            this.fromScene = data.fromScene;
        }
        
        // Add ESC key handling to return to game
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', this.handleBackAction, this);
        
        // Make sure this scene has highest depth
        this.scene.bringToTop();
        
        // Set up background (fully opaque black background)
        const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
        bg.setOrigin(0);
        bg.setAlpha(1); // Fully opaque
        bg.setDepth(-1); // Put behind other UI elements

        // Add title with higher depth
        this.title = this.add.text(this.cameras.main.width / 2, 80, 'OPTIONS', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        });
        this.title.setOrigin(0.5);

        // Create back button
        this.backButton = new Button(
            this,
            100,
            64,
            'BACK',
            () => this.handleBackAction(),
            {
                width: 128,
                height: 48,
                fontSize: 16
            }
        );

        // Create options section
        this.createOptions();

        // Create credits section
        this.createCredits();

        // Initialize music
        this.initializeMusic();
    }

    createOptions() {
        const centerX = this.cameras.main.width / 2;
        const startY = 180;
        const spacing = 64;
        
        // Define colors for toggle states
        this.COLOR_ON = 0x3d8c40;  // Green for ON state
        this.COLOR_OFF = 0x8c3d3d; // Red for OFF state

        // Music option label
        this.add.text(centerX - 150, startY, 'Music:', {
            fontFamily: 'VT323',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Get saved music preference (default is OFF)
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';

        // Music toggle button
        this.musicToggle = new Button(
            this,
            centerX + 100,
            startY,
            musicEnabled ? 'ON' : 'OFF',
            () => {
                this.toggleMusic();
            },
            {
                width: 96,
                height: 48,
                fontSize: 16,
                backgroundColor: musicEnabled ? this.COLOR_ON : this.COLOR_OFF,
                hoverColor: musicEnabled ? 0x4da050 : 0xa04d4d  // Slightly lighter hover colors
            }
        );

        // Sound effects option label
        this.add.text(centerX - 150, startY + spacing, 'Sound Effects:', {
            fontFamily: 'VT323',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Sound effects toggle (always ON and disabled)
        this.sfxToggle = new Button(
            this,
            centerX + 100,
            startY + spacing,
            'ON',
            () => {
                // No action, this toggle is disabled
            },
            {
                width: 96,
                height: 48,
                fontSize: 16,
                backgroundColor: 0x3d8c40,
                disableInteractive: true
            }
        );
        
        // Visually indicate this option is locked - position it to the right of the button
        // Calculate right edge of button (center + half width) and add small margin
        const buttonRightEdge = centerX + 100 + (96 / 2);
        
        // Add lock image instead of emoji text
        const lockIcon = this.add.image(buttonRightEdge + 16, startY + spacing, 'locked');
        
        // Scale the lock image to appropriate size
        const lockScale = 0.75; // Adjust this value as needed for proper sizing
        lockIcon.setScale(lockScale);
        
        // Set origin to properly align with button
        lockIcon.setOrigin(0, 0.5); // Align left edge with position, center vertically
    }

    createCredits() {
        const centerX = this.cameras.main.width / 2;
        const startY = 340;

        // Credits title
        this.add.text(centerX, startY, 'CREDITS', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Creator text
        this.add.text(centerX, startY + 48, 'Made by Yusuf Terzi', {
            fontFamily: 'VT323',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Creator image
        const yusufImage = this.add.image(centerX, startY + 128, 'yusuf');
        
        // Scale to max width of 100px
        const scale = Math.min(1, 100 / yusufImage.width);
        yusufImage.setScale(scale);
    }

    initializeMusic() {
        // Create music instance if it doesn't exist
        if (!this.game.music) {
            this.game.music = this.sound.add('game-music', {
                loop: true,
                volume: 0.7
            });
        }

        // Check saved preference
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        
        // Start music if enabled
        if (musicEnabled && !this.game.music.isPlaying) {
            this.game.music.play();
        }
    }

    handleBackAction() {
        if (this.fromScene === 'GameScene') {
            // Return to game and resume
            this.scene.stop();
            const gameScene = this.scene.get('GameScene');
            this.scene.resume('GameScene');
            gameScene.resumeGame();
        } else {
            // Return to main menu
            this.scene.start('MainMenu');
        }
    }
    
    toggleMusic() {
        // Get current state
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        
        // Toggle state
        const newState = !musicEnabled;
        
        // Save new state
        localStorage.setItem('musicEnabled', newState);
        
        // Update button text
        this.musicToggle.buttonText.setText(newState ? 'ON' : 'OFF');
        
        // Update button colors using the new method
        const newColor = newState ? this.COLOR_ON : this.COLOR_OFF;
        const newHoverColor = newState ? 0x4da050 : 0xa04d4d;
        
        this.musicToggle.setBackgroundColor(newColor);
        this.musicToggle.options.hoverColor = newHoverColor;
        
        // Start or stop music
        if (newState) {
            if (!this.game.music.isPlaying) {
                this.game.music.play();
            }
        } else {
            if (this.game.music.isPlaying) {
                this.game.music.stop();
            }
        }
    }
}