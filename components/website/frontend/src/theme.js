const defaultLight = 'catppuccin-latte';
const defaultDark = 'catppuccin-mocha';

// Check user system preference 
const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? defaultDark : defaultLight;
const themeKey = 'ft.theme';

const themes = [
    'catppuccin-latte',
    'catppuccin-frappe',
    'catppuccin-macchiato',
    'catppuccin-mocha',
];

document.addEventListener('DOMContentLoaded', updateTheme);

export function getTheme() {
    return localStorage.getItem(themeKey) || defaultTheme;
}

export function updateTheme() {
    let theme = localStorage.getItem(themeKey);
    if (!theme) {
        localStorage.setItem(themeKey, defaultTheme);
        theme = defaultTheme;
    }

    for (const className of document.body.classList) {
        if (className.startsWith('theme-')) {
            document.body.classList.remove(className);
        }
    };

    // console.log('Loading theme', theme);
    document.body.classList.add(`theme-${theme}`);
}

export function toggleTheme() {
    let theme = getTheme(); 
    const index = themes.indexOf(theme);
    if (index === -1) {
		theme = defaultTheme;
    }

    const nextIndex = (index + 1) % themes.length;
    localStorage.setItem(themeKey, themes[nextIndex]);
    updateTheme();
}

window.toggleTheme = toggleTheme;
