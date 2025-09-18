/**
 * Utils.js - Utility functions for the QR Menu application
 */

/**
 * Fetches JSON data from the specified path
 * @param {string} path - Path to the JSON file
 * @returns {Promise<Object>} - Promise that resolves to the JSON data
 */
function fetchJSON(path) {
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            throw error;
        });
}

/**
 * Creates a DOM element with optional class name and content
 * @param {string} type - The HTML element type (e.g., 'div', 'span', 'button')
 * @param {string|null} className - Optional CSS class name
 * @param {string|null} content - Optional text content
 * @returns {HTMLElement} - The created DOM element
 */
function createElement(type, className = null, content = null) {
    const element = document.createElement(type);
    
    if (className) {
        element.className = className;
    }
    
    if (content) {
        element.textContent = content;
    }
    
    return element;
}

/**
 * Formats a price value as Turkish Lira (₺)
 * @param {number} value - The price value
 * @returns {string} - Formatted price with Turkish Lira symbol
 */
function formatPrice(value) {
    return `${value.toFixed(2)} ₺`;
}