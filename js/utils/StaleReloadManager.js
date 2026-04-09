// Reloads the page when the tab becomes visible again after midnight has passed
// since load, or after a configurable staleness threshold.
const STALENESS_THRESHOLD_MS = 8 * 60 * 60 * 1000; // 8 hours

export function initStaleReload() {
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
}
