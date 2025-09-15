/**
 * Simple validation utilities
 * Provides input validation without over-engineering
 */

export class Validation {
    /**
     * Validate attendance goal percentage
     * @param {number} goal - Goal percentage
     * @returns {boolean} True if valid
     */
    static validateAttendanceGoal(goal) {
        return typeof goal === 'number' && 
               !isNaN(goal) && 
               goal >= 0 && 
               goal <= 100;
    }

    /**
     * Validate date components
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @param {number} day - Day (1-31)
     * @returns {boolean} True if valid
     */
    static validateDate(year, month, day) {
        if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') {
            return false;
        }

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return false;
        }

        if (year < 1900 || year > 2100) {
            return false;
        }

        if (month < 0 || month > 11) {
            return false;
        }

        if (day < 1 || day > 31) {
            return false;
        }

        // Check if the date is actually valid
        const date = new Date(year, month, day);
        return date.getFullYear() === year && 
               date.getMonth() === month && 
               date.getDate() === day;
    }

    /**
     * Validate color hex value
     * @param {string} color - Color hex string
     * @returns {boolean} True if valid
     */
    static validateColor(color) {
        if (typeof color !== 'string') {
            return false;
        }
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    /**
     * Validate CSV line format
     * @param {string} line - CSV line
     * @returns {boolean} True if valid
     */
    static validateCSVLine(line) {
        if (typeof line !== 'string') {
            return false;
        }
        const parts = line.split(',');
        return parts.length === 3 && parts.every(part => part.trim() !== '');
    }
}
