const defaultLight = 'catppuccin-latte';
const defaultDark = 'catppuccin-mocha';

// Check user system preference 
const defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? defaultDark : defaultLight;

const themes = [
    'catppuccin-latte',
    'catppuccin-frappe',
    'catppuccin-macchiato',
    'catppuccin-mocha',
];

document.addEventListener('DOMContentLoaded', updateTheme);

export function getTheme() {
    return localStorage.getItem('theme') || defaultTheme;
}

function updateTheme() {
    let theme = localStorage.getItem('theme');
    if (!theme) {
        localStorage.setItem('theme', defaultTheme);
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

function toggleTheme() {
    const theme = getTheme(); 
    const index = themes.indexOf(theme);
    if (index === -1) {
        return; // Theme not found
    }

    const nextIndex = (index + 1) % themes.length;
    localStorage.setItem('theme', themes[nextIndex]);
    updateTheme();
}

window.toggleTheme = toggleTheme;
