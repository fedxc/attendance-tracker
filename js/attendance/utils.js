// Helper functions for attendance calculations
export function getHolidays(year) {
    return [
        new Date(year, 0, 1),    // New Year's Day
        new Date(year, 4, 1),    // Labour Day
        new Date(year, 11, 25),  // Christmas Day
        new Date(year, 0, 6),    // Reyes
        new Date(year, 2, 3),    // Carnival
        new Date(year, 2, 4),    // Carnival
        new Date(year, 3, 18),   // 33 - moved
        new Date(year, 5, 19),   // Artigas
        new Date(year, 6, 18),   // Constitution Day
        new Date(year, 7, 25)    // Independence Day
    ];
}

export function calculateWorkingDays(year, month) {
    const holidays = getHolidays(year);
    const date = new Date(year, month, 1);
    let count = 0;
    while (date.getMonth() === month) {
        const dayOfWeek = date.getDay();
        const isHoliday = holidays.some(holiday =>
            holiday.getDate() === date.getDate() &&
            holiday.getMonth() === date.getMonth() &&
            holiday.getFullYear() === date.getFullYear()
        );
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) count++;
        date.setDate(date.getDate() + 1);
    }
    return count;
}
