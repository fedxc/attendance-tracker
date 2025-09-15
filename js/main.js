import { AttendanceHistory } from './attendance/history.js';
import { AttendanceManager } from './attendance/manager.js';
import { AttendanceUI } from './ui/ui.js';
import { calculateWorkingDays } from './attendance/utils.js';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed
const attendanceHistory = new AttendanceHistory();
const attendanceManager = new AttendanceManager(year, month, attendanceHistory);

// Initialize UI
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




// Simple cache clearing
document.addEventListener("DOMContentLoaded", () => {
    const clearCacheBtn = document.getElementById("clearCacheBtn");
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener("click", async () => {
            try {
                if ("caches" in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                }
                alert("Cache cleared! The page will reload.");
                window.location.reload(true);
            } catch (error) {
                console.error("Error clearing cache:", error);
                alert("Error clearing cache. Please try again.");
            }
        });
    }
});
