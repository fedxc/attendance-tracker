import { AttendanceHistory } from './attendance/history.js';
import { AttendanceManager } from './attendance/manager.js';
import { AttendanceUI } from './ui/ui.js';
import { calculateWorkingDays } from './attendance/utils.js';
import { CONFIG } from './helpers.js';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed
const attendanceHistory = new AttendanceHistory();
const attendanceManager = new AttendanceManager(year, month, attendanceHistory);

// Initialize UI
const attendanceUI = new AttendanceUI(attendanceManager, today);






// Auto-reload stale sessions
// Reloads when the tab becomes visible again if midnight has passed since load,
// or if the page has been loaded for longer than STALENESS_THRESHOLD_MS.
const STALENESS_THRESHOLD_MS = 8 * 60 * 60 * 1000; // 8 hours

(function initStaleReload() {
    const loadedAt = Date.now();
    const loadedDay = new Date(loadedAt).toDateString();

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState !== "visible") return;

        const now = Date.now();
        const currentDay = new Date(now).toDateString();
        const elapsed = now - loadedAt;

        if (currentDay !== loadedDay || elapsed >= STALENESS_THRESHOLD_MS) {
            window.location.reload();
        }
    });
})();

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
