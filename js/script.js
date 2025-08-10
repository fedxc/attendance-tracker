// ----------------------------
// Helper: Returns an array of holiday dates for a given year
// ----------------------------
function getHolidays(year) {
    return [
        new Date(year, 0, 1),    // New Year's Day
        new Date(year, 4, 1),    // Labour Day
        new Date(year, 11, 25),  // Christmas Day
        new Date(year, 0, 6),    // Reyes
        new Date(year, 2, 3),    // Carnival
        new Date(year, 2, 4),    // Carnival
        new Date(year, 3, 18),   // 33 - moved
        new Date(year, 5, 19),   // Artigas
        new Date(year, 6, 18),   // Constitution Day
        new Date(year, 7, 25)    // Independence Day
    ];
}

// ----------------------------
// Helper function to calculate working days in a month
// (Monday-Friday excluding fixed holidays)
// ----------------------------
function calculateWorkingDays(year, month) {
    const holidays = getHolidays(year);
    const date = new Date(year, month, 1);
    let count = 0;
    while (date.getMonth() === month) {
        const dayOfWeek = date.getDay();
        const isHoliday = holidays.some(holiday =>
            holiday.getDate() === date.getDate() &&
            holiday.getMonth() === date.getMonth() &&
            holiday.getFullYear() === date.getFullYear()
        );
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) count++;
        date.setDate(date.getDate() + 1);
    }
    return count;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getHolidays, calculateWorkingDays };
} else {

// ----------------------------
// Debounce Helper Function
// ----------------------------
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// ----------------------------
// Notification Helper Function
// ----------------------------
/**
 * Shows a browser notification after requesting permission.
 * @param {string} body The text to display in the notification.
 * @param {string} iconUrl Optional URL for an icon.
 */
function showAttendanceNotification(body, iconUrl = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%2290%22 height=%2290%22 x=%225%22 y=%225%22 fill=%22%23fff%22 stroke=%22%23000%22 stroke-width=%2210%22/><path d=%22M30 50 L45 65 L70 35%22 stroke=%22%234caf50%22 stroke-width=%2210%22 fill=%22none%22/></svg>') {
    if (!("Notification" in window)) {
        console.error("This browser does not support desktop notification.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification("Attendance Tracker", { body: body, icon: iconUrl });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Attendance Tracker", { body: body, icon: iconUrl });
            }
        });
    }
}

// ----------------------------
// Geolocation Distance Helper Function
// ----------------------------
/**
 * Calculates the distance between two lat/lon coordinates in meters.
 * @param {{latitude: number, longitude: number}} loc1 First location.
 * @param {{latitude: number, longitude: number}} loc2 Second location.
 * @returns {number} Distance in meters.
 */
function calculateDistance(loc1, loc2) {
    const R = 6371e3; // metres
    const φ1 = loc1.latitude * Math.PI / 180;
    const φ2 = loc2.latitude * Math.PI / 180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in metres
}

// ----------------------------
// Global Themes Variable
// ----------------------------
const themes = {
    'default': { background: '#fffbf7', foreground: '#45372b', accent: '#df7020' },
    'bsod': { background: '#153489', foreground: '#eceae5', accent: '#5ea5ee' },
    'dracula': { background: '#282a36', foreground: '#f8f8f2', accent: '#f44336' },
    'ultra-violet': { background: '#440184', foreground: '#BF00FF', accent: '#E78FFF' },
    'hello-kitty': { background: '#FFF0F5', foreground: '#4a4a4a', accent: '#ff1493' },
    'matrix': { background: '#2b2b2b', foreground: '#4eee85', accent: '#4eee85' },
    'dark-mode': { background: '#303030', foreground: '#e0e0e0', accent: '#9e9e9e' },
    'windows-98': { background: '#c0c0c0', foreground: '#000000', accent: '#008080' },
    'mint': { background: '#e5ffe5', foreground: '#2e8b57', accent: '#32cd3f' },
    'terminal': { background: '#1a170f', foreground: '#eceae5', accent: '#eec35e' }
};

// ----------------------------
// AttendanceHistory Class: Handles multi-month data in localStorage
// ----------------------------
class AttendanceHistory {
    constructor() {
        try {
            const data = localStorage.getItem('attendanceHistory');
            this.data = data ? JSON.parse(data) : {};
        } catch (error) {
            console.error("Error reading attendance history from localStorage", error);
            this.data = {};
        }
    }
    getMonthKey(year, month) {
        const m = month < 10 ? '0' + month : month;
        return `${year}-${m}`;
    }
    getMonthData(year, month) {
        const key = this.getMonthKey(year, month);
        return this.data[key] || [];
    }
    saveMonthData(year, month, entries) {
        const key = this.getMonthKey(year, month);
        this.data[key] = entries;
        try {
            localStorage.setItem('attendanceHistory', JSON.stringify(this.data));
        } catch (error) {
            console.error("Error saving attendance history to localStorage", error);
        }
    }
    clearMonthData(year, month) {
        const key = this.getMonthKey(year, month);
        delete this.data[key];
        try {
            localStorage.setItem('attendanceHistory', JSON.stringify(this.data));
        } catch (error) {
            console.error("Error clearing attendance history in localStorage", error);
        }
    }
}

// ----------------------------
// AttendanceManager Class: Handles data for the current month
// ----------------------------
class AttendanceManager {
    constructor(year, month, history) {
        this.year = year;
        this.month = month; // 0-indexed (for date calculations)
        this.monthForStorage = month + 1;
        this.attendanceHistory = history;
        this.attendanceDays = this.loadAttendance();
        this.workingDays = calculateWorkingDays(year, month);
        // Default attendance goal is set to 55% (can be updated via the slider)
        this.requiredAttendance = Math.ceil(this.workingDays * 0.55);
    }
    loadAttendance() {
        return this.attendanceHistory.getMonthData(this.year, this.monthForStorage);
    }
    saveAttendance() {
        this.attendanceHistory.saveMonthData(this.year, this.monthForStorage, this.attendanceDays);
    }
    hasAttendance(day) {
        return this.attendanceDays.some(entry => entry.day === day);
    }
    addAttendance(day) {
        if (!this.hasAttendance(day)) {
            this.attendanceDays.push({ day, month: this.monthForStorage, year: this.year });
            this.saveAttendance();
        }
    }
    removeAttendance(day) {
        const index = this.attendanceDays.findIndex(entry => entry.day === day);
        if (index !== -1) {
            this.attendanceDays.splice(index, 1);
            this.saveAttendance();
        }
    }
    toggleAttendance(day) {
        if (this.hasAttendance(day)) {
            this.removeAttendance(day);
        } else {
            this.addAttendance(day);
        }
    }
    clearAttendance() {
        this.attendanceDays = [];
        this.attendanceHistory.clearMonthData(this.year, this.monthForStorage);
    }
    getCount() {
        return this.attendanceDays.length;
    }
}

// ----------------------------
// OptionsManager Class
// ----------------------------
class OptionsManager {
    constructor() {
        this.storageKey = 'customOptions';
        this.options = {
            background: getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim(),
            foreground: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
            accent: getComputedStyle(document.documentElement).getPropertyValue('--color-progress-fill').trim(),
            attendanceGoal: 55
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

// ----------------------------
// AttendanceUI Class: Manages ALL UI updates and event bindings
// ----------------------------
class AttendanceUI {
    constructor(manager, today) {
        this.manager = manager;
        this.today = today;
        this.monthName = today.toLocaleString('default', { month: 'long' });
        this.hasCelebrated = false;
        // Default attendance goal percentage (set by the slider)
        this.attendanceGoalPercentage = 55;

        // Cache DOM elements for attendance info
        this.monthYearInfo = document.getElementById('monthYearInfo');
        this.workingDaysInfo = document.getElementById('workingDaysInfo');
        this.goalInfo = document.getElementById('goalInfo');
        this.attendanceCount = document.getElementById('attendanceCount');
        this.statusMessage = document.getElementById('statusMessage');
        this.progressFill = document.getElementById('progressFill');
        this.calendarContainer = document.querySelector('.calendar-container');
        this.markBtn = document.getElementById('markBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.logBtn = document.getElementById('logBtn');

        // Bind attendance button and calendar events
        this.bindEvents();

        // Initialize Options Manager and bind options events
        this.optionsManager = new OptionsManager();
        this.bindOptionsEvents();
        document.getElementById('bgColor').value = this.optionsManager.options.background;
        document.getElementById('fgColor').value = this.optionsManager.options.foreground;
        document.getElementById('accentColor').value = this.optionsManager.options.accent;
        // Set slider value from saved option
        const slider = document.getElementById('attendanceGoalSlider');
        slider.value = this.optionsManager.options.attendanceGoal;
        document.getElementById('attendanceGoalValue').textContent = this.optionsManager.options.attendanceGoal + '%';
        this.attendanceGoalPercentage = this.optionsManager.options.attendanceGoal;
        this.manager.requiredAttendance = Math.ceil(this.manager.workingDays * (this.attendanceGoalPercentage / 100));
        this.updateThemeSelect();

        // Bind log overlay events
        this.bindLogOverlayEvents();

        // Bind global keydown events for both log overlay and options menu
        this.bindGlobalKeydownEvents();

        // Initial UI update
        this.updateAll();
        
        // ** NEW: Automatically run location check on page load **
        this.checkAndNotifyByLocation();
    }

    // ----------------------------
    // Binds attendance events: mark, reset, log, and calendar clicks
    // ----------------------------
    bindEvents() {
        this.markBtn.addEventListener('click', () => {
            if (!this.manager.hasAttendance(this.today.getDate())) {
                this.manager.addAttendance(this.today.getDate());
                this.updateAll();
            }
        });
        this.resetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset attendance for this month?")) {
                this.manager.clearAttendance();
                this.hasCelebrated = false;
                this.updateAll();
            }
        });
        this.logBtn.addEventListener('click', () => this.showLogOverlay());
        this.calendarContainer.addEventListener('click', (e) => {
            if (e.target && e.target.tagName === 'TD' && e.target.textContent) {
                const day = parseInt(e.target.textContent, 10);
                this.manager.toggleAttendance(day);
                this.updateAll();
            }
        });
    }

    // ----------------------------
    // Updates header info, progress indicator, calendar, and button states
    // ----------------------------
    updateAll() {
        this.updateHeader();
        this.updateStatusMessage();
        this.updateProgress();
        this.updateCalendar();
        this.updateButtonState();
    }

    updateHeader() {
        this.monthYearInfo.textContent = `Month: ${this.monthName} ${this.manager.year}`;
        this.workingDaysInfo.textContent = `Total Working Days (Mon-Fri): ${this.manager.workingDays}`;
        this.goalInfo.textContent = `Attendance Goal (${this.attendanceGoalPercentage}%): ${this.manager.requiredAttendance} day${this.manager.requiredAttendance > 1 ? 's' : ''}`;
        this.attendanceCount.textContent = `Attendance so far: ${this.manager.getCount()}`;
    }

    updateStatusMessage() {
        const count = this.manager.getCount();
        if (count >= this.manager.requiredAttendance) {
            this.statusMessage.textContent = "You have reached your attendance goal for this month.";
            if (!this.hasCelebrated) {
                this.throwConfetti();
                this.hasCelebrated = true;
            }
        } else {
            const remaining = this.manager.requiredAttendance - count;
            this.statusMessage.textContent = `Keep going! You need ${remaining} more day${remaining > 1 ? 's' : ''} to reach your goal.`;
            this.hasCelebrated = false;
        }
    }

    updateProgress() {
        const count = this.manager.getCount();
        const prevAngle = parseFloat(getComputedStyle(this.progressFill).getPropertyValue('--progress-angle')) || 0;
        const progressAngle = (count / this.manager.requiredAttendance) * 360;
        this.animateProgress(prevAngle, progressAngle, 300);
        this.progressFill.setAttribute('data-progress', `${count} / ${this.manager.requiredAttendance}`);
    }

    animateProgress(fromAngle, toAngle, duration) {
        const start = performance.now();
        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const currentAngle = fromAngle + (toAngle - fromAngle) * progress;
            this.progressFill.style.setProperty('--progress-angle', currentAngle + 'deg');
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    updateCalendar() {
        this.calendarContainer.innerHTML = '';
        const table = document.createElement('table');
        const header = document.createElement('tr');
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            header.appendChild(th);
        });
        table.appendChild(header);
        const firstDay = new Date(this.manager.year, this.manager.month, 1).getDay();
        const daysInMonth = new Date(this.manager.year, this.manager.month + 1, 0).getDate();
        let row = document.createElement('tr');
        for (let i = 0; i < firstDay; i++) {
            const cell = document.createElement('td');
            cell.textContent = '';
            row.appendChild(cell);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            if ((firstDay + d - 1) % 7 === 0 && d !== 1) {
                table.appendChild(row);
                row = document.createElement('tr');
            }
            const cell = document.createElement('td');
            cell.textContent = d;
            // Mark holiday cells if current month is being displayed
            if (this.manager.year === new Date().getFullYear() && this.manager.month === new Date().getMonth()) {
                const holidays = getHolidays(this.manager.year);
                if (holidays.some(holiday => holiday.getMonth() === this.manager.month && holiday.getDate() === d && holiday.getFullYear() === this.manager.year)) {
                    if (!this.manager.hasAttendance(d)) {
                        cell.classList.add('holiday');
                    }
                }
            }
            if (this.manager.hasAttendance(d)) {
                cell.classList.add('attended');
            }
            row.appendChild(cell);
        }
        while (row.children.length < 7) {
            const cell = document.createElement('td');
            cell.textContent = '';
            row.appendChild(cell);
        }
        table.appendChild(row);
        this.calendarContainer.appendChild(table);
    }

    updateButtonState() {
        if (this.manager.hasAttendance(this.today.getDate())) {
            this.markBtn.disabled = true;
            this.markBtn.textContent = "Today's attendance already marked";
        } else {
            this.markBtn.disabled = false;
            this.markBtn.textContent = "Mark today's attendance";
        }
    }

    // ----------------------------
    // Log Overlay Methods
    // ----------------------------
    showLogOverlay() {
        const overlay = document.getElementById('logOverlay');
        overlay.style.display = 'flex';
        // Hide gear button while log overlay is active
        document.querySelector('.gears-container').style.display = 'none';
        this.populateLogOverlay();
    }

    closeLogOverlay() {
        const overlay = document.getElementById('logOverlay');
        // Make the gear button appear immediately before collapse animation
        document.querySelector('.gears-container').style.display = 'block';
        overlay.style.animation = 'collapseOverlay 0.5s ease-out forwards';
        overlay.addEventListener('animationend', () => {
            overlay.style.display = 'none';
            overlay.style.animation = 'expandOverlay 0.5s ease-out forwards';
        }, { once: true });
    }

    populateLogOverlay() {
        const logColumn = document.getElementById('logColumn');
        const graphWrapper = document.getElementById('graphWrapper');
        logColumn.innerHTML = '';
        graphWrapper.innerHTML = '';
        const history = JSON.parse(localStorage.getItem('attendanceHistory')) || {};
        const sortedMonthKeys = Object.keys(history).sort((a, b) => b.localeCompare(a));
        sortedMonthKeys.forEach(monthKey => {
            const monthHeader = document.createElement('h2');
            monthHeader.textContent = `Month: ${monthKey}`;
            monthHeader.className = 'log-header';
            logColumn.appendChild(monthHeader);
            history[monthKey].forEach(entry => {
                const p = document.createElement('p');
                p.textContent = `Day: ${entry.day}, Month: ${entry.month}, Year: ${entry.year}`;
                p.className = 'log-entry';
                logColumn.appendChild(p);
            });
        });
        const totals = this.getAttendanceByWeekday(history);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const maxCount = Math.max(...Object.values(totals), 1);
        days.forEach((day, index) => {
            const dayContainer = document.createElement('div');
            dayContainer.className = 'day-container';
            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = day;
            dayContainer.appendChild(label);
            const bar = document.createElement('div');
            bar.className = 'bar';
            let widthPercentage = (totals[index] / maxCount) * 100;
            bar.style.width = totals[index] === 0 ? '20px' : widthPercentage + '%';
            bar.textContent = totals[index];
            dayContainer.appendChild(bar);
            graphWrapper.appendChild(dayContainer);
        });
    }

    getAttendanceByWeekday(history) {
        const totals = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        Object.values(history).forEach(monthEntries => {
            monthEntries.forEach(entry => {
                const date = new Date(entry.year, entry.month - 1, entry.day);
                const weekday = date.getDay();
                totals[weekday]++;
            });
        });
        return totals;
    }

    exportCSV() {
        const history = JSON.parse(localStorage.getItem('attendanceHistory')) || {};
        let csvContent = "year,month,day\n";
        for (const monthKey in history) {
            history[monthKey].forEach(entry => {
                csvContent += `${entry.year},${entry.month},${entry.day}\n`;
            });
        }
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "attendance_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            alert("CSV file is empty or missing data.");
            return;
        }
        const header = lines[0].trim().toLowerCase();
        if (header !== "year,month,day") {
            alert("Invalid CSV header. Expected 'year,month,day'.");
            return;
        }
        let importedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;
        const historyData = JSON.parse(localStorage.getItem('attendanceHistory')) || {};
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") continue;
            const parts = line.split(',');
            if (parts.length !== 3) {
                errorCount++;
                continue;
            }
            let [yearStr, monthStr, dayStr] = parts;
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);
            const day = parseInt(dayStr, 10);
            if (isNaN(year) || isNaN(month) || isNaN(day)) {
                errorCount++;
                continue;
            }
            if (month < 1 || month > 12 || day < 1 || day > 31) {
                errorCount++;
                continue;
            }
            const mKey = month < 10 ? '0' + month : month;
            const monthKey = `${year}-${mKey}`;
            if (!historyData[monthKey]) {
                historyData[monthKey] = [];
            }
            const duplicate = historyData[monthKey].some(entry => entry.day === day && entry.month === month && entry.year === year);
            if (duplicate) {
                duplicateCount++;
                continue;
            }
            historyData[monthKey].push({ year: year, month: month, day: day });
            importedCount++;
        }
        localStorage.setItem('attendanceHistory', JSON.stringify(historyData));
        let message = `Import complete. ${importedCount} entries imported.`;
        if (duplicateCount > 0) {
            message += ` ${duplicateCount} duplicate entr${duplicateCount === 1 ? 'y' : 'ies'} were skipped.`;
        }
        if (errorCount > 0) {
            message += ` ${errorCount} row${errorCount === 1 ? '' : 's'} had errors and were skipped.`;
        }
        alert(message);
        location.reload();
    }

    // ----------------------------
    // Binds options menu and color picker events
    // ----------------------------
    bindOptionsEvents() {
        const gearContainer = document.querySelector('.gears-container');
        const optionsMenu = document.getElementById('optionsMenu');
        gearContainer.addEventListener('click', () => {
            optionsMenu.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!optionsMenu.contains(e.target) && !gearContainer.contains(e.target)) {
                optionsMenu.classList.remove('open');
            }
        });
        document.getElementById('bgColor').addEventListener('input', (e) => {
            this.optionsManager.updateOption('background', e.target.value);
            this.updateThemeSelect();
        });
        document.getElementById('fgColor').addEventListener('input', (e) => {
            this.optionsManager.updateOption('foreground', e.target.value);
            this.updateThemeSelect();
        });
        document.getElementById('accentColor').addEventListener('input', (e) => {
            this.optionsManager.updateOption('accent', e.target.value);
            this.updateThemeSelect();
        });
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            if (themes[selectedTheme]) {
                const { background, foreground, accent } = themes[selectedTheme];
                this.optionsManager.updateOption('background', background);
                this.optionsManager.updateOption('foreground', foreground);
                this.optionsManager.updateOption('accent', accent);
            }
            // Update color picker values
            document.getElementById('bgColor').value = this.optionsManager.options.background;
            document.getElementById('fgColor').value = this.optionsManager.options.foreground;
            document.getElementById('accentColor').value = this.optionsManager.options.accent;
        });
        document.getElementById('reset-options').addEventListener('click', () => {
            localStorage.removeItem(this.optionsManager.storageKey);
            this.optionsManager.options = {
                background: '#fffbf7',
                foreground: '#45372b',
                accent: '#df7020',
                attendanceGoal: 55
            };
            this.optionsManager.applyOptions();
            document.getElementById('bgColor').value = this.optionsManager.options.background;
            document.getElementById('fgColor').value = this.optionsManager.options.foreground;
            document.getElementById('accentColor').value = this.optionsManager.options.accent;
            document.getElementById('themeSelect').value = 'default';
            const slider = document.getElementById('attendanceGoalSlider');
            slider.value = 55;
            document.getElementById('attendanceGoalValue').textContent = "55%";
            this.attendanceGoalPercentage = 55;
            this.manager.requiredAttendance = Math.ceil(this.manager.workingDays * 0.55);
        });
        document.getElementById('attendanceGoalSlider').addEventListener('input', (e) => {
            const goalPercentage = parseInt(e.target.value, 10);
            document.getElementById('attendanceGoalValue').textContent = goalPercentage + '%';
            this.attendanceGoalPercentage = goalPercentage;
            this.manager.requiredAttendance = Math.ceil(this.manager.workingDays * (goalPercentage / 100));
            this.optionsManager.updateOption('attendanceGoal', goalPercentage);
            this.updateAll();
        });
        document.getElementById('resetFullDataBtn').addEventListener('click', () => {
            if (confirm("This will completely wipe all data and preferences. Are you sure?")) {
                localStorage.clear();
                location.reload();
            }
        });
    }
    
    // Method to check location and send notification ---
    checkAndNotifyByLocation() {
        const officeLocation = {
            latitude: -34.9027297, // WTC Free Zone, Montevideo
            longitude: -56.1342857
        };
        const maxDistanceMeters = 500; // 500 meter radius

        const alreadyMarked = this.manager.hasAttendance(this.today.getDate());
        if (alreadyMarked) {
             console.log("Attendance already marked, no location check needed.");
             return;
        }

        if (!('geolocation' in navigator)) {
            console.error("Geolocation is not supported by your browser.");
            return;
        }
        
        // This will trigger the browser's permission prompt on first use
        navigator.geolocation.getCurrentPosition(
            (position) => { // Success callback
                const userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                const distance = calculateDistance(officeLocation, userLocation);

                console.log(`Distance from office: ${distance.toFixed(2)} meters.`);

                if (distance <= maxDistanceMeters) {
                    showAttendanceNotification("Looks like you're at the office. Don't forget to mark your attendance.");
                }
            },
            (error) => { // Error callback
                console.error("Geolocation error:", error.message);
                if (error.code === error.PERMISSION_DENIED) {
                    console.warn("Location permission was denied by the user.");
                }
            }
        );
    }

    updateThemeSelect() {
        const bg = document.getElementById('bgColor').value.toLowerCase();
        const fg = document.getElementById('fgColor').value.toLowerCase();
        const accent = document.getElementById('accentColor').value.toLowerCase();
        let matchedTheme = 'custom';
        for (const [themeName, colors] of Object.entries(themes)) {
            if (
                colors.background.toLowerCase() === bg &&
                colors.foreground.toLowerCase() === fg &&
                colors.accent.toLowerCase() === accent
            ) {
                matchedTheme = themeName;
                break;
            }
        }
        document.getElementById('themeSelect').value = matchedTheme;
    }

    // ----------------------------
    // Binds log overlay events: close, export/import CSV
    // ----------------------------
    bindLogOverlayEvents() {
        document.getElementById('closeLogOverlay').addEventListener('click', () => this.closeLogOverlay());
        document.getElementById('exportCSVBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('importCSVBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });
        document.getElementById('importFileInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const csvText = event.target.result;
                        this.importCSV(csvText);
                    } catch (err) {
                        alert('Error reading CSV file: ' + err.message);
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    // ----------------------------
    // Binds global keydown events for Escape key
    // ----------------------------
    bindGlobalKeydownEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const overlay = document.getElementById('logOverlay');
                if (overlay.style.display === 'flex') {
                    this.closeLogOverlay();
                } else {
                    const optionsMenu = document.getElementById('optionsMenu');
                    if (optionsMenu.classList.contains('open')) {
                        optionsMenu.classList.remove('open');
                    }
                }
            }
        });
    }

    throwConfetti() {
        const confettiCount = 150;
        const colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7', '#7F00FF'];
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const size = Math.floor(Math.random() * 6) + 5;
            confetti.style.position = 'fixed';
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.top = `${Math.random() * -50}px`;
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.opacity = Math.random();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.transition = 'transform 3s linear, opacity 3s linear';
            document.body.appendChild(confetti);
            void confetti.offsetWidth;
            confetti.style.transform = `translateY(100vh) rotate(0deg)`;
            confetti.style.opacity = '0';
            setTimeout(() => {
                confetti.remove();
                if (i === confettiCount - 1) {
                    document.body.style.overflow = "";
                    document.documentElement.style.overflow = "";
                }
            }, 3000);
        }
    }
}

// ----------------------------
// Initialization Code
// ----------------------------
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed
const attendanceHistory = new AttendanceHistory();
const attendanceManager = new AttendanceManager(year, month, attendanceHistory);
const attendanceUI = new AttendanceUI(attendanceManager, today);

// ----------------------------
// Auto-reload if data is older than 60 minutes
// ----------------------------
const reloadIntervalMinutes = 60;
localStorage.setItem("lastReload", Date.now());
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        const lastReload = parseInt(localStorage.getItem("lastReload"), 10);
        const now = Date.now();
        const minutesPassed = (now - lastReload) / (1000 * 60);
        if (minutesPassed > reloadIntervalMinutes) {
            localStorage.setItem("lastReload", now);
            location.reload();
        } else {
            console.log("Data is still fresh, no reload needed");
        }
    }
});

// ----------------------------
// Optional Helper Functions for Testing
// ----------------------------
window.clearAttendance = () => {
    attendanceManager.clearAttendance();
    attendanceUI.updateAll();
};
window.exportAttendance = () => {
    attendanceHistory.data && Object.values(attendanceHistory.data).forEach(monthEntries => {
        monthEntries.forEach(entry => {
            console.log(`Day: ${entry.day}, Month: ${entry.month}, Year: ${entry.year}`);
        });
    });
};
window.addAttendanceMark = (day, m, y) => {
    const date = new Date(y, m, day);
    if (date.getMonth() === m && date.getDate() === day && date.getFullYear() === y) {
        const monthForStorage = m + 1;
        const entries = attendanceHistory.getMonthData(y, monthForStorage);
        if (!entries.some(d => d.day === day)) {
            entries.push({ day, month: monthForStorage, year: y });
            attendanceHistory.saveMonthData(y, monthForStorage, entries);
            attendanceUI.updateAll();
        } else {
            console.log("This date is already marked.");
        }
    } else {
        console.log("Invalid date.");
    }
};
window.addAttendanceDays = function (days) {
    for (let i = 0; i < days; i++) {
        if (attendanceManager.getCount() < attendanceManager.workingDays) {
            const date = new Date(attendanceManager.year, attendanceManager.month, attendanceManager.getCount() + 1);
            attendanceManager.addAttendance(date.getDate());
        }
    }
    attendanceUI.updateAll();
};
window.clearAllAttendance = function () {
    localStorage.removeItem('attendanceHistory');
    console.log('All attendance data cleared! Fresh start achieved.');
    location.reload();
};
window.createFakeMarkData = function () {
    const year = new Date().getFullYear();
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = new Date(year, m, 0).getDate();
        const randomDays = new Set();
        while (randomDays.size < 10) {
            randomDays.add(Math.floor(Math.random() * daysInMonth) + 1);
        }
        randomDays.forEach(day => {
            window.addAttendanceMark(day, m - 1, year);
        });
    }
};

}
