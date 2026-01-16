export interface Transaction {
    id: string;
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
    category: string;
}

export type Currency = "UAH" | "USD" | "EUR";

export interface CurrencyInfo {
    code: Currency;
    symbol: string;
    name: string;
}

export interface ExchangeRates {
    USD: number;
    EUR: number;
    lastUpdated: string;
}
