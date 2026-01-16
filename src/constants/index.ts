export const STORAGE_KEYS = {
    TRANSACTIONS: "finance-tracker-transactions",
    THEME: "finance-tracker-theme",
    CURRENCY: "finance-tracker-currency",
} as const;

export const API_ENDPOINTS = {
    NBU_EXCHANGE_RATES:
        "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json",
} as const;

export const TIME = {
    HOUR: 1000 * 60 * 60,
    MINUTE: 1000 * 60,
    SECOND: 1000,
} as const;

export const TRANSACTION_CATEGORIES = {
    INCOME: ["Salary", "Freelance", "Gift", "Other"],
    EXPENSE: ["Food", "Transport", "Entertainment", "Health", "Utilities", "Other"],
} as const;
