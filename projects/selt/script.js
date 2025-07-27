/**
 * script.js - Navigation and UI Enhancements
 * 
 * This file contains JavaScript code to handle navigation in the static HTML demo
 * by preventing default link behavior and showing appropriate alert messages.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links except those pointing to index.html
    const navLinks = document.querySelectorAll('a:not([href="index.html"])');
    
    // Add event listeners to each navigation link
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Prevent the default navigation
            event.preventDefault();
            
            // Get the destination page from the href attribute
            const destination = this.getAttribute('href');
            
            // Get the link text or image alt text
            const linkText = this.textContent.trim() || 
                           (this.querySelector('img') ? this.querySelector('img').getAttribute('alt') : '');
            
            // Show custom alert based on the destination
            if (destination === 'main.html') {
                alert('This is a static demo. In the full version, this would take you to the Main Page.');
            } else if (destination === 'about.html') {
                if (linkText === 'About Us') {
                    alert('This is a static demo. In the full version, this would take you to the About Us page with information about the team.');
                } else if (linkText === 'Contact Us') {
                    alert('This is a static demo. In the full version, this would take you to the Contact Us section on the About Us page.');
                } else {
                    alert('This is a static demo. In the full version, this would take you to another page.');
                }
            } else {
                alert(`This is a static demo. In the full version, this would take you to ${destination}.`);
            }
        });
    });
});