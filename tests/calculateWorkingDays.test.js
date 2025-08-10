import test from 'node:test';
import assert from 'node:assert';
import { calculateWorkingDays, getHolidays } from '../js/attendance/utils.js';

// Verify weekends are excluded using February 2024 (leap year)
test('calculateWorkingDays excludes weekends in February 2024', () => {
  const workingDays = calculateWorkingDays(2024, 1); // February
  assert.strictEqual(workingDays, 21);
});

// Verify holidays from getHolidays are excluded
// Using March 2024 which contains a Carnival holiday on March 4th (Monday)
test('calculateWorkingDays excludes holidays returned by getHolidays', () => {
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
