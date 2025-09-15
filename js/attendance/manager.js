import { calculateWorkingDays } from './utils.js';
import { CONFIG } from '../helpers.js';
import { Validation } from '../utils/Validation.js';

export class AttendanceManager {
    constructor(year, month, history) {
        this.year = year;
        this.month = month; // 0-indexed (for date calculations)
        this.monthForStorage = month + 1;
        this.attendanceHistory = history;
        this.attendanceDays = this.loadAttendance();
        this.workingDays = calculateWorkingDays(year, month);
        // Default attendance goal is set to 55% (can be updated via the slider)
        this.requiredAttendance = Math.floor(this.workingDays * (CONFIG.DEFAULT_ATTENDANCE_GOAL / 100));
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
        if (!Validation.validateDate(this.year, this.month, day)) {
            throw new Error(`Invalid date: ${this.year}-${this.month + 1}-${day}`);
        }
        
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

    /**
     * Update the attendance goal percentage and recalculate required attendance
     * @param {number} goalPercentage - New goal percentage (0-100)
     */
    updateGoalPercentage(goalPercentage) {
        if (!Validation.validateAttendanceGoal(goalPercentage)) {
            throw new Error('Goal percentage must be between 0 and 100');
        }
        this.requiredAttendance = Math.floor(this.workingDays * (goalPercentage / 100));
    }

    /**
     * Get current goal percentage
     * @returns {number} Current goal percentage
     */
    getGoalPercentage() {
        return Math.round((this.requiredAttendance / this.workingDays) * 100);
    }
}
