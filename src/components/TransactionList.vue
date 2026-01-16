<script setup lang="ts">
import { computed, ref } from "vue";
import type { Transaction, Currency, ExchangeRates } from "../types";
import { convertFromUAH } from "../services/exchangeRate";
import { formatDate, formatCurrency, debounce } from "../utils/helpers";

const props = defineProps<{
    transactions: Transaction[];
    currency: Currency;
    exchangeRates: ExchangeRates;
}>();

const emit = defineEmits<{
    delete: [id: string];
}>();

const searchQuery = ref("");
const debouncedSearchQuery = ref("");

const updateSearch = debounce((value: string) => {
    debouncedSearchQuery.value = value;
}, 300);

const handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    searchQuery.value = target.value;
    updateSearch(target.value);
};

const convertAmount = (amount: number): number => {
    return convertFromUAH(amount, props.currency, props.exchangeRates);
};

const filteredTransactions = computed(() => {
    if (!debouncedSearchQuery.value) {
        return props.transactions;
    }
    
    const query = debouncedSearchQuery.value.toLowerCase();
    return props.transactions.filter(
        (t) =>
            t.description.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            t.type.toLowerCase().includes(query)
    );
});

const sortedTransactions = computed(() => {
    return [...filteredTransactions.value].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
});
</script>

<template>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <div class="flex items-center gap-3 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Transaction History
            </h2>
            <span
                v-if="debouncedSearchQuery"
                class="text-sm text-gray-500 dark:text-gray-400"
            >
                ({{ sortedTransactions.length }} found)
            </span>
        </div>

        <div class="mb-4">
            <div class="relative">
                <input
                    type="text"
                    :value="searchQuery"
                    @input="handleSearchInput"
                    placeholder="Search transactions"
                    class="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all"
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
        </div>

        <div
            v-if="transactions.length === 0"
            class="text-center py-16 text-gray-400 dark:text-gray-500"
        >
            <p class="text-lg font-medium">No transactions yet</p>
        </div>

        <div
            v-else-if="sortedTransactions.length === 0"
            class="text-center py-16 text-gray-400 dark:text-gray-500"
        >
            <p class="text-lg font-medium">No transactions found</p>
        </div>

        <div v-else class="space-y-3">
            <div
                v-for="transaction in sortedTransactions"
                :key="transaction.id"
                class="flex items-center justify-between p-5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750"
            >
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-3">
                        <div
                            :class="
                                transaction.type === 'income'
                                    ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                                    : 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                            "
                            class="px-4 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5"
                        >
                            <svg
                                v-if="transaction.type === 'income'"
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            {{
                                transaction.type === "income"
                                    ? "Income"
                                    : "Expense"
                            }}
                        </div>
                        <span class="font-semibold text-gray-800 dark:text-gray-100 text-lg">{{
                            transaction.description
                        }}</span>
                    </div>

                    <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span
                            class="bg-white dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 font-medium"
                            >{{ transaction.category }}</span
                        >
                        <div class="flex items-center gap-1.5">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4 text-gray-400 dark:text-gray-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <span>{{ formatDate(transaction.date) }}</span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-5">
                    <div
                        :class="
                            transaction.type === 'income'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                        "
                        class="text-2xl font-bold flex items-baseline gap-1"
                    >
                        <span class="text-lg">{{
                            transaction.type === "income" ? "+" : "-"
                        }}</span>
                        <span>{{
                            formatCurrency(convertAmount(transaction.amount))
                        }}</span>
                        <span class="text-sm font-semibold opacity-80">{{
                            currency
                        }}</span>
                    </div>

                    <button
                        @click="emit('delete', transaction.id)"
                        class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
