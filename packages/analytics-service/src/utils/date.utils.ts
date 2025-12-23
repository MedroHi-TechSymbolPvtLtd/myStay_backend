export const getMonthStartEnd = (year: number, month: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return { startDate, endDate };
};

export const parseMonthYear = (monthYear: string) => {
    // Direct string return or parsing logic if needed
    return monthYear;
};
