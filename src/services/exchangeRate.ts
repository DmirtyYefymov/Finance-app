import type { ExchangeRates, Currency, CurrencyInfo } from "../types";
import { API_ENDPOINTS } from "../constants";

export interface NBUExchangeRate {
    r030: number;
    txt: string;
    rate: number;
    cc: string;
    exchangedate: string;
}

export const CURRENCIES: CurrencyInfo[] = [
    { code: "UAH", symbol: "₴", name: "Hryvnia" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
];

export const getCurrencySymbol = (code: Currency): string => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || code;
};

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
    const response = await fetch(API_ENDPOINTS.NBU_EXCHANGE_RATES);
    if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }

    const data: NBUExchangeRate[] = await response.json();

    const usdRate = data.find((item) => item.cc === "USD");
    const eurRate = data.find((item) => item.cc === "EUR");

    if (!usdRate || !eurRate) {
        throw new Error("USD or EUR rate not found in API response");
    }

    return {
        USD: usdRate.rate,
        EUR: eurRate.rate,
        lastUpdated: new Date().toISOString(),
    };
};

export const convertFromUAH = (
    amount: number,
    toCurrency: Currency,
    rates: ExchangeRates
): number => {
    if (toCurrency === "UAH") return amount;
    return amount / rates[toCurrency];
};

export const convertToUAH = (
    amount: number,
    fromCurrency: Currency,
    rates: ExchangeRates
): number => {
    if (fromCurrency === "UAH") return amount;
    return amount * rates[fromCurrency];
};
