import { ref, watch } from "vue";
import type { Currency } from "../types";
import { safeJSONParse } from "../utils/helpers";

export function useCurrency() {
    const currency = ref<Currency>("UAH");

    const loadCurrency = () => {
        const saved = localStorage.getItem("finance-tracker-currency");
        const loadedCurrency = safeJSONParse<Currency>(saved, "UAH");
        currency.value = loadedCurrency;
    };

    const saveCurrency = () => {
        try {
            localStorage.setItem(
                "finance-tracker-currency",
                JSON.stringify(currency.value)
            );
        } catch (e) {
            console.error("Error saving currency:", e);
        }
    };

    const setCurrency = (newCurrency: Currency) => {
        currency.value = newCurrency;
    };
    
    watch(currency, () => {
        saveCurrency();
    });

    return {
        currency,
        setCurrency,
        loadCurrency,
    };
}
