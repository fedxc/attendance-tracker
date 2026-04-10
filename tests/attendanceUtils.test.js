import test from 'node:test';
import assert from 'node:assert';
import { calculateWorkingDays, getHolidays } from '../js/attendance/utils.js';

test('getHolidays includes fixed holidays for any year', () => {
    for (const year of [2024, 2025, 2026]) {
        const holidays = getHolidays(year);

        const newYear   = holidays.find(h => h.getMonth() === 0  && h.getDate() === 1);
        const labourDay = holidays.find(h => h.getMonth() === 4  && h.getDate() === 1);
        const christmas = holidays.find(h => h.getMonth() === 11 && h.getDate() === 25);

        assert.notStrictEqual(newYear,   undefined, `${year}: New Year missing`);
        assert.notStrictEqual(labourDay, undefined, `${year}: Labour Day missing`);
        assert.notStrictEqual(christmas, undefined, `${year}: Christmas missing`);

        assert.strictEqual(newYear.getFullYear(),   year);
        assert.strictEqual(labourDay.getFullYear(), year);
        assert.strictEqual(christmas.getFullYear(), year);
    }
});

test('getHolidays returns different year when requested', () => {
    const holidays2023 = getHolidays(2023);
    const holidays2025 = getHolidays(2025);

    assert.strictEqual(holidays2023[0].getFullYear(), 2023);
    assert.strictEqual(holidays2025[0].getFullYear(), 2025);
});

test('calculateWorkingDays excludes weekends correctly', () => {
    // January 2025 has no holidays on weekdays (New Year is Wed Jan 1, Labour Day not in Jan)
    // 31 days, weekends: 4,5,11,12,18,19,25,26 = 8 days, holiday: Jan 1 (Wed) = 1
    // Working days = 31 - 8 - 1 = 22
    const workingDays = calculateWorkingDays(2025, 0);
    assert.ok(workingDays >= 20 && workingDays <= 23,
        `January 2025 working days should be reasonable, got ${workingDays}`);
});

test('calculateWorkingDays excludes fixed holidays on weekdays', () => {
    // Labour Day (May 1) in 2025 is a Thursday — must reduce weekday count
    // May 2025: 31 days, weekends: 3,4,10,11,17,18,24,25,31 = 9 days
    // Without holidays: 31 - 9 = 22; minus Labour Day (Thu) = 21
    const workingDays = calculateWorkingDays(2025, 4); // May 2025
    assert.strictEqual(workingDays, 21);
});

test('calculateWorkingDays excludes holidays returned by getHolidays', () => {
    const year = 2025;
    const month = 4; // May

    const date = new Date(year, month, 1);
    let weekdayCount = 0;
    while (date.getMonth() === month) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) weekdayCount++;
        date.setDate(date.getDate() + 1);
    }

    const holidays = getHolidays(year);
    const holidaysOnWeekdays = holidays.filter(h =>
        h.getMonth() === month && h.getDay() !== 0 && h.getDay() !== 6
    ).length;

    const workingDays = calculateWorkingDays(year, month);
    assert.strictEqual(workingDays, weekdayCount - holidaysOnWeekdays);
});

test('calculateWorkingDays handles leap year February', () => {
    // Feb 2024 is a leap year (29 days), Feb 2023 is not (28 days)
    // Both should produce a reasonable working day count
    const workingDays2024 = calculateWorkingDays(2024, 1);
    const workingDays2023 = calculateWorkingDays(2023, 1);

    assert.ok(workingDays2024 >= 19 && workingDays2024 <= 22,
        `Feb 2024 (leap) got ${workingDays2024}`);
    assert.ok(workingDays2023 >= 18 && workingDays2023 <= 21,
        `Feb 2023 (non-leap) got ${workingDays2023}`);
    assert.ok(workingDays2024 >= workingDays2023,
        'Leap year Feb should have >= working days than non-leap');
});

test('calculateWorkingDays handles edge case months', () => {
    const jan2025 = calculateWorkingDays(2025, 0);
    const feb2025 = calculateWorkingDays(2025, 1);
    const mar2025 = calculateWorkingDays(2025, 2);
    const apr2025 = calculateWorkingDays(2025, 3);

    assert.ok(jan2025 >= 20 && jan2025 <= 23, `Jan got ${jan2025}`);
    assert.ok(feb2025 >= 18 && feb2025 <= 22, `Feb got ${feb2025}`);
    assert.ok(mar2025 >= 19 && mar2025 <= 23, `Mar got ${mar2025}`);
    assert.ok(apr2025 >= 19 && apr2025 <= 23, `Apr got ${apr2025}`);
});

test('calculateWorkingDays handles different years correctly', () => {
    const jan2023 = calculateWorkingDays(2023, 0);
    const jan2024 = calculateWorkingDays(2024, 0);
    const jan2025 = calculateWorkingDays(2025, 0);

    assert.ok(jan2023 >= 20 && jan2023 <= 23, `Jan 2023 got ${jan2023}`);
    assert.ok(jan2024 >= 20 && jan2024 <= 23, `Jan 2024 got ${jan2024}`);
    assert.ok(jan2025 >= 20 && jan2025 <= 23, `Jan 2025 got ${jan2025}`);
});

test('calculateWorkingDays result is always less than total weekdays', () => {
    const year = 2025;
    for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        let weekdays = 0;
        while (date.getMonth() === month) {
            const d = date.getDay();
            if (d !== 0 && d !== 6) weekdays++;
            date.setDate(date.getDate() + 1);
        }
        const working = calculateWorkingDays(year, month);
        assert.ok(working <= weekdays,
            `Month ${month + 1}: working days (${working}) exceeds weekdays (${weekdays})`);
        assert.ok(working > 0, `Month ${month + 1}: working days should be > 0`);
    }
});
