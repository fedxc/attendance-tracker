const test = require('node:test');
const assert = require('node:assert');
const { calculateWorkingDays, getHolidays } = require('../js/script.js');

test('calculateWorkingDays excludes weekends', () => {
  const workingDays = calculateWorkingDays(2021, 1); // February 2021
  assert.strictEqual(workingDays, 20);
});

test('calculateWorkingDays excludes holidays from getHolidays', () => {
  const holidays = getHolidays(2021).filter(h => h.getMonth() === 2); // March holidays
  assert.ok(holidays.some(h => h.getDate() === 3));
  assert.ok(holidays.some(h => h.getDate() === 4));
  const workingDays = calculateWorkingDays(2021, 2); // March 2021
  assert.strictEqual(workingDays, 21); // 23 weekdays - 2 holidays
});
