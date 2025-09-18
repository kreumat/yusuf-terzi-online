/**
 * PopupHandler.js - Handles the language selection popup
 */

/**
 * Shows the language selection popup
 */
function showLanguagePopup() {
    const popup = document.getElementById('language-popup');
    if (popup) {
        popup.style.display = 'flex';
        // Add flag images to language buttons
        addFlagsToButtons();
        attachPopupEvents();
    }
}

/**
 * Adds flag images to the language selection buttons
 */
function addFlagsToButtons() {
    const languageButtons = document.querySelectorAll('.language-btn');
    
    languageButtons.forEach(button => {
        // Check if button already has an image to avoid duplicates
        if (button.querySelector('img')) {
            return;
        }
        
        const langCode = button.getAttribute('data-lang');
        const buttonText = button.textContent;
        
        // Clear the button content
        button.innerHTML = '';
        
        // Create flag image
        const flagImg = document.createElement('img');
        
        // Set specific flag image based on language code
        let flagImage = 'turkishflag.png';
        if (langCode === 'en') {
            flagImage = 'britishflag.png';
        } else if (langCode === 'de') {
            flagImage = 'germanflag.png';
        }
        
        flagImg.src = `images/other-images/${flagImage}`;
        flagImg.alt = `${buttonText} flag`;
        flagImg.className = 'language-flag';
        flagImg.style.width = '20px';
        flagImg.style.marginRight = '8px';
        flagImg.style.verticalAlign = 'middle';
        
        // Add image and text back to button
        button.appendChild(flagImg);
        button.appendChild(document.createTextNode(buttonText));
    });
}

/**
 * Closes the language selection popup
 */
function closeLanguagePopup() {
    const popup = document.getElementById('language-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

/**
 * Attaches event listeners to the language selection buttons
 */
function attachPopupEvents() {
    const languageButtons = document.querySelectorAll('.language-btn');
    
    languageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const langCode = this.getAttribute('data-lang');
            
            // Load the selected language
            loadLanguage(langCode)
                .then(() => {
                    // Close the popup
                    closeLanguagePopup();
                    
                    // Load the menu categories
                    loadCategories();
                })
                .catch(error => {
                    console.error('Error loading language:', error);
                    // Show an error message to the user (could be enhanced)
                    alert('Failed to load language. Please try again.');
                });
        });
    });
}