export const formatCurrency = (amount: number) => {
    return Number(amount).toFixed(2);
};

export const calculatePercentage = (part: number, total: number) => {
    if (total === 0) return 0;
    return Number(((part / total) * 100).toFixed(2));
};
