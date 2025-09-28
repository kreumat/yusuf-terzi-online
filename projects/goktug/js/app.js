// DOM Elements
const canvas = document.getElementById('face-canvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('name-input');
const hairColorSelect = document.getElementById('hair-color');
const hairStyleSelect = document.getElementById('hair-style');
const glassesStyleSelect = document.getElementById('glasses-style');
const saveButton = document.getElementById('save-btn');
const nameDisplay = document.getElementById('name-display');
const descriptionText = document.getElementById('description-text');

// State variables
let currentName = 'Your Name';
let currentHairColor = 'brown';
let currentHairStyle = 'straight';
let currentGlasses = 'none';

// Images
const hairImage = new Image();
const glassesImage = new Image();

// Initialize the app
function init() {
    // Set initial values
    currentHairColor = hairColorSelect.value;
    currentHairStyle = hairStyleSelect.value;
    currentGlasses = glassesStyleSelect.value;
    
    // Add event listeners
    nameInput.addEventListener('input', handleNameChange);
    hairColorSelect.addEventListener('change', handleHairColorChange);
    hairStyleSelect.addEventListener('change', handleHairStyleChange);
    glassesStyleSelect.addEventListener('change', handleGlassesChange);
    saveButton.addEventListener('click', saveAsPNG);
    
    // Load initial images and draw the face
    updateHairImage();
    updateGlassesImage();
    drawFace();
}

// Event handlers
function handleNameChange(e) {
    currentName = e.target.value || 'Your Name';
    nameDisplay.textContent = currentName;
    updateDescription();
}

function handleHairColorChange(e) {
    currentHairColor = e.target.value;
    updateHairImage();
    updateDescription();
}

function handleHairStyleChange(e) {
    currentHairStyle = e.target.value;
    updateHairImage();
    updateDescription();
}

function handleGlassesChange(e) {
    currentGlasses = e.target.value;
    updateGlassesImage();
    updateDescription();
}

// Update functions
function updateHairImage() {
    if (currentHairColor && currentHairStyle) {
        console.log(`Loading hair image: images/${currentHairColor}_${currentHairStyle}.png`);
        hairImage.src = `images/${currentHairColor}_${currentHairStyle}.png`;
        hairImage.onload = () => {
            console.log('Hair image loaded successfully');
            drawFace();
        };
        hairImage.onerror = (e) => {
            console.error(`Error loading hair image: images/${currentHairColor}_${currentHairStyle}.png`, e);
            drawFace(); // Still draw face even if image fails
        };
    }
}

function updateGlassesImage() {
    if (currentGlasses !== 'none') {
        console.log(`Loading glasses image: images/${currentGlasses}_glasses.png`);
        glassesImage.src = `images/${currentGlasses}_glasses.png`;
        glassesImage.onload = () => {
            console.log('Glasses image loaded successfully');
            drawFace();
        };
        glassesImage.onerror = (e) => {
            console.error(`Error loading glasses image: images/${currentGlasses}_glasses.png`, e);
            drawFace(); // Still draw face even if image fails
        };
    } else {
        drawFace();
    }
}

function updateDescription() {
    let glassesText = currentGlasses !== 'none' ? `${currentGlasses} glasses` : 'no glasses';
    descriptionText.textContent = `I have ${currentHairColor} ${currentHairStyle} hair and ${glassesText}.`;
}

// Drawing functions
function drawFace() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Draw the face (head)
    ctx.fillStyle = '#FFD8B5'; // Skin tone
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight / 2, 120, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw the eyes
    drawEyes();
    
    // Draw the nose
    drawNose();
    
    // Draw the mouth
    drawMouth();
    
    // Draw glasses if selected (before hair to position under it)
    if (currentGlasses !== 'none') {
        drawGlasses();
    }
    
    // Draw the hair (on top of glasses)
    drawHair();
}

function drawEyes() {
    const eyeY = canvas.height / 2 - 20;
    const leftEyeX = canvas.width / 2 - 40;
    const rightEyeX = canvas.width / 2 + 40;
    
    // White part
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 15, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 7, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, 7, 0, Math.PI * 2);
    ctx.fill();
}

function drawNose() {
    const noseX = canvas.width / 2;
    const noseY = canvas.height / 2 + 20;
    
    ctx.fillStyle = '#F4C1A1';
    ctx.beginPath();
    ctx.moveTo(noseX, noseY - 15);
    ctx.lineTo(noseX + 10, noseY);
    ctx.lineTo(noseX - 10, noseY);
    ctx.closePath();
    ctx.fill();
}

function drawMouth() {
    const mouthX = canvas.width / 2;
    const mouthY = canvas.height / 2 + 50;
    
    ctx.strokeStyle = '#C1665A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mouthX, mouthY, 30, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();
}

function drawHair() {
    if (hairImage.complete && hairImage.naturalWidth > 0) {
        console.log('Drawing hair on canvas');
        // Center and scale the hair image to fit on the head
        const scale = 1.0; // Reduced scale factor
        const hairWidth = canvas.width * scale;
        const hairHeight = canvas.height * scale;
        const x = (canvas.width - hairWidth) / 2;
        const y = (canvas.height - hairHeight) / 2 - 20; // Raised position for better alignment
        
        ctx.drawImage(hairImage, x, y, hairWidth, hairHeight);
    } else if (currentHairColor && currentHairStyle) {
        console.log('Hair image not ready yet');
    }
}

function drawGlasses() {
    if (glassesImage.complete && glassesImage.naturalWidth > 0) {
        console.log('Drawing glasses on canvas');
        // Position glasses on the face
        const glassesWidth = canvas.width * 0.8;
        const glassesHeight = canvas.height * 0.3;
        const x = (canvas.width - glassesWidth) / 2;
        const y = canvas.height / 2 - 50; // Raised position to better align with eyes
        
        ctx.drawImage(glassesImage, x, y, glassesWidth, glassesHeight);
    } else if (currentGlasses !== 'none') {
        console.log('Glasses image not ready yet');
    }
}

// Save as PNG
function saveAsPNG() {
    // Disable the save button during processing
    saveButton.disabled = true;
    saveButton.textContent = 'Processing...';
    
    try {
        // Redraw everything to ensure canvas is up to date
        drawFace();
        
        // Get canvas data directly
        canvas.toBlob(function(blob) {
            if (!blob) {
                console.error('Failed to create blob from canvas');
                alert('Sorry, there was a problem creating the image. Please try again.');
                saveButton.disabled = false;
                saveButton.textContent = 'Save as PNG';
                return;
            }
            
            // Create filename
            const filename = (currentName !== 'Your Name' ? currentName : 'cartoon_face') + '.png';
            console.log('Saving image as:', filename);
            
            // Use browser's download API if available
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // For IE
                window.navigator.msSaveOrOpenBlob(blob, filename);
                console.log('Downloaded via msSaveOrOpenBlob');
            } else {
                // For other browsers
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                
                // Append to document, click and cleanup
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Release the object URL
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 100);
                
                console.log('Downloaded via createObjectURL');
            }
            
            // Re-enable button
            saveButton.disabled = false;
            saveButton.textContent = 'Save as PNG';
        }, 'image/png');
    } catch (error) {
        console.error('Error in saveAsPNG:', error);
        alert('Sorry, there was a problem creating the image. Please try again.');
        saveButton.disabled = false;
        saveButton.textContent = 'Save as PNG';
    }
}

// Initialize app when window loads
window.addEventListener('load', init);