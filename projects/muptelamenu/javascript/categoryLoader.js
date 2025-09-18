/**
 * CategoryLoader.js - Handles loading and displaying menu categories
 */

// Store the currently active category
let activeCategory = null;

/**
 * Loads and displays menu categories based on the current language
 */
function loadCategories() {
    if (!currentLanguage) {
        console.warn('Cannot load categories: No language loaded');
        return;
    }

    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) {
        console.error('Categories container not found');
        return;
    }

    // Clear any existing categories
    categoriesContainer.innerHTML = '';

    // Available categories (based on the folder structure)
    const categories = ['desserts', 'cold-drinks', 'teas', 'non-edibles' ];

    // Create a category button for each category
    categories.forEach(category => {
        const categoryKey = `category_${category.replace('-', '_')}`;
        const categoryName = currentLanguage[categoryKey] || category;
        
        const categoryCard = createElement('div', 'category-card', categoryName);
        categoryCard.setAttribute('data-category', category);
        
        categoriesContainer.appendChild(categoryCard);
    });

    // Attach event listeners to the newly created category buttons
    attachCategoryEvents();
}

/**
 * Attaches click event listeners to category cards
 */
function attachCategoryEvents() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active category
            if (activeCategory) {
                const previousActive = document.querySelector(`.category-card[data-category="${activeCategory}"]`);
                if (previousActive) {
                    previousActive.classList.remove('active');
                }
            }
            
            this.classList.add('active');
            activeCategory = category;
            
            // Load the menu items for this category
            loadMenuItems(category);
        });
    });
}

/**
 * Gets the currently active category
 * @returns {string|null} - The active category or null if none is active
 */
function getActiveCategory() {
    return activeCategory;
}