import MainMenu from './scenes/MainMenu.js';
import OptionsMenu from './scenes/OptionsMenu.js';
import GameScene from './scenes/GameScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true, // Enable pixel art mode
    roundPixels: true, // Round pixel positions to avoid sub-pixel rendering
    antialias: false, // Disable anti-aliasing
    scene: [MainMenu, OptionsMenu, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        max: {
            width: 1024,
            height: 1024
        },
        min: {
            width: 320,
            height: 240
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Make game globally accessible for debugging
window.game = game;