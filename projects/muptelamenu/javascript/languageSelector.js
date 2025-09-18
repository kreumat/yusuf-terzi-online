/**
 * LanguageSelector.js - Handles language selection and translation
 */

// Store the current language translations
let currentLanguage = null;
let currentLangCode = 'tr'; // Default to Turkish

/**
 * Loads language data from the specified language code
 * @param {string} langCode - Language code (e.g., 'tr', 'en', 'de')
 * @returns {Promise<Object>} - Promise that resolves when the language is loaded
 */
function loadLanguage(langCode) {
    currentLangCode = langCode;
    return fetchJSON(`languages/${langCode}.json`)
        .then(languageData => {
            currentLanguage = languageData;
            translateUI();
            return languageData;
        })
        .catch(error => {
            console.error(`Failed to load language: ${langCode}`, error);
            // If loading fails, try to load the default language (Turkish)
            if (langCode !== 'tr') {
                return loadLanguage('tr');
            }
            throw error;
        });
}

/**
 * Translates all UI elements based on the current language
 */
function translateUI() {
    if (!currentLanguage) {
        console.warn('Cannot translate UI: No language loaded');
        return;
    }

    // Translate the page title
    document.title = currentLanguage.pageTitle || 'QR Menu';

    // Translate the menu title
    const menuTitle = document.getElementById('menu-title');
    if (menuTitle) {
        menuTitle.textContent = currentLanguage.menuTitle || 'Menu';
    }

    // Translate the language selection title
    const languageSelectionTitle = document.getElementById('language-selection-title');
    if (languageSelectionTitle) {
        languageSelectionTitle.textContent = currentLanguage.languageSelectionPrompt || 'Please choose your language';
    }
    
    // Translate other elements with data-translate attribute
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
        const translationKey = element.getAttribute('data-translate');
        if (currentLanguage[translationKey]) {
            element.textContent = currentLanguage[translationKey];
        }
    });
}

/**
 * Gets the currently selected language code
 * @returns {string} - The current language code
 */
function getCurrentLanguageCode() {
    return currentLangCode;
}

/**
 * Gets the translation for a specific key
 * @param {string} key - The translation key
 * @returns {string} - The translated text or the key if not found
 */
function getTranslation(key) {
    if (!currentLanguage || !currentLanguage[key]) {
        return key;
    }
    return currentLanguage[key];
}