// Default attendance goal percentage
const DEFAULT_ATTENDANCE_GOAL = 55;

export class OptionsManager {
    constructor() {
        this.storageKey = 'customOptions';
        this.options = {
            background: getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim(),
            foreground: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
            accent: getComputedStyle(document.documentElement).getPropertyValue('--color-progress-fill').trim(),
            attendanceGoal: DEFAULT_ATTENDANCE_GOAL
        };
        this.loadOptions();
    }

    loadOptions() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.options = { ...this.options, ...parsed };
                this.applyOptions();
            } catch (e) {
                console.error("Error parsing options from localStorage", e);
            }
        }
    }

    saveOptions() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.options));
        } catch (error) {
            console.error("Error saving options to localStorage", error);
        }
    }

    applyOptions() {
        document.documentElement.style.setProperty('--color-bg', this.options.background);
        document.documentElement.style.setProperty('--color-card-bg', this.options.background);
        document.documentElement.style.setProperty('--color-calendar-bg', this.options.background);
        document.documentElement.style.setProperty('--color-btn-bw-bg', this.options.background);
        document.documentElement.style.setProperty('--color-overlay-bg', this.options.background);

        document.documentElement.style.setProperty('--color-text', this.options.foreground);
        document.documentElement.style.setProperty('--color-border', this.options.foreground);
        document.documentElement.style.setProperty('--color-overlay-text', this.options.foreground);

        document.documentElement.style.setProperty('--color-progress-fill', this.options.accent);
        document.documentElement.style.setProperty('--color-btn-bw-hover', this.options.accent);

        function hexToRgb(hex) {
            hex = hex.replace(/^#/, '');
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            const bigint = parseInt(hex, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return { r, g, b };
        }
        function rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }
        const baseRgb = hexToRgb(this.options.background);
        const newR = Math.max(0, Math.min(255, baseRgb.r - 19));
        const newG = Math.max(0, Math.min(255, baseRgb.g - 15));
        const newB = Math.max(0, Math.min(255, baseRgb.b - 11));
        const newProgressBg = rgbToHex(newR, newG, newB);
        document.documentElement.style.setProperty('--color-progress-bg', newProgressBg);
    }

    updateOption(key, value) {
        this.options[key] = value;
        this.saveOptions();
        this.applyOptions();
    }
}
