/**
 * static.js - Static Demo Enhancement Script
 * 
 * This script extends the functionality of the board game generator
 * for the static demo version, adding alerts to explain what would
 * happen in the real version and ensuring all image references
 * point to the static/images directory.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add a demo banner at the top of the page
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const demoBanner = document.createElement('div');
        demoBanner.className = 'demo-banner';
        demoBanner.textContent = 'STATIC DEMO VERSION - Functionality is limited. This is a demonstration only.';
        document.body.insertBefore(demoBanner, navbar);
    }

    // Set current year in the footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Function to show demo alerts
    window.showDemoAlert = function(message) {
        alert('[STATIC DEMO] ' + message);
        return false; // Prevent default action
    };

    // Wait for grid.js to finish initialization before overriding its functions
    setTimeout(function() {
        if (window.saveGrid) {
            // Store the original saveGrid function
            const originalSaveGrid = window.saveGrid;
            
            // Override saveGrid function
            window.saveGrid = function() {
                showDemoAlert('In the real version, this would save your board and take you to the next step where you can add text to your board tiles.');
                return false;
            };
        }

        // Override clearGridConfirm function if it exists
        if (window.clearGridConfirm) {
            window.clearGridConfirm = function() {
                if (confirm('[STATIC DEMO] Are you sure you want to clear all tiles from the grid?')) {
                    if (window.clearGrid) {
                        window.clearGrid();
                    }
                }
            };
        }

        // Fix all image references to point to static/images
        document.querySelectorAll('img').forEach(img => {
            // Get the current src
            const currentSrc = img.getAttribute('src');
            
            // Check if it starts with "images/" and doesn't already have "static/"
            if (currentSrc && currentSrc.startsWith('images/') && !currentSrc.includes('static/')) {
                // Simply prepend "static/" to the path to make it "static/images/..."
                const newSrc = currentSrc.replace('images/', '../static/images/');
                img.setAttribute('src', newSrc);
            }
        });

        // Add event listeners to Start and Finish buttons to show alerts
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', function() {
                setTimeout(() => {
                    showDemoAlert('In the real version, this would allow you to place START tiles on the board.');
                }, 100);
            });
        }

        const finishButton = document.getElementById('finish-button');
        if (finishButton) {
            finishButton.addEventListener('click', function() {
                setTimeout(() => {
                    showDemoAlert('In the real version, this would allow you to place FINISH tiles on the board.');
                }, 100);
            });
        }

        // Make the save button clickable but show warning
        const saveBtn = document.getElementById('save-grid');
        if (saveBtn) {
            // Remove previous event listeners if any (from index.html)
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            
            // Add a simple click handler that just shows the alert
            newSaveBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent form submission
                showDemoAlert('In the real version, this would save your board and take you to the next step where you can add text to your board tiles.');
            });
        }
    }, 500); // Wait 500ms for grid.js to initialize
});