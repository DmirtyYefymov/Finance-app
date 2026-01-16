<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";

const error = ref<Error | null>(null);

onErrorCaptured((err: Error) => {
    error.value = err;
    console.error("ErrorBoundary caught error:", err);
    return false;
});

const resetError = () => {
    error.value = null;
};
</script>

<template>
    <div v-if="error" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors">
        <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-red-200 dark:border-red-900">
            <div class="flex items-center gap-3 mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-10 w-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Oops! Something went wrong
                </h2>
            </div>
            
            <p class="text-gray-600 dark:text-gray-400 mb-4">
                We encountered an unexpected error. Please try again.
            </p>
            
            <details class="mb-6">
                <summary class="cursor-pointer text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2">
                    Error details
                </summary>
                <pre class="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-auto text-red-600 dark:text-red-400">{{ error.message }}</pre>
            </details>
            
            <button
                @click="resetError"
                class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
                Try Again
            </button>
        </div>
    </div>
    
    <slot v-else />
</template>
