
async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Could not load ${lang}.json`);
        }
        const translations = await response.json();
        i18next.addResources(lang, 'translation', translations);
        i18next.changeLanguage(lang);
        setDirection(lang);
        updateContent();
        setCurrentYear();
    } catch (error) {
        console.error('Error loading translation:', error);
    }
}
function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerHTML = i18next.t(key);
    });
}
function setDirection(lang) {
    document.documentElement.lang = lang;
    const direction = isRtlLanguage(lang) ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.setAttribute('dir', direction);
}

function isRtlLanguage(lang) {
    const rtlLanguages = ['ar', 'he'];
    return rtlLanguages.includes(lang);
}
function setCurrentYear() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const languageSelect = document.getElementById('language-select');
    let savedLang = localStorage.getItem('preferredLanguage');

    if (!savedLang) {
        savedLang = navigator.language  ?? 'en';
    }
    if (isRtlLanguage(savedLang)) {
        setDirection(savedLang);
    }
    languageSelect.value = savedLang;
    // Initialize i18next
    i18next.init({
        lng: savedLang,
        debug: false,
        resources: {}
    }, function(err, t) {
        if (err) return console.error(err);
        loadTranslations(savedLang);
    });

    languageSelect.addEventListener('change', function () {
        const selectedLanguage = this.value;
        loadTranslations(selectedLanguage);
        localStorage.setItem('preferredLanguage', selectedLanguage);
    });
});
