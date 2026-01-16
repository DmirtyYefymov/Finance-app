<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTransactions } from "./composables/useTransactions";
import { useTheme } from "./composables/useTheme";
import { useExchangeRates } from "./composables/useExchangeRates";
import { useCurrency } from "./composables/useCurrency";
import TransactionForm from "./components/TransactionForm.vue";
import TransactionList from "./components/TransactionList.vue";
import SidebarCurrency from "./components/SidebarCurrency.vue";
import QuickActions from "./components/QuickActions.vue";
import ErrorBoundary from "./components/ErrorBoundary.vue";

const showModal = ref(false);

const { isDarkMode, toggleTheme, loadTheme } = useTheme();
const { 
    exchangeRates, 
    refetch: refetchRates,
    isError 
} = useExchangeRates();
const { currency, setCurrency, loadCurrency } = useCurrency();

const { 
    transactions, 
    income,
    expenses,
    balance,
    addTransaction, 
    deleteTransaction, 
    loadTransactions 
} = useTransactions(currency, exchangeRates);

const handleAddTransaction = (
    transactionData: Omit<import("./types").Transaction, "id" | "date">
) => {
    addTransaction(transactionData);
    showModal.value = false;
};

onMounted(() => {
    loadTransactions();
    loadTheme();
    loadCurrency();
});
</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors"
    >
        <div class="container mx-auto px-4 py-6 max-w-7xl">
            <div class="flex gap-6">
                <aside class="w-72 flex-shrink-0 space-y-4">
                    <header
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-colors"
                    >
                        <div class="flex items-center gap-3">
                            <div class="flex-1 min-w-0">
                                <h1
                                    class="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:text-gray-100 bg-clip-text text-transparent truncate"
                                >
                                    Finance Tracker
                                </h1>
                                <p class="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                                    Manage your finances
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <button
                                    @click="toggleTheme"
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                    :class="
                                        isDarkMode
                                            ? 'bg-blue-600'
                                            : 'bg-gray-300'
                                    "
                                    role="switch"
                                    :aria-checked="isDarkMode"
                                >
                                    <span
                                        class="inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200"
                                        :class="
                                            isDarkMode
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                        "
                                    >
                                        <svg
                                            v-if="!isDarkMode"
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-3 w-3 text-yellow-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                                clip-rule="evenodd"
                                            />
                                        </svg>
                                        <svg
                                            v-else
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-3 w-3 text-blue-600"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                                            />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </header>

                    <QuickActions
                        :income="income"
                        :expenses="expenses"
                        :balance="balance"
                        :currency="currency"
                        @add-transaction="exchangeRates ? showModal = true : null" 
                    />

                    <SidebarCurrency
                        v-if="exchangeRates"
                        :currency
                        :exchangeRates
                        @update:currency="setCurrency"
                        @refresh-rates="refetchRates"
                    />
                </aside>

                <main class="flex-1 min-w-0">
                    <ErrorBoundary>
                        <div 
                            v-if="isError || !exchangeRates"
                            class="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 mb-6"
                        >
                            <div class="flex items-center gap-3 mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-8 w-8 text-red-600 dark:text-red-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <h3 class="text-xl font-bold text-red-800 dark:text-red-300">
                                    Unable to Load Exchange Rates
                                </h3>
                            </div>
                            <p class="text-red-700 dark:text-red-400 mb-4">
                                The application cannot display accurate currency conversions without current exchange rates from the National Bank of Ukraine.
                            </p>
                            <p class="text-red-600 dark:text-red-500 text-sm mb-4">
                                Please check your internet connection and try again.
                            </p>
                            <button
                                @click="() => refetchRates()"
                                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                Retry Loading Rates
                            </button>
                        </div>

                        <template v-else>
                            <TransactionList
                                :transactions
                                :currency
                                :exchangeRates
                                @delete="deleteTransaction"
                            />
                        </template>
                    </ErrorBoundary>
                </main>
            </div>
        </div>

        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="showModal && exchangeRates"
                    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
                    @click.self="showModal = false"
                >
                    <div
                        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors"
                    >
                        <div
                            class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl transition-colors"
                        >
                            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                Add Transaction
                            </h2>
                            <button
                                @click="showModal = false"
                                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6 text-gray-600 dark:text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div class="px-12 py-8">
                            <TransactionForm
                                :currency
                                :exchangeRates
                                @add="handleAddTransaction"
                            />
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
    transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
    transform: scale(0.9);
}
</style>
