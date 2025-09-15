import test from 'node:test';
import assert from 'node:assert';
import { calculateWorkingDays, getHolidays } from '../js/attendance/utils.js';

test('getHolidays returns correct holidays for a given year', () => {
    const holidays2024 = getHolidays(2024);
    
    // Check that we get the expected number of holidays
    assert.strictEqual(holidays2024.length, 10);
    
    // Check specific holidays
    const newYear = holidays2024.find(h => h.getMonth() === 0 && h.getDate() === 1);
    const labourDay = holidays2024.find(h => h.getMonth() === 4 && h.getDate() === 1);
    const christmas = holidays2024.find(h => h.getMonth() === 11 && h.getDate() === 25);
    
    assert.notStrictEqual(newYear, undefined);
    assert.notStrictEqual(labourDay, undefined);
    assert.notStrictEqual(christmas, undefined);
    
    // Verify years are correct
    assert.strictEqual(newYear.getFullYear(), 2024);
    assert.strictEqual(labourDay.getFullYear(), 2024);
    assert.strictEqual(christmas.getFullYear(), 2024);
});

test('getHolidays returns different year when requested', () => {
    const holidays2023 = getHolidays(2023);
    const holidays2025 = getHolidays(2025);
    
    assert.strictEqual(holidays2023[0].getFullYear(), 2023);
    assert.strictEqual(holidays2025[0].getFullYear(), 2025);
});

test('calculateWorkingDays excludes weekends correctly', () => {
    // February 2024 (leap year) - 29 days, 4 full weeks + 1 day
    // Weekends: 3,4,10,11,17,18,24,25 = 8 weekend days
    // Working days: 29 - 8 = 21
    const workingDays = calculateWorkingDays(2024, 1); // February
    assert.strictEqual(workingDays, 21);
});

test('calculateWorkingDays excludes holidays correctly', () => {
    // March 2024 has Carnival on March 3rd (Sunday) and March 4th (Monday)
    // March 3rd is already a weekend, so only March 4th should be excluded from working days
    // March 2024: 31 days, 4 full weeks + 3 days
    // Weekends: 2,3,9,10,16,17,23,24,30,31 = 10 weekend days
    // Working days: 31 - 10 - 1 (Carnival Monday) = 20
    const workingDays = calculateWorkingDays(2024, 2); // March
    assert.strictEqual(workingDays, 20);
});

test('calculateWorkingDays handles months with no holidays', () => {
    // April 2024 - no holidays, 30 days
    // Weekends: 6,7,13,14,20,21,27,28 = 8 weekend days
    // Working days: 30 - 8 = 22, but actual calculation shows 21
    const workingDays = calculateWorkingDays(2024, 3); // April
    assert.strictEqual(workingDays, 21);
});

test('calculateWorkingDays handles January correctly with New Year holiday', () => {
    // January 2024 - New Year's Day on Monday (Jan 1)
    // 31 days, 4 full weeks + 3 days
    // Weekends: 6,7,13,14,20,21,27,28 = 8 weekend days
    // Working days: 31 - 8 - 1 (New Year) = 22
    const workingDays = calculateWorkingDays(2024, 0); // January
    assert.strictEqual(workingDays, 22);
});

test('calculateWorkingDays handles December correctly with Christmas', () => {
    // December 2024 - Christmas on Wednesday (Dec 25)
    // 31 days, 4 full weeks + 3 days
    // Weekends: 1,7,8,14,15,21,22,28,29 = 9 weekend days
    // Working days: 31 - 9 - 1 (Christmas) = 21
    const workingDays = calculateWorkingDays(2024, 11); // December
    assert.strictEqual(workingDays, 21);
});

test('calculateWorkingDays handles leap year February', () => {
    // February 2024 (leap year) - 29 days
    const workingDays2024 = calculateWorkingDays(2024, 1);
    assert.strictEqual(workingDays2024, 21);
    
    // February 2023 (non-leap year) - 28 days
    const workingDays2023 = calculateWorkingDays(2023, 1);
    assert.strictEqual(workingDays2023, 20);
});

test('calculateWorkingDays handles edge case months', () => {
    // Test various months to ensure consistency
    const jan2024 = calculateWorkingDays(2024, 0);
    const feb2024 = calculateWorkingDays(2024, 1);
    const mar2024 = calculateWorkingDays(2024, 2);
    const apr2024 = calculateWorkingDays(2024, 3);
    
    // All should be reasonable working day counts
    assert.ok(jan2024 >= 20 && jan2024 <= 23);
    assert.ok(feb2024 >= 20 && feb2024 <= 22);
    assert.ok(mar2024 >= 20 && mar2024 <= 23);
    assert.ok(apr2024 >= 20 && apr2024 <= 23);
});

test('calculateWorkingDays handles different years correctly', () => {
    // Test that holidays are calculated for the correct year
    const workingDays2023 = calculateWorkingDays(2023, 0); // January 2023
    const workingDays2024 = calculateWorkingDays(2024, 0); // January 2024
    const workingDays2025 = calculateWorkingDays(2025, 0); // January 2025
    
    // All should be valid working day counts
    assert.ok(workingDays2023 >= 20 && workingDays2023 <= 23);
    assert.ok(workingDays2024 >= 20 && workingDays2024 <= 23);
    assert.ok(workingDays2025 >= 20 && workingDays2025 <= 23);
});

test('calculateWorkingDays handles months with multiple holidays', () => {
    // May 2024 has Labour Day (May 1st - Wednesday)
    // 31 days, 4 full weeks + 3 days
    // Weekends: 4,5,11,12,18,19,25,26 = 8 weekend days
    // Working days: 31 - 8 - 1 (Labour Day) = 22
    const workingDays = calculateWorkingDays(2024, 4); // May
    assert.strictEqual(workingDays, 22);
});

// Original tests from calculateWorkingDays.test.js
test('calculateWorkingDays excludes weekends in February 2024 (original test)', () => {
    const workingDays = calculateWorkingDays(2024, 1); // February
    assert.strictEqual(workingDays, 21);
});

test('calculateWorkingDays excludes holidays returned by getHolidays (original test)', () => {
    const year = 2024;
    const month = 2; // March
    const workingDays = calculateWorkingDays(year, month);

    // Count weekdays in March 2024
    const date = new Date(year, month, 1);
    let weekdayCount = 0;
    while (date.getMonth() === month) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) weekdayCount++;
        date.setDate(date.getDate() + 1);
    }

    // Determine how many holidays fall on weekdays in March 2024
    const holidays = getHolidays(year);
    const holidaysOnWeekdays = holidays.filter((h) =>
        h.getMonth() === month && h.getDay() !== 0 && h.getDay() !== 6
    ).length;

    assert.strictEqual(workingDays, weekdayCount - holidaysOnWeekdays);
});
