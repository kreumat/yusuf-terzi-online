export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, callback, options = {}) {
        super(scene, x, y);
        
        // Ensure position is aligned to 32px grid
        this.x = Math.round(x / 32) * 32;
        this.y = Math.round(y / 32) * 32;
        
        // Default options
        const defaults = {
            fontSize: 16,
            padding: { x: 16, y: 8 },
            backgroundColor: 0x6b4f74,
            hoverColor: 0x9670a3,
            pressColor: 0x4c384f,
            textColor: 0xffffff,
            width: 0, // Auto size based on text by default
            height: 0, // Auto size based on text by default
            disableInteractive: false
        };
        
        // Merge provided options with defaults
        this.options = { ...defaults, ...options };
        
        // Store callback
        this.callback = callback;
        
        // Create button components
        this.createButton(text);
        
        // Add to the scene
        scene.add.existing(this);
    }
    
    createButton(text) {
        // Create text
        this.buttonText = this.scene.add.text(0, 0, text, {
            fontFamily: '"Press Start 2P"',
            fontSize: this.options.fontSize,
            color: '#ffffff',
            align: 'center'
        });
        
        // Center text origin
        this.buttonText.setOrigin(0.5);
        
        // Determine button size
        const width = this.options.width || (this.buttonText.width + this.options.padding.x * 2);
        const height = this.options.height || (this.buttonText.height + this.options.padding.y * 2);
        
        // Round to nearest 32px grid
        this.buttonWidth = Math.ceil(width / 32) * 32;
        this.buttonHeight = Math.ceil(height / 32) * 32;
        
        // Create background
        this.buttonBg = this.scene.add.rectangle(0, 0, this.buttonWidth, this.buttonHeight, this.options.backgroundColor);
        this.buttonBg.setOrigin(0.5);
        
        // Add components to container in the right order
        this.add(this.buttonBg);
        this.add(this.buttonText);
        
        // Make interactive unless disabled
        if (!this.options.disableInteractive) {
            this.setInteractive(new Phaser.Geom.Rectangle(-this.buttonWidth/2, -this.buttonHeight/2, this.buttonWidth, this.buttonHeight), Phaser.Geom.Rectangle.Contains);
            
            // Set up events
            this.on('pointerover', this.onPointerOver, this);
            this.on('pointerout', this.onPointerOut, this);
            this.on('pointerdown', this.onPointerDown, this);
            this.on('pointerup', this.onPointerUp, this);
        }
    }
    
    onPointerOver() {
        this.buttonBg.fillColor = this.options.hoverColor;
        this.scene.input.setDefaultCursor('pointer');
    }
    
    onPointerOut() {
        this.buttonBg.fillColor = this.options.backgroundColor;
        this.scene.input.setDefaultCursor('default');
    }
    
    onPointerDown() {
        this.buttonBg.fillColor = this.options.pressColor;
        this.buttonText.y = 2; // Small press effect
    }
    
    onPointerUp() {
        this.buttonBg.fillColor = this.options.hoverColor;
        this.buttonText.y = 0;
        
        // Execute callback
        if (this.callback) {
            this.callback();
        }
    }
    
    // Method to disable the button
    disable() {
        this.disableInteractive();
        this.buttonBg.setAlpha(0.5);
        this.buttonText.setAlpha(0.5);
    }
    
    // Method to enable the button
    enable() {
        this.setInteractive();
        this.buttonBg.setAlpha(1);
        this.buttonText.setAlpha(1);
    }
    
    // Method to change the base background color
    setBackgroundColor(color) {
        this.options.backgroundColor = color;
        this.buttonBg.fillColor = color;
    }
}