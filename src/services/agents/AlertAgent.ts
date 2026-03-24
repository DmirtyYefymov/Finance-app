import { BaseAgent } from "./BaseAgent";
import type { AgentInput, AgentResult, Insight } from "../../types/agent";
import { convertFromUAH } from "../exchangeRate";

export class AlertAgent extends BaseAgent {
    readonly id = "alert-monitor";
    readonly name = "Alert Monitor";
    readonly description = "Flags unusual transactions and potential financial risks";
    readonly skill = "alert-monitoring" as const;

    run(input: AgentInput): AgentResult {
        const { transactions, rates, currency } = input;
        const insights: Insight[] = [];

        if (transactions.length === 0) {
            insights.push({
                type: "info",
                title: "All Clear",
                message: "No transactions to monitor yet.",
            });
            return this.buildResult(input, insights);
        }

        const convert = (amount: number): number =>
            rates ? convertFromUAH(amount, currency, rates) : amount;

        const expenseAmounts = transactions
            .filter((t) => t.type === "expense")
            .map((t) => convert(t.amount));

        if (expenseAmounts.length > 1) {
            const mean =
                expenseAmounts.reduce((s, a) => s + a, 0) / expenseAmounts.length;
            const stdDev = Math.sqrt(
                expenseAmounts.reduce((s, a) => s + (a - mean) ** 2, 0) /
                    expenseAmounts.length
            );
            const threshold = mean + 2 * stdDev;

            const largeExpenses = transactions
                .filter(
                    (t) =>
                        t.type === "expense" && convert(t.amount) >= threshold
                )
                .slice(-3);

            for (const tx of largeExpenses) {
                insights.push({
                    type: "warning",
                    title: "Unusually Large Expense",
                    message: `"${tx.description || tx.category}" (${convert(tx.amount).toFixed(2)} ${currency}) is significantly above your average expense.`,
                    value: convert(tx.amount),
                });
            }
        }

        const now = new Date();
        const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = new Date(now.getTime() - 30 * MILLISECONDS_PER_DAY);
        const recentIncome = transactions
            .filter(
                (t) =>
                    t.type === "income" &&
                    new Date(t.date) >= thirtyDaysAgo
            )
            .reduce((sum, t) => sum + convert(t.amount), 0);

        const recentExpenses = transactions
            .filter(
                (t) =>
                    t.type === "expense" &&
                    new Date(t.date) >= thirtyDaysAgo
            )
            .reduce((sum, t) => sum + convert(t.amount), 0);

        if (recentIncome > 0 && recentExpenses > recentIncome * 0.9) {
            insights.push({
                type: "danger",
                title: "Critical Spending Alert",
                message: `In the last 30 days expenses reached ${((recentExpenses / recentIncome) * 100).toFixed(1)}% of income. Take immediate action to avoid deficit.`,
                value: recentExpenses,
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: "success",
                title: "No Alerts",
                message: "Your spending patterns look normal. Keep it up!",
            });
        }

        return this.buildResult(input, insights);
    }
}
