import { CONFIG } from '../helpers.js';

export class AttendanceHistory {
    constructor() {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEYS.ATTENDANCE_HISTORY);
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
            localStorage.setItem(CONFIG.STORAGE_KEYS.ATTENDANCE_HISTORY, JSON.stringify(this.data));
        } catch (error) {
            console.error("Error saving attendance history to localStorage", error);
        }
    }

    clearMonthData(year, month) {
        const key = this.getMonthKey(year, month);
        delete this.data[key];
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ATTENDANCE_HISTORY, JSON.stringify(this.data));
        } catch (error) {
            console.error("Error clearing attendance history in localStorage", error);
        }
    }

    /**
     * Get all attendance history data
     * @returns {Object} All attendance data
     */
    getAllData() {
        return this.data;
    }

    /**
     * Set all attendance history data (for import functionality)
     * @param {Object} data - Complete attendance data
     */
    setAllData(data) {
        this.data = data;
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ATTENDANCE_HISTORY, JSON.stringify(this.data));
        } catch (error) {
            console.error("Error saving all attendance history to localStorage", error);
        }
    }

    /**
     * Clear all attendance data
     */
    clearAllData() {
        this.data = {};
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.ATTENDANCE_HISTORY, JSON.stringify(this.data));
        } catch (error) {
            console.error("Error clearing all attendance history from localStorage", error);
        }
    }
}
