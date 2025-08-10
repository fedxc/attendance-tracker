import { OptionsManager } from './optionsManager.js';
import { getHolidays } from '../attendance/utils.js';
import { showAttendanceNotification, calculateDistance, themes } from '../helpers.js';

export class AttendanceUI {
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
