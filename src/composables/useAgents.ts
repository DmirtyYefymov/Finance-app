import { ref, computed, type Ref } from "vue";
import type { Transaction, Currency, ExchangeRates } from "../types";
import type { AgentResult } from "../types/agent";
import { AgentCoordinator } from "../services/agents/AgentCoordinator";

const coordinator = new AgentCoordinator();

export function useAgents(
    transactions: Ref<Transaction[]>,
    currency: Ref<Currency>,
    rates: Ref<ExchangeRates | undefined>
) {
    const results = ref<AgentResult[]>([]);
    const isRunning = ref(false);

    const agentMeta = computed(() => coordinator.getAgentMeta());

    const runAgents = () => {
        isRunning.value = true;
        const input = {
            transactions: transactions.value,
            rates: rates.value ?? null,
            currency: currency.value,
        };
        results.value = coordinator.runAll(input);
        isRunning.value = false;
    };

    const totalInsights = computed(() =>
        results.value.reduce((sum, r) => sum + r.insights.length, 0)
    );

    const warningCount = computed(() =>
        results.value.reduce(
            (sum, r) =>
                sum +
                r.insights.filter(
                    (i) => i.type === "warning" || i.type === "danger"
                ).length,
            0
        )
    );

    return {
        results,
        isRunning,
        agentMeta,
        totalInsights,
        warningCount,
        runAgents,
    };
}
