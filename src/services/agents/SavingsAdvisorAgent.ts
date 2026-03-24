import { BaseAgent } from "./BaseAgent";
import type { AgentInput, AgentResult, Insight } from "../../types/agent";
import { convertFromUAH } from "../exchangeRate";

export class SavingsAdvisorAgent extends BaseAgent {
    readonly id = "savings-advisor";
    readonly name = "Savings Advisor";
    readonly description = "Recommends savings strategies based on spending habits";
    readonly skill = "savings-advice" as const;

    run(input: AgentInput): AgentResult {
        const { transactions, rates, currency } = input;
        const insights: Insight[] = [];

        if (transactions.length === 0) {
            insights.push({
                type: "info",
                title: "Nothing to Advise Yet",
                message: "Record transactions first to receive personalised savings recommendations.",
            });
            return this.buildResult(input, insights);
        }

        const convert = (amount: number): number =>
            rates ? convertFromUAH(amount, currency, rates) : amount;

        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + convert(t.amount), 0);

        const expenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + convert(t.amount), 0);

        const discretionaryCategories = new Set([
            "Entertainment",
            "Other",
        ]);

        const discretionarySpend = transactions
            .filter((t) => t.type === "expense" && discretionaryCategories.has(t.category))
            .reduce((sum, t) => sum + convert(t.amount), 0);

        if (income > 0) {
            const recommended = income * 0.2;
            const current = income - expenses;

            if (current < recommended) {
                const gap = recommended - current;
                insights.push({
                    type: "warning",
                    title: "Savings Goal Gap",
                    message: `To meet the 20% savings rule you need to save ${gap.toFixed(2)} more ${currency}. Consider reducing discretionary spending.`,
                    value: gap,
                });
            } else {
                insights.push({
                    type: "success",
                    title: "Savings Goal Met",
                    message: `You are on track! You have saved ${current.toFixed(2)} ${currency} which exceeds the recommended 20% target.`,
                    value: current,
                });
            }
        }

        if (discretionarySpend > 0 && expenses > 0) {
            const pct = (discretionarySpend / expenses) * 100;
            if (pct > 30) {
                insights.push({
                    type: "warning",
                    title: "High Discretionary Spending",
                    message: `${pct.toFixed(1)}% of expenses go to discretionary categories (Entertainment, Other). Cutting back could boost savings.`,
                    value: pct,
                });
            }
        }

        if (expenses > 0) {
            const foodSpend = transactions
                .filter((t) => t.type === "expense" && t.category === "Food")
                .reduce((sum, t) => sum + convert(t.amount), 0);
            const foodPct = (foodSpend / expenses) * 100;
            if (foodPct > 35) {
                insights.push({
                    type: "info",
                    title: "Food Budget Tip",
                    message: `Food spending is ${foodPct.toFixed(1)}% of expenses. Meal planning or cooking at home can significantly reduce costs.`,
                    value: foodPct,
                });
            }
        }

        return this.buildResult(input, insights);
    }
}
