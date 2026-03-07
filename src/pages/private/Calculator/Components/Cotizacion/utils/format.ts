export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

export const formatCurrencyDecimals = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};
