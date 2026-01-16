<script setup lang="ts">
import { formatCurrency } from "../utils/helpers";
import type { Currency } from "../types";

defineProps<{
    income: number;
    expenses: number;
    balance: number;
    currency: Currency;
}>();

const emit = defineEmits<{
    "add-transaction": [];
}>();
</script>

<template>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-colors">
        <div class="flex items-center gap-2 mb-4">
            <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100">Balance</h3>
        </div>

        <div class="space-y-3 mb-4">
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Income</span>
                <span class="font-semibold text-green-600 dark:text-green-400">
                    {{ formatCurrency(income) }} {{ currency }}
                </span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
                <span class="font-semibold text-red-600 dark:text-red-400">
                    {{ formatCurrency(expenses) }} {{ currency }}
                </span>
            </div>
            <div class="h-px bg-gray-200 dark:bg-gray-700"></div>
            <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
                <span 
                    class="font-bold text-lg"
                    :class="balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'"
                >
                    {{ formatCurrency(balance) }} {{ currency }}
                </span>
            </div>
        </div>

        <div class="space-y-2">
            <button
                @click="emit('add-transaction')"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clip-rule="evenodd"
                    />
                </svg>
                <span>Add Transaction</span>
            </button>
        </div>
    </div>
</template>
