import test from 'node:test';
import assert from 'node:assert';
import { AttendanceHistory } from '../js/attendance/history.js';
import { AttendanceManager } from '../js/attendance/manager.js';
import { calculateWorkingDays, getHolidays } from '../js/attendance/utils.js';
import { OptionsManager } from '../js/ui/optionsManager.js';

// Mock localStorage for testing
const mockLocalStorage = {
    data: {},
    getItem: function(key) {
        return this.data[key] || null;
    },
    setItem: function(key, value) {
        this.data[key] = value;
    },
    removeItem: function(key) {
        delete this.data[key];
    },
    clear: function() {
        this.data = {};
    }
};

// Mock document and getComputedStyle
const mockDocument = {
    documentElement: {
        style: {
            setProperty: function(property, value) {
                this[property] = value;
            }
        }
    }
};

global.localStorage = mockLocalStorage;
global.document = mockDocument;
global.getComputedStyle = function(element) {
    return {
        getPropertyValue: function(property) {
            const mockStyles = {
                '--color-bg': '#fffbf7',
                '--color-text': '#45372b',
                '--color-progress-fill': '#df7020'
            };
            return mockStyles[property] || '';
        }
    };
};

test('Complete attendance workflow integration test', () => {
    mockLocalStorage.clear();
    
    // Initialize all components
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history); // January 2024
    const optionsManager = new OptionsManager();
    
    // Verify initial state
    assert.strictEqual(manager.getCount(), 0);
    assert.strictEqual(manager.requiredAttendance, 12); // 55% of 22 working days
    
    // Add some attendance
    manager.addAttendance(15);
    manager.addAttendance(16);
    manager.addAttendance(17);
    
    // Verify attendance was recorded
    assert.strictEqual(manager.getCount(), 3);
    assert.strictEqual(manager.hasAttendance(15), true);
    assert.strictEqual(manager.hasAttendance(16), true);
    assert.strictEqual(manager.hasAttendance(17), true);
    
    // Verify data persistence
    const stored = JSON.parse(mockLocalStorage.getItem('attendanceHistory'));
    assert.deepStrictEqual(stored['2024-01'], [
        { day: 15, month: 1, year: 2024 },
        { day: 16, month: 1, year: 2024 },
        { day: 17, month: 1, year: 2024 }
    ]);
    
    // Test options persistence
    optionsManager.updateOption('attendanceGoal', 75);
    const savedOptions = JSON.parse(mockLocalStorage.getItem('customOptions'));
    assert.strictEqual(savedOptions.attendanceGoal, 75);
});

test('Attendance goal calculation integration', () => {
    mockLocalStorage.clear();
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history); // January 2024
    
    // January 2024 has 22 working days
    const workingDays = calculateWorkingDays(2024, 0);
    assert.strictEqual(workingDays, 22);
    
    // Default goal is 55%
    const expectedRequired = Math.floor(workingDays * 0.55);
    assert.strictEqual(manager.requiredAttendance, expectedRequired);
    assert.strictEqual(manager.requiredAttendance, 12);
});

test('Holiday exclusion integration', () => {
    mockLocalStorage.clear();
    
    // Test March 2024 which has Carnival holiday
    const holidays = getHolidays(2024);
    const marchHolidays = holidays.filter(h => h.getMonth() === 2); // March
    
    // Should have Carnival on March 3rd and 4th
    assert.ok(marchHolidays.length >= 2);
    
    const workingDays = calculateWorkingDays(2024, 2); // March
    assert.strictEqual(workingDays, 20); // 21 weekdays - 1 holiday on weekday
});

test('Data consistency across components', () => {
    mockLocalStorage.clear();
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    // Add attendance through manager
    manager.addAttendance(15);
    
    // Verify it's accessible through history
    const monthData = history.getMonthData(2024, 1);
    assert.deepStrictEqual(monthData, [{ day: 15, month: 1, year: 2024 }]);
    
    // Verify manager can read it back
    assert.strictEqual(manager.hasAttendance(15), true);
    assert.strictEqual(manager.getCount(), 1);
});

test('Options and attendance data isolation', () => {
    mockLocalStorage.clear();
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    const optionsManager = new OptionsManager();
    
    // Add attendance data
    manager.addAttendance(15);
    
    // Modify options
    optionsManager.updateOption('background', '#ff0000');
    optionsManager.updateOption('attendanceGoal', 80);
    
    // Verify data isolation
    const attendanceData = JSON.parse(mockLocalStorage.getItem('attendanceHistory'));
    const optionsData = JSON.parse(mockLocalStorage.getItem('customOptions'));
    
    assert.ok(attendanceData['2024-01']);
    assert.strictEqual(optionsData.background, '#ff0000');
    assert.strictEqual(optionsData.attendanceGoal, 80);
    
    // Verify attendance data wasn't affected by options changes
    assert.deepStrictEqual(attendanceData['2024-01'], [{ day: 15, month: 1, year: 2024 }]);
});

test('Month boundary handling', () => {
    mockLocalStorage.clear();
    
    const history = new AttendanceHistory();
    
    // Test January 2024
    const janManager = new AttendanceManager(2024, 0, history);
    janManager.addAttendance(15);
    
    // Test February 2024
    const febManager = new AttendanceManager(2024, 1, history);
    febManager.addAttendance(10);
    
    // Verify data is stored separately
    const stored = JSON.parse(mockLocalStorage.getItem('attendanceHistory'));
    assert.deepStrictEqual(stored['2024-01'], [{ day: 15, month: 1, year: 2024 }]);
    assert.deepStrictEqual(stored['2024-02'], [{ day: 10, month: 2, year: 2024 }]);
    
    // Verify managers can only see their own data
    assert.strictEqual(janManager.hasAttendance(15), true);
    assert.strictEqual(janManager.hasAttendance(10), false);
    assert.strictEqual(febManager.hasAttendance(10), true);
    assert.strictEqual(febManager.hasAttendance(15), false);
});

test('Error handling integration', () => {
    mockLocalStorage.clear();
    
    // Test with corrupted attendance data
    mockLocalStorage.setItem('attendanceHistory', 'invalid json');
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    // Should handle gracefully
    assert.deepStrictEqual(manager.attendanceDays, []);
    assert.strictEqual(manager.getCount(), 0);
    
    // Should still be able to add new data
    manager.addAttendance(15);
    assert.strictEqual(manager.getCount(), 1);
});

test('Working days calculation consistency', () => {
    // Test that working days calculation is consistent across different months
    const months = [
        { year: 2024, month: 0, expected: 22 }, // January
        { year: 2024, month: 1, expected: 21 }, // February (leap year)
        { year: 2024, month: 2, expected: 20 }, // March (with Carnival)
        { year: 2024, month: 3, expected: 21 }, // April
        { year: 2024, month: 4, expected: 22 }  // May (with Labour Day)
    ];
    
    months.forEach(({ year, month, expected }) => {
        const workingDays = calculateWorkingDays(year, month);
        assert.strictEqual(workingDays, expected, 
            `Working days for ${year}-${month + 1} should be ${expected}, got ${workingDays}`);
    });
});

test('Attendance goal percentage calculation', () => {
    mockLocalStorage.clear();
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history); // January 2024
    
    // Test different goal percentages
    const testCases = [
        { goal: 50, expected: 11 }, // 50% of 22 = 11
        { goal: 55, expected: 12 }, // 55% of 22 = 12.1 -> 12
        { goal: 60, expected: 13 }, // 60% of 22 = 13.2 -> 13
        { goal: 75, expected: 16 }, // 75% of 22 = 16.5 -> 16
        { goal: 100, expected: 22 } // 100% of 22 = 22
    ];
    
    testCases.forEach(({ goal, expected }) => {
        manager.requiredAttendance = Math.floor(manager.workingDays * (goal / 100));
        assert.strictEqual(manager.requiredAttendance, expected, 
            `${goal}% of ${manager.workingDays} working days should be ${expected}`);
    });
});
