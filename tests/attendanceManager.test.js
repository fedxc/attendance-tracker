import test from 'node:test';
import assert from 'node:assert';
import { AttendanceManager } from '../js/attendance/manager.js';
import { AttendanceHistory } from '../js/attendance/history.js';

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

global.localStorage = mockLocalStorage;

test('AttendanceManager constructor initializes with correct values', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history); // January 2024
    
    assert.strictEqual(manager.year, 2024);
    assert.strictEqual(manager.month, 0); // 0-indexed
    assert.strictEqual(manager.monthForStorage, 1); // 1-indexed for storage
    assert.strictEqual(manager.attendanceHistory, history);
    assert.deepStrictEqual(manager.attendanceDays, []);
    assert.strictEqual(manager.requiredAttendance, 12); // 55% of 22 working days in Jan 2024
});

test('AttendanceManager loads existing attendance data', () => {
    mockLocalStorage.clear();
    const testData = { '2024-01': [{ day: 15, month: 1, year: 2024 }] };
    mockLocalStorage.setItem('attendanceHistory', JSON.stringify(testData));
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    assert.deepStrictEqual(manager.attendanceDays, [{ day: 15, month: 1, year: 2024 }]);
});

test('hasAttendance returns true for existing attendance', () => {
    mockLocalStorage.clear();
    const testData = { '2024-01': [{ day: 15, month: 1, year: 2024 }] };
    mockLocalStorage.setItem('attendanceHistory', JSON.stringify(testData));
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    assert.strictEqual(manager.hasAttendance(15), true);
    assert.strictEqual(manager.hasAttendance(16), false);
});

test('addAttendance adds new attendance entry', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    manager.addAttendance(15);
    
    assert.strictEqual(manager.hasAttendance(15), true);
    assert.deepStrictEqual(manager.attendanceDays, [{ day: 15, month: 1, year: 2024 }]);
});

test('addAttendance does not add duplicate entries', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    manager.addAttendance(15);
    manager.addAttendance(15); // Try to add again
    
    assert.strictEqual(manager.attendanceDays.length, 1);
    assert.deepStrictEqual(manager.attendanceDays, [{ day: 15, month: 1, year: 2024 }]);
});

test('removeAttendance removes existing entry', () => {
    mockLocalStorage.clear();
    const testData = { '2024-01': [{ day: 15, month: 1, year: 2024 }] };
    mockLocalStorage.setItem('attendanceHistory', JSON.stringify(testData));
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    manager.removeAttendance(15);
    
    assert.strictEqual(manager.hasAttendance(15), false);
    assert.deepStrictEqual(manager.attendanceDays, []);
});

test('removeAttendance handles non-existent entry gracefully', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    // Should not throw error
    manager.removeAttendance(15);
    
    assert.deepStrictEqual(manager.attendanceDays, []);
});

test('toggleAttendance adds attendance when not present', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    manager.toggleAttendance(15);
    
    assert.strictEqual(manager.hasAttendance(15), true);
});

test('toggleAttendance removes attendance when present', () => {
    mockLocalStorage.clear();
    const testData = { '2024-01': [{ day: 15, month: 1, year: 2024 }] };
    mockLocalStorage.setItem('attendanceHistory', JSON.stringify(testData));
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    manager.toggleAttendance(15);
    
    assert.strictEqual(manager.hasAttendance(15), false);
});

test('clearAttendance removes all entries', () => {
    mockLocalStorage.clear();
    const testData = { '2024-01': [{ day: 15, month: 1, year: 2024 }, { day: 16, month: 1, year: 2024 }] };
    mockLocalStorage.setItem('attendanceHistory', JSON.stringify(testData));
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    manager.clearAttendance();
    
    assert.deepStrictEqual(manager.attendanceDays, []);
    assert.strictEqual(manager.getCount(), 0);
});

test('getCount returns correct number of attendance entries', () => {
    mockLocalStorage.clear();
    const testData = { '2024-01': [{ day: 15, month: 1, year: 2024 }, { day: 16, month: 1, year: 2024 }] };
    mockLocalStorage.setItem('attendanceHistory', JSON.stringify(testData));
    
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    assert.strictEqual(manager.getCount(), 2);
});

test('saveAttendance persists data to localStorage', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const manager = new AttendanceManager(2024, 0, history);
    
    manager.addAttendance(15);
    manager.saveAttendance();
    
    const stored = JSON.parse(mockLocalStorage.getItem('attendanceHistory'));
    assert.deepStrictEqual(stored['2024-01'], [{ day: 15, month: 1, year: 2024 }]);
});

test('requiredAttendance is calculated correctly for different months', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    
    // February 2024 (leap year) - 21 working days, 55% = 12 (rounded)
    const febManager = new AttendanceManager(2024, 1, history);
    assert.strictEqual(febManager.requiredAttendance, 12);
    
    // March 2024 - 20 working days (minus Carnival), 55% = 11 (rounded)
    const marManager = new AttendanceManager(2024, 2, history);
    assert.strictEqual(marManager.requiredAttendance, 11);
});
