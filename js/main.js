import { AttendanceHistory } from './attendance/history.js';
import { AttendanceManager } from './attendance/manager.js';
import { AttendanceUI } from './ui/ui.js';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed
const attendanceHistory = new AttendanceHistory();
const attendanceManager = new AttendanceManager(year, month, attendanceHistory);
const attendanceUI = new AttendanceUI(attendanceManager, today);

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

// Optional Helper Functions for Testing
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
