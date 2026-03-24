import { BaseAgent } from "./BaseAgent";
import type { AgentInput, AgentResult, Insight } from "../../types/agent";
import { convertFromUAH } from "../exchangeRate";

export class TrendAnalyzerAgent extends BaseAgent {
    readonly id = "trend-analyzer";
    readonly name = "Trend Analyzer";
    readonly description = "Detects spending and income trends over recent months";
    readonly skill = "trend-analysis" as const;

    run(input: AgentInput): AgentResult {
        const { transactions, rates, currency } = input;
        const insights: Insight[] = [];

        if (transactions.length < 2) {
            insights.push({
                type: "info",
                title: "Not Enough Data",
                message: "Add more transactions across different months to enable trend analysis.",
            });
            return this.buildResult(input, insights);
        }

        const convert = (amount: number): number =>
            rates ? convertFromUAH(amount, currency, rates) : amount;

        const byMonth: Record<string, { income: number; expenses: number }> = {};
        for (const t of transactions) {
            const month = t.date.slice(0, 7);
            if (!byMonth[month]) byMonth[month] = { income: 0, expenses: 0 };
            if (t.type === "income") {
                byMonth[month]!.income += convert(t.amount);
            } else {
                byMonth[month]!.expenses += convert(t.amount);
            }
        }

        const months = Object.keys(byMonth).sort();

        if (months.length >= 2) {
            const lastMonth = byMonth[months[months.length - 1]!]!;
            const prevMonth = byMonth[months[months.length - 2]!]!;

            const expenseDiff = lastMonth.expenses - prevMonth.expenses;
            if (expenseDiff > 0) {
                insights.push({
                    type: expenseDiff / (prevMonth.expenses || 1) > 0.2 ? "warning" : "info",
                    title: "Expenses Increased",
                    message: `Expenses rose by ${expenseDiff.toFixed(2)} ${currency} compared to the previous month.`,
                    value: expenseDiff,
                });
            } else if (expenseDiff < 0) {
                insights.push({
                    type: "success",
                    title: "Expenses Decreased",
                    message: `Expenses dropped by ${Math.abs(expenseDiff).toFixed(2)} ${currency} compared to the previous month — nice progress!`,
                    value: expenseDiff,
                });
            }

            const incomeDiff = lastMonth.income - prevMonth.income;
            if (incomeDiff > 0) {
                insights.push({
                    type: "success",
                    title: "Income Growing",
                    message: `Income increased by ${incomeDiff.toFixed(2)} ${currency} month-over-month.`,
                    value: incomeDiff,
                });
            } else if (incomeDiff < 0) {
                insights.push({
                    type: "warning",
                    title: "Income Declined",
                    message: `Income fell by ${Math.abs(incomeDiff).toFixed(2)} ${currency} compared to the previous month. Monitor this carefully.`,
                    value: incomeDiff,
                });
            }
        }

        if (months.length >= 3) {
            const recentExpenses = months.slice(-3).map((m) => byMonth[m]!.expenses);
            const isConsistentlyRising =
                recentExpenses[2]! > recentExpenses[1]! &&
                recentExpenses[1]! > recentExpenses[0]!;
            if (isConsistentlyRising) {
                insights.push({
                    type: "danger",
                    title: "3-Month Upward Expense Trend",
                    message: "Expenses have increased for three consecutive months. Immediate budget review is recommended.",
                });
            }
        }

        return this.buildResult(input, insights);
    }
}
