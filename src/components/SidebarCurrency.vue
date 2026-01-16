<script setup lang="ts">
import { ref } from "vue";
import type { Currency, ExchangeRates } from "../types";
import { CURRENCIES, getCurrencySymbol } from "../services/exchangeRate";
import { formatDate, debounce } from "../utils/helpers";

const props = defineProps<{
    currency: Currency;
    exchangeRates: ExchangeRates;
}>();

const emit = defineEmits<{
    "update:currency": [currency: Currency];
    "refresh-rates": [];
}>();

const showCurrencyMenu = ref(false);

const selectCurrency = (newCurrency: Currency) => {
    emit("update:currency", newCurrency);
    showCurrencyMenu.value = false;
};

const refreshRates = debounce(() => {
    emit("refresh-rates");
}, 1000);
</script>

<template>
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-colors">
        <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
                <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100">Currency</h3>
            </div>
            <button
                @click="refreshRates"
                class="p-2 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                title="Refresh rates"
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
            </button>
        </div>

        <div class="relative mb-4">
            <button
                @click="showCurrencyMenu = !showCurrencyMenu"
                class="w-full flex items-center justify-between gap-2 px-4 py-3 text-gray-800 dark:text-gray-100 font-semibold rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
                <div class="flex items-center gap-2">
                    <span class="text-xl">{{
                        getCurrencySymbol(currency)
                    }}</span>
                    <span>{{ currency }}</span>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 transition-transform"
                    :class="{ 'rotate-180': showCurrencyMenu }"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                    />
                </svg>
            </button>

            <div
                v-if="showCurrencyMenu"
                class="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10"
            >
                <button
                    v-for="curr in CURRENCIES"
                    :key="curr.code"
                    @click="selectCurrency(curr.code)"
                    :class="{
                        'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': currency === curr.code,
                        'hover:bg-gray-50 dark:hover:bg-gray-700': currency !== curr.code,
                    }"
                    class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                    <span class="text-xl">{{ curr.symbol }}</span>
                    <div class="flex-1">
                        <div class="font-semibold dark:text-gray-200">{{ curr.code }}</div>
                        <div class="text-xs text-gray-600 dark:text-gray-400">{{ curr.name }}</div>
                    </div>
                    <svg
                        v-if="currency === curr.code"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-blue-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <div class="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Exchange Rates</p>
            </div>
            <div class="flex items-center justify-between mb-2">
                <p class="text-xs text-gray-400 dark:text-gray-500">Last Updated:</p>
                <p class="text-xs text-gray-400 dark:text-gray-500">
                    {{ formatDate(exchangeRates.lastUpdated) }}
                </p>
            </div>

            <div
                v-for="curr in CURRENCIES.filter((c) => c.code !== 'UAH')"
                :key="curr.code"
                class="flex items-center justify-between p-2 text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
                <div class="flex items-center gap-2">
                    <span class="text-lg">{{ curr.symbol }}</span>
                    <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">{{
                        curr.code
                    }}</span>
                </div>
                <div class="font-bold ">
                    {{
                        (
                            exchangeRates[
                                curr.code as keyof typeof exchangeRates
                            ] as number
                        ).toFixed(2)
                    }}
                    <span class="text-xs text-gray-600 dark:text-gray-400">₴</span>
                </div>
            </div>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mb-2 text-center">
                Official rates from NBU
            </p>
        </div>
    </div>
</template>
