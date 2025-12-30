// Helper functions for attendance calculations
export function getHolidays(year) {
    return [
        new Date(year, 0, 1),  // New Year's Day
        new Date(year, 0, 6),  // Reyes
        new Date(year, 1, 16), // Carnival Monday
        new Date(year, 1, 17), // Carnival Tuesday
        new Date(year, 3, 2),  // Maundy Thursday
        new Date(year, 3, 3),  // Good Friday
        new Date(year, 4, 1),  // Labour Day
        new Date(year, 5, 19), // Artigas' Birthday
        new Date(year, 6, 18), // Constitution Day
        new Date(year, 7, 25), // Independence Day
        new Date(year, 11, 25) // Christmas Day
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
