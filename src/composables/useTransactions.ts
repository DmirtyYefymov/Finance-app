import { ref, computed, type Ref } from "vue";
import type { Transaction, Currency, ExchangeRates } from "../types";
import { STORAGE_KEYS } from "../constants";
import { safeJSONParse, generateId } from "../utils/helpers";
import { convertFromUAH } from "../services/exchangeRate";

export function useTransactions(
    currency?: Ref<Currency>, 
    exchangeRates?: Ref<ExchangeRates | undefined>
) {
    const transactions = ref<Transaction[]>([]);

    const loadTransactions = () => {
        const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        transactions.value = safeJSONParse<Transaction[]>(saved, []);
    };

    const saveTransactions = () => {
        try {
            localStorage.setItem(
                STORAGE_KEYS.TRANSACTIONS,
                JSON.stringify(transactions.value)
            );
        } catch (e) {
            console.error("Error saving transactions:", e);
        }
    };

    const addTransaction = (transactionData: Omit<Transaction, "id" | "date">) => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: generateId(),
            date: new Date().toISOString(),
        };

        transactions.value.push(newTransaction);
        saveTransactions();
        return newTransaction;
    };

    const deleteTransaction = (id: string) => {
        const index = transactions.value.findIndex((t) => t.id === id);
        if (index !== -1) {
            transactions.value.splice(index, 1);
            saveTransactions();
            return true;
        }
        return false;
    };

    const convertAmount = (amount: number): number => {
        if (!currency?.value || !exchangeRates?.value) return amount;
        return convertFromUAH(amount, currency.value, exchangeRates.value);
    };

    const income = computed(() =>
        transactions.value
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + convertAmount(t.amount), 0)
    );

    const expenses = computed(() =>
        transactions.value
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + convertAmount(t.amount), 0)
    );

    const balance = computed(() => income.value - expenses.value);

    const sortedTransactions = computed(() =>
        [...transactions.value].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    );

    return {
        transactions,
        sortedTransactions,
        income,
        expenses,
        balance,
        loadTransactions,
        addTransaction,
        deleteTransaction,
    };
}
