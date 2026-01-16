import { describe, it, expect, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useTransactions } from '../composables/useTransactions';
import type { Currency, ExchangeRates } from '../types';

describe('useTransactions', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('adds transaction', () => {
        const { transactions, addTransaction } = useTransactions();
        
        addTransaction({
            type: 'income',
            amount: 1000,
            category: 'Salary',
            description: 'Test',
        });

        expect(transactions.value).toHaveLength(1);
        expect(transactions.value[0]?.amount).toBe(1000);
    });

    it('deletes transaction', () => {
        const { transactions, addTransaction, deleteTransaction } = useTransactions();
        
        const tx = addTransaction({
            type: 'expense',
            amount: 500,
            category: 'Food',
            description: 'Test',
        });

        deleteTransaction(tx.id);
        expect(transactions.value).toHaveLength(0);
    });

    it('calculates balance in UAH', () => {
        const { addTransaction, balance } = useTransactions();
        
        addTransaction({ type: 'income', amount: 2000, category: 'Salary', description: 'Test' });
        addTransaction({ type: 'expense', amount: 500, category: 'Food', description: 'Test' });

        expect(balance.value).toBe(1500);
    });

    it('calculates balance with currency conversion', () => {
        const currency = ref<Currency>('USD');
        const rates = ref<ExchangeRates>({
            USD: 40,
            EUR: 45,
            lastUpdated: new Date().toISOString()
        });

        const { addTransaction, balance } = useTransactions(currency, rates);
        
        addTransaction({ type: 'income', amount: 4000, category: 'Salary', description: 'Test' });
        addTransaction({ type: 'expense', amount: 2000, category: 'Food', description: 'Test' });

        expect(balance.value).toBe(50); // (4000-2000)/40 = 50 USD
    });
});
