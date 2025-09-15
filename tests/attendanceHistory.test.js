import test from 'node:test';
import assert from 'node:assert';
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

// Replace global localStorage with mock
global.localStorage = mockLocalStorage;

test('AttendanceHistory constructor initializes with empty data when localStorage is empty', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    assert.deepStrictEqual(history.data, {});
});

test('AttendanceHistory constructor loads existing data from localStorage', () => {
    mockLocalStorage.clear();
    const testData = { '2024-01': [{ day: 15, month: 1, year: 2024 }] };
    mockLocalStorage.setItem('attendanceHistory', JSON.stringify(testData));
    
    const history = new AttendanceHistory();
    assert.deepStrictEqual(history.data, testData);
});

test('AttendanceHistory constructor handles corrupted localStorage data gracefully', () => {
    mockLocalStorage.clear();
    mockLocalStorage.setItem('attendanceHistory', 'invalid json');
    
    const history = new AttendanceHistory();
    assert.deepStrictEqual(history.data, {});
});

test('getMonthKey formats month correctly for single digits', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    
    assert.strictEqual(history.getMonthKey(2024, 1), '2024-01');
    assert.strictEqual(history.getMonthKey(2024, 9), '2024-09');
});

test('getMonthKey formats month correctly for double digits', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    
    assert.strictEqual(history.getMonthKey(2024, 10), '2024-10');
    assert.strictEqual(history.getMonthKey(2024, 12), '2024-12');
});

test('getMonthData returns empty array for non-existent month', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    
    const result = history.getMonthData(2024, 1);
    assert.deepStrictEqual(result, []);
});

test('getMonthData returns existing data for month', () => {
    mockLocalStorage.clear();
    const testData = { '2024-01': [{ day: 15, month: 1, year: 2024 }] };
    mockLocalStorage.setItem('attendanceHistory', JSON.stringify(testData));
    
    const history = new AttendanceHistory();
    const result = history.getMonthData(2024, 1);
    assert.deepStrictEqual(result, [{ day: 15, month: 1, year: 2024 }]);
});

test('saveMonthData stores data correctly', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const testEntries = [{ day: 15, month: 1, year: 2024 }];
    
    history.saveMonthData(2024, 1, testEntries);
    
    const stored = JSON.parse(mockLocalStorage.getItem('attendanceHistory'));
    assert.deepStrictEqual(stored['2024-01'], testEntries);
});

test('saveMonthData updates existing month data', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const initialEntries = [{ day: 15, month: 1, year: 2024 }];
    const updatedEntries = [{ day: 15, month: 1, year: 2024 }, { day: 16, month: 1, year: 2024 }];
    
    history.saveMonthData(2024, 1, initialEntries);
    history.saveMonthData(2024, 1, updatedEntries);
    
    const stored = JSON.parse(mockLocalStorage.getItem('attendanceHistory'));
    assert.deepStrictEqual(stored['2024-01'], updatedEntries);
});

test('clearMonthData removes month data', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    const testEntries = [{ day: 15, month: 1, year: 2024 }];
    
    history.saveMonthData(2024, 1, testEntries);
    history.clearMonthData(2024, 1);
    
    const stored = JSON.parse(mockLocalStorage.getItem('attendanceHistory'));
    assert.strictEqual(stored['2024-01'], undefined);
});

test('clearMonthData handles non-existent month gracefully', () => {
    mockLocalStorage.clear();
    const history = new AttendanceHistory();
    
    // Should not throw error
    history.clearMonthData(2024, 1);
    
    const stored = JSON.parse(mockLocalStorage.getItem('attendanceHistory'));
    assert.deepStrictEqual(stored, {});
});
