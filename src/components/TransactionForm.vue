<script setup lang="ts">
import { ref, computed } from "vue";
import type { Transaction, Currency, ExchangeRates } from "../types";
import { getCurrencySymbol, convertToUAH } from "../services/exchangeRate";

const props = defineProps<{
    currency: Currency;
    exchangeRates: ExchangeRates;
}>();

const emit = defineEmits<{
    add: [transaction: Omit<Transaction, "id" | "date">];
}>();

const type = ref<"income" | "expense">("expense");
const amount = ref("");
const description = ref("");
const category = ref("");
const errors = ref<Record<string, string>>({});

const categories = {
    income: ["Salary", "Freelance", "Gift", "Other"],
    expense: [
        "Food",
        "Transport",
        "Entertainment",
        "Health",
        "Utilities",
        "Other",
    ],
};

const isFormValid = computed(() => {
    return amount.value && description.value && category.value;
});

const handleSubmit = () => {
    errors.value = {};

    if (!amount.value || parseFloat(amount.value) <= 0) {
        errors.value.amount = "Amount must be greater than 0";
    }
    if (!description.value.trim()) {
        errors.value.description = "Description is required";
    }
    if (!category.value) {
        errors.value.category = "Please select a category";
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    const amountInUAH = convertToUAH(
        parseFloat(amount.value),
        props.currency,
        props.exchangeRates
    );

    emit("add", {
        type: type.value,
        amount: amountInUAH,
        description: description.value.trim(),
        category: category.value,
    });

    amount.value = "";
    description.value = "";
    category.value = "";
};
</script>

<template>
    <div>
        <form @submit.prevent="handleSubmit" class="space-y-5">
            <div class="flex flex-col gap-3 p-3">
                <label class="flex items-center cursor-pointer flex-1">
                    <input
                        type="radio"
                        v-model="type"
                        value="income"
                        class="mr-3 w-5 h-5 text-green-600"
                    />
                    <div class="flex items-center gap-1">
                        <span class="text-gray-700 dark:text-gray-200 font-semibold">Income</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="green"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                        </svg>
                    </div>
                </label>
                <label class="flex items-center cursor-pointer flex-1">
                    <input
                        type="radio"
                        v-model="type"
                        value="expense"
                        class="mr-3 w-5 h-5 text-red-600"
                    />
                    <div class="flex items-center gap-1">
                        <span class="text-gray-700 dark:text-gray-200 font-semibold">Expense</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="red"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                            />
                        </svg>
                    </div>
                </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label
                        class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                    >
                        Amount ({{ getCurrencySymbol(currency) }}
                        {{ currency }})
                    </label>
                    <div class="relative">
                        <span
                            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg"
                            >{{ getCurrencySymbol(currency) }}</span
                        >
                        <input
                            type="number"
                            v-model="amount"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            class="w-full pl-10 pr-4 py-3 border-2 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 transition-all"
                            :class="errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'"
                            required
                        />
                    </div>
                    <p v-if="errors.amount" class="mt-1 text-sm text-red-600 dark:text-red-400">
                        {{ errors.amount }}
                    </p>
                </div>

                <div>
                    <label
                        class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                    >
                        Category
                    </label>
                    <select
                        v-model="category"
                        class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white dark:bg-gray-700"
                        required
                    >
                        <option value="">Select category</option>
                        <option
                            v-for="cat in categories[type]"
                            :key="cat"
                            :value="cat"
                        >
                            {{ cat }}
                        </option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Description
                </label>
                <input
                    type="text"
                    v-model="description"
                    placeholder="e.g., Grocery shopping"
                    class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                />
            </div>

            <button
                type="submit"
                :disabled="!isFormValid"
                :class="[
                    type === 'income'
                        ? 'bg-green-600 hover:bg-green-800'
                        : 'bg-red-600 hover:bg-red-800',
                    !isFormValid && 'opacity-50 cursor-not-allowed hover:scale-100'
                ]"
                class="w-full text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
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
                Add {{ type === "income" ? "Income" : "Expense" }}
            </button>
        </form>
    </div>
</template>
