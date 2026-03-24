import { BaseAgent } from "./BaseAgent";
import type { AgentInput, AgentResult, Insight } from "../../types/agent";
import { convertFromUAH } from "../exchangeRate";

export class BudgetAnalyzerAgent extends BaseAgent {
    readonly id = "budget-analyzer";
    readonly name = "Budget Analyzer";
    readonly description = "Analyzes income and expense breakdown by category";
    readonly skill = "budget-analysis" as const;

    run(input: AgentInput): AgentResult {
        const { transactions, rates, currency } = input;
        const insights: Insight[] = [];

        if (transactions.length === 0) {
            insights.push({
                type: "info",
                title: "No Transactions",
                message: "Add your first transaction to start seeing budget analysis.",
            });
            return this.buildResult(input, insights);
        }

        const convert = (amount: number): number =>
            rates ? convertFromUAH(amount, currency, rates) : amount;

        const totalIncome = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + convert(t.amount), 0);

        const totalExpenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + convert(t.amount), 0);

        if (totalIncome === 0) {
            insights.push({
                type: "warning",
                title: "No Income Recorded",
                message: "You have expenses but no income entries. Add income transactions to get a full budget picture.",
            });
        } else {
            const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
            if (savingsRate >= 20) {
                insights.push({
                    type: "success",
                    title: "Healthy Savings Rate",
                    message: `You are saving ${savingsRate.toFixed(1)}% of your income — great financial discipline!`,
                    value: savingsRate,
                });
            } else if (savingsRate > 0) {
                insights.push({
                    type: "info",
                    title: "Moderate Savings Rate",
                    message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% to build financial security.`,
                    value: savingsRate,
                });
            } else {
                insights.push({
                    type: "danger",
                    title: "Spending Exceeds Income",
                    message: `Expenses exceed income by ${Math.abs(savingsRate).toFixed(1)}%. Review your budget immediately.`,
                    value: savingsRate,
                });
            }
        }

        const expenseByCategory = transactions
            .filter((t) => t.type === "expense")
            .reduce<Record<string, number>>((acc, t) => {
                acc[t.category] = (acc[t.category] ?? 0) + convert(t.amount);
                return acc;
            }, {});

        const topCategory = Object.entries(expenseByCategory).sort(
            ([, a], [, b]) => b - a
        )[0];

        if (topCategory) {
            const [category, amount] = topCategory;
            const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
            insights.push({
                type: pct > 50 ? "warning" : "info",
                title: "Top Expense Category",
                message: `"${category}" accounts for ${pct.toFixed(1)}% of your total expenses.`,
                value: pct,
            });
        }

        return this.buildResult(input, insights);
    }
}
