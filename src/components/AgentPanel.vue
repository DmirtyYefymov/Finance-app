<script setup lang="ts">
import type { AgentResult } from "../types/agent";

defineProps<{
    results: AgentResult[];
    isRunning: boolean;
    warningCount: number;
}>();

defineEmits<{
    run: [];
}>();

const skillLabel: Record<string, string> = {
    "budget-analysis": "Budget",
    "savings-advice": "Savings",
    "trend-analysis": "Trends",
    "alert-monitoring": "Alerts",
};

const skillColor: Record<string, string> = {
    "budget-analysis": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "savings-advice": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    "trend-analysis": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    "alert-monitoring": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const insightBorder: Record<string, string> = {
    info: "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20",
    success: "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20",
    warning: "border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
    danger: "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20",
};

const insightTitle: Record<string, string> = {
    info: "text-blue-800 dark:text-blue-300",
    success: "text-green-800 dark:text-green-300",
    warning: "text-yellow-800 dark:text-yellow-300",
    danger: "text-red-800 dark:text-red-300",
};

const insightText: Record<string, string> = {
    info: "text-blue-700 dark:text-blue-400",
    success: "text-green-700 dark:text-green-400",
    warning: "text-yellow-700 dark:text-yellow-400",
    danger: "text-red-700 dark:text-red-400",
};

const insightIcon: Record<string, string> = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    danger: "🚨",
};
</script>

<template>
    <section
        class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors"
    >
        <div
            class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700"
        >
            <div>
                <h2 class="text-base font-bold text-gray-800 dark:text-gray-100">
                    AI Financial Agents
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ results.length }} agents · {{ warningCount }} alert{{ warningCount !== 1 ? "s" : "" }}
                </p>
            </div>

            <button
                @click="$emit('run')"
                :disabled="isRunning"
                class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors"
                :class="
                    isRunning
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    :class="isRunning ? 'animate-spin' : ''"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clip-rule="evenodd"
                    />
                </svg>
                {{ isRunning ? "Running…" : "Run Agents" }}
            </button>
        </div>

        <div v-if="results.length === 0" class="px-5 py-8 text-center">
            <p class="text-gray-400 dark:text-gray-500 text-sm">
                Click <strong>Run Agents</strong> to analyse your finances with all specialised agents.
            </p>
        </div>

        <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
            <div
                v-for="result in results"
                :key="result.agentId"
                class="px-5 py-4"
            >
                <div class="flex items-center gap-2 mb-3">
                    <span
                        class="text-xs font-semibold px-2 py-0.5 rounded-full"
                        :class="skillColor[result.skill]"
                    >
                        {{ skillLabel[result.skill] ?? result.skill }}
                    </span>
                    <span class="font-semibold text-sm text-gray-800 dark:text-gray-100">
                        {{ result.agentName }}
                    </span>
                    <span class="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                        {{ result.agentDescription }}
                    </span>
                </div>

                <ul class="space-y-2">
                    <li
                        v-for="(insight, idx) in result.insights"
                        :key="idx"
                        class="rounded-lg border px-3 py-2.5 text-sm"
                        :class="insightBorder[insight.type]"
                    >
                        <div class="flex items-center gap-1.5 mb-0.5">
                            <span>{{ insightIcon[insight.type] }}</span>
                            <span
                                class="font-semibold"
                                :class="insightTitle[insight.type]"
                            >{{ insight.title }}</span>
                        </div>
                        <p :class="insightText[insight.type]">
                            {{ insight.message }}
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
