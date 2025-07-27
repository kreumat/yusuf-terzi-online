/**
 * BUUELTS - English Language Teaching Society Website
 * Popup handling and mobile navigation enhancement script
 */

// Create and show a recurring popup with sponsor image
function showRecurringPopup() {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    // Create popup container
    const container = document.createElement('div');
    container.className = 'popup-container';
    container.style.width = 'auto';
    container.style.maxWidth = '90%';
    container.style.maxHeight = '90%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.overflow = 'hidden'; // Prevent overflow
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'popup-content-wrapper';
    contentWrapper.style.padding = '20px';
    contentWrapper.style.textAlign = 'center';
    contentWrapper.style.width = '100%';
    contentWrapper.style.maxWidth = '500px'; // Limit max width
    
    // Create image link wrapper
    const imageLink = document.createElement('a');
    imageLink.href = 'about.html';
    imageLink.style.display = 'block';
    imageLink.style.width = '100%';
    imageLink.style.cursor = 'pointer';
    imageLink.style.transition = 'all 0.3s ease';
    
    // Create sponsor image
    const sponsorImg = document.createElement('img');
    sponsorImg.src = 'images/sponsorphoto.png';
    sponsorImg.alt = 'Sponsor';
    sponsorImg.style.width = '100%';
    sponsorImg.style.height = 'auto';
    sponsorImg.style.maxWidth = '100%';
    sponsorImg.style.maxHeight = '60vh'; // Limit height to 60% of viewport height
    sponsorImg.style.objectFit = 'contain';
    sponsorImg.style.borderRadius = '8px';
    sponsorImg.style.transition = 'all 0.3s ease';
    
    // Add hover effect using JavaScript
    imageLink.addEventListener('mouseenter', function() {
        sponsorImg.style.transform = 'scale(1.03)'; // Slightly reduced scale
        sponsorImg.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    });
    
    imageLink.addEventListener('mouseleave', function() {
        sponsorImg.style.transform = 'scale(1)';
        sponsorImg.style.boxShadow = 'none';
    });
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'popup-button-container';
    buttonContainer.style.marginTop = '0px';
    buttonContainer.style.width = '100%';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'popup-button-close';
    closeButton.textContent = 'Close';
    
    // Append elements
    imageLink.appendChild(sponsorImg);
    contentWrapper.appendChild(imageLink);
    buttonContainer.appendChild(closeButton);
    container.appendChild(contentWrapper);
    container.appendChild(buttonContainer);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Handle close button click
    closeButton.addEventListener('click', function() {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    });
    
    // Close on overlay click (but not when clicking the image or button)
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }
    });
    
    // Store the time this popup was shown
    localStorage.setItem('lastPopupTime_en', Date.now());
}

// Image Popup Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Handle popup images
    const popupImages = document.querySelectorAll('.popup-trigger');
    
    if (popupImages.length > 0) {
        popupImages.forEach(image => {
            image.addEventListener('click', function(e) {
                e.preventDefault();
                
                const imgSrc = this.getAttribute('data-img') || this.src;
                
                // Create popup overlay
                const overlay = document.createElement('div');
                overlay.className = 'popup-overlay';
                
                // Create popup container
                const container = document.createElement('div');
                container.className = 'popup-container';
                
                // Create image wrapper
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'popup-image-wrapper';
                
                // Create popup image
                const popupImg = document.createElement('img');
                popupImg.className = 'popup-image';
                popupImg.src = imgSrc;
                popupImg.alt = this.alt || 'Popup Image';
                
                // Create button container
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'popup-button-container';
                
                // Create close button
                const closeButton = document.createElement('button');
                closeButton.className = 'popup-button-close';
                closeButton.textContent = 'Close';
                
                // Append elements
                imageWrapper.appendChild(popupImg);
                buttonContainer.appendChild(closeButton);
                container.appendChild(imageWrapper);
                container.appendChild(buttonContainer);
                overlay.appendChild(container);
                document.body.appendChild(overlay);
                
                // Handle close button click
                closeButton.addEventListener('click', function() {
                    overlay.classList.add('fade-out');
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                    }, 300);
                });
                
                // Close on overlay click
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        overlay.classList.add('fade-out');
                        setTimeout(() => {
                            document.body.removeChild(overlay);
                        }, 300);
                    }
                });
            });
        });
    }
    
    // Enhanced Mobile Navigation - must run BEFORE inline scripts to prevent conflicts
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        // Remove any existing event listeners to prevent conflicts
        const navToggleClone = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(navToggleClone, navToggle);
        
        // Add enhanced event listener to the cloned element
        navToggleClone.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Accessibility
            const expanded = navMenu.classList.contains('active');
            this.setAttribute('aria-expanded', expanded);
            
            // Change icon to X when open
            const icon = this.querySelector('i');
            if (icon) {
                if (expanded) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !navToggleClone.contains(e.target) && 
                !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggleClone.setAttribute('aria-expanded', false);
                
                // Reset icon
                const icon = navToggleClone.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking a nav link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggleClone.setAttribute('aria-expanded', false);
                
                // Reset icon
                const icon = navToggleClone.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
    
    // Setup recurring popup (every 10 minutes)
    const checkForRecurringPopup = () => {
        // First check if a popup is already visible
        const existingPopup = document.querySelector('.popup-overlay');
        if (existingPopup) {
            return; // Don't show a new popup if one is already visible
        }
        
        const lastPopupTime = localStorage.getItem('lastPopupTime_en');
        const currentTime = Date.now();
        
        // If no record of last popup or it's been more than 10 minutes
        if (!lastPopupTime || (currentTime - lastPopupTime > 10 * 60 * 1000)) {
            showRecurringPopup();
        }
    };
    
    // Check when page loads
    checkForRecurringPopup();
    
    // Set interval to check every minute
    setInterval(checkForRecurringPopup, 60 * 1000);
});