/**
 * MenuRenderer.js - Handles loading and displaying menu items
 */

/**
 * Loads menu items for the specified category
 * @param {string} categoryName - The category name (e.g., 'desserts', 'cold-drinks', 'teas')
 */
function loadMenuItems(categoryName) {
    // Clear the current menu items
    clearMenuArea();
    
    // Show loading indicator (could be enhanced)
    const menuContainer = document.getElementById('menu-items-container');
    if (menuContainer) {
        menuContainer.innerHTML = '<div class="loading">Loading...</div>';
    }
    
    // Fetch the items for this category
    fetchJSON(`menu/${categoryName}/items.json`)
        .then(items => {
            // Render the menu items
            renderMenuItems(items);
        })
        .catch(error => {
            console.error(`Failed to load menu items for ${categoryName}:`, error);
            
            // Show error message in the menu container
            if (menuContainer) {
                const errorMsg = getTranslation('error_loading_items') || 'Failed to load menu items';
                menuContainer.innerHTML = `<div class="error">${errorMsg}</div>`;
            }
        });
}

/**
 * Renders menu items in the UI
 * @param {Array} items - Array of menu item objects
 */
function renderMenuItems(items) {
    const menuContainer = document.getElementById('menu-items-container');
    if (!menuContainer) {
        console.error('Menu container not found');
        return;
    }
    
    // Clear any existing content (including loading indicator)
    clearMenuArea();
    
    // If no items, show a message
    if (!items || items.length === 0) {
        const noItemsMsg = getTranslation('no_items_found') || 'No items found in this category';
        menuContainer.innerHTML = `<div class="no-items">${noItemsMsg}</div>`;
        return;
    }
    
    // Get current language code
    const langCode = getCurrentLanguageCode();
    
    // Create a card for each menu item
    items.forEach(item => {
        // Get the translated content for this item
        const translation = item.translations && item.translations[langCode] 
            ? item.translations[langCode] 
            : { name: item.name || 'Unnamed item', description: '' };
        
        // Create the card element
        const card = createElement('div', 'menu-item-card');
        
        // Create and add the image
        const img = createElement('img', 'menu-item-image');
        img.src = item.image || 'images/menu-item-images/placeholder.png';
        img.alt = translation.name;
        img.onerror = function() {
            this.src = 'images/menu-item-images/placeholder.png';
        };
        card.appendChild(img);
        
        // Create and add the details container
        const details = createElement('div', 'menu-item-details');
        
        // Add the name
        const name = createElement('h3', 'menu-item-name', translation.name);
        details.appendChild(name);
        
        // Add the description
        if (translation.description) {
            const description = createElement('p', 'menu-item-description', translation.description);
            details.appendChild(description);
        }
        
        // Add the price
        const price = createElement('p', 'menu-item-price', formatPrice(item.price));
        details.appendChild(price);
        
        // Add details to card
        card.appendChild(details);
        
        // Add the card to the menu container
        menuContainer.appendChild(card);
    });
}

/**
 * Clears the menu items container
 */
function clearMenuArea() {
    const menuContainer = document.getElementById('menu-items-container');
    if (menuContainer) {
        menuContainer.innerHTML = '';
    }
}