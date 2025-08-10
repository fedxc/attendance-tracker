export class AttendanceHistory {
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
