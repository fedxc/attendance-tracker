import { calculateWorkingDays } from './utils.js';

// Default attendance goal percentage
const DEFAULT_ATTENDANCE_GOAL = 55;

export class AttendanceManager {
    constructor(year, month, history) {
        this.year = year;
        this.month = month; // 0-indexed (for date calculations)
        this.monthForStorage = month + 1;
        this.attendanceHistory = history;
        this.attendanceDays = this.loadAttendance();
        this.workingDays = calculateWorkingDays(year, month);
        // Default attendance goal is set to 55% (can be updated via the slider)
        this.requiredAttendance = Math.floor(this.workingDays * (DEFAULT_ATTENDANCE_GOAL / 100));
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
