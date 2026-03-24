import { describe, it, expect } from "vitest";
import type { AgentInput } from "../types/agent";
import type { Transaction, ExchangeRates } from "../types";
import { BudgetAnalyzerAgent } from "../services/agents/BudgetAnalyzerAgent";
import { SavingsAdvisorAgent } from "../services/agents/SavingsAdvisorAgent";
import { TrendAnalyzerAgent } from "../services/agents/TrendAnalyzerAgent";
import { AlertAgent } from "../services/agents/AlertAgent";
import { AgentCoordinator } from "../services/agents/AgentCoordinator";

const rates: ExchangeRates = {
    USD: 40,
    EUR: 45,
    lastUpdated: new Date().toISOString(),
};

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
    return {
        id: Math.random().toString(36).slice(2),
        type: "expense",
        amount: 500,
        category: "Food",
        description: "Test",
        date: new Date().toISOString(),
        ...overrides,
    };
}

function makeInput(transactions: Transaction[], currency = "UAH" as const): AgentInput {
    return { transactions, rates, currency };
}

// ──────────────────────────────────────────────
// BudgetAnalyzerAgent
// ──────────────────────────────────────────────
describe("BudgetAnalyzerAgent", () => {
    const agent = new BudgetAnalyzerAgent();

    it("returns info insight when no transactions", () => {
        const result = agent.run(makeInput([]));
        expect(result.insights).toHaveLength(1);
        expect(result.insights[0]?.type).toBe("info");
    });

    it("reports healthy savings rate when income far exceeds expenses", () => {
        const txs = [
            makeTx({ type: "income", amount: 10000, category: "Salary" }),
            makeTx({ type: "expense", amount: 1000, category: "Food" }),
        ];
        const result = agent.run(makeInput(txs));
        const savingsInsight = result.insights.find((i) => i.title.includes("Savings"));
        expect(savingsInsight?.type).toBe("success");
    });

    it("reports danger when expenses exceed income", () => {
        const txs = [
            makeTx({ type: "income", amount: 1000, category: "Salary" }),
            makeTx({ type: "expense", amount: 2000, category: "Food" }),
        ];
        const result = agent.run(makeInput(txs));
        const balanceInsight = result.insights.find((i) =>
            i.title.includes("Spending Exceeds")
        );
        expect(balanceInsight?.type).toBe("danger");
    });

    it("identifies top expense category", () => {
        const txs = [
            makeTx({ type: "income", amount: 5000, category: "Salary" }),
            makeTx({ type: "expense", amount: 3000, category: "Entertainment" }),
            makeTx({ type: "expense", amount: 500, category: "Food" }),
        ];
        const result = agent.run(makeInput(txs));
        const topCat = result.insights.find((i) => i.title === "Top Expense Category");
        expect(topCat?.message).toContain("Entertainment");
    });

    it("sets correct agentId and skill", () => {
        const result = agent.run(makeInput([]));
        expect(result.agentId).toBe("budget-analyzer");
        expect(result.skill).toBe("budget-analysis");
    });
});

// ──────────────────────────────────────────────
// SavingsAdvisorAgent
// ──────────────────────────────────────────────
describe("SavingsAdvisorAgent", () => {
    const agent = new SavingsAdvisorAgent();

    it("returns info insight when no transactions", () => {
        const result = agent.run(makeInput([]));
        expect(result.insights[0]?.type).toBe("info");
    });

    it("reports savings goal met when saving >20%", () => {
        const txs = [
            makeTx({ type: "income", amount: 10000, category: "Salary" }),
            makeTx({ type: "expense", amount: 1000, category: "Food" }),
        ];
        const result = agent.run(makeInput(txs));
        const goalInsight = result.insights.find((i) => i.title.includes("Savings Goal"));
        expect(goalInsight?.type).toBe("success");
    });

    it("warns when saving rate is below 20%", () => {
        const txs = [
            makeTx({ type: "income", amount: 5000, category: "Salary" }),
            makeTx({ type: "expense", amount: 4500, category: "Food" }),
        ];
        const result = agent.run(makeInput(txs));
        const gapInsight = result.insights.find((i) => i.title === "Savings Goal Gap");
        expect(gapInsight?.type).toBe("warning");
    });

    it("warns on high discretionary spending", () => {
        const txs = [
            makeTx({ type: "income", amount: 10000, category: "Salary" }),
            makeTx({ type: "expense", amount: 4000, category: "Entertainment" }),
            makeTx({ type: "expense", amount: 500, category: "Food" }),
        ];
        const result = agent.run(makeInput(txs));
        const discInsight = result.insights.find((i) =>
            i.title.includes("Discretionary")
        );
        expect(discInsight?.type).toBe("warning");
    });
});

// ──────────────────────────────────────────────
// TrendAnalyzerAgent
// ──────────────────────────────────────────────
describe("TrendAnalyzerAgent", () => {
    const agent = new TrendAnalyzerAgent();

    it("returns not-enough-data insight with fewer than 2 transactions", () => {
        const result = agent.run(makeInput([makeTx()]));
        expect(result.insights[0]?.title).toBe("Not Enough Data");
    });

    it("detects income growth month-over-month", () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const txs = [
            makeTx({ type: "income", amount: 3000, category: "Salary", date: lastMonth.toISOString() }),
            makeTx({ type: "income", amount: 5000, category: "Salary", date: new Date().toISOString() }),
        ];
        const result = agent.run(makeInput(txs));
        const growthInsight = result.insights.find((i) => i.title === "Income Growing");
        expect(growthInsight?.type).toBe("success");
    });

    it("detects expense increase", () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const txs = [
            makeTx({ type: "expense", amount: 1000, category: "Food", date: lastMonth.toISOString() }),
            makeTx({ type: "expense", amount: 2000, category: "Food", date: new Date().toISOString() }),
        ];
        const result = agent.run(makeInput(txs));
        const expInsight = result.insights.find((i) => i.title === "Expenses Increased");
        expect(expInsight).toBeDefined();
    });
});

// ──────────────────────────────────────────────
// AlertAgent
// ──────────────────────────────────────────────
describe("AlertAgent", () => {
    const agent = new AlertAgent();

    it("returns all-clear insight when no transactions", () => {
        const result = agent.run(makeInput([]));
        expect(result.insights[0]?.type).toBe("info");
    });

    it("flags unusually large expense", () => {
        const txs = [
            makeTx({ type: "expense", amount: 100, category: "Food" }),
            makeTx({ type: "expense", amount: 100, category: "Food" }),
            makeTx({ type: "expense", amount: 100, category: "Food" }),
            makeTx({ type: "expense", amount: 100, category: "Food" }),
            makeTx({ type: "expense", amount: 100000, category: "Other", description: "Luxury purchase" }),
        ];
        const result = agent.run(makeInput(txs));
        const alertInsight = result.insights.find((i) =>
            i.title === "Unusually Large Expense"
        );
        expect(alertInsight?.type).toBe("warning");
    });

    it("returns success insight when all spending is normal", () => {
        const txs = [
            makeTx({ type: "income", amount: 10000, category: "Salary" }),
            makeTx({ type: "expense", amount: 1000, category: "Food" }),
        ];
        const result = agent.run(makeInput(txs));
        const ok = result.insights.find((i) => i.title === "No Alerts");
        expect(ok?.type).toBe("success");
    });

    it("triggers critical spending alert when expenses near income", () => {
        const txs = [
            makeTx({ type: "income", amount: 5000, category: "Salary" }),
            makeTx({ type: "expense", amount: 4800, category: "Food" }),
        ];
        const result = agent.run(makeInput(txs));
        const critical = result.insights.find((i) =>
            i.title === "Critical Spending Alert"
        );
        expect(critical?.type).toBe("danger");
    });
});

// ──────────────────────────────────────────────
// AgentCoordinator
// ──────────────────────────────────────────────
describe("AgentCoordinator", () => {
    const coordinator = new AgentCoordinator();

    it("runs all 4 agents and returns results for each", () => {
        const results = coordinator.runAll(makeInput([]));
        expect(results).toHaveLength(4);
        const ids = results.map((r) => r.agentId);
        expect(ids).toContain("budget-analyzer");
        expect(ids).toContain("savings-advisor");
        expect(ids).toContain("trend-analyzer");
        expect(ids).toContain("alert-monitor");
    });

    it("runs a specific agent by id", () => {
        const result = coordinator.runById("budget-analyzer", makeInput([]));
        expect(result).toBeDefined();
        expect(result?.agentId).toBe("budget-analyzer");
    });

    it("returns undefined for unknown agent id", () => {
        const result = coordinator.runById("unknown-agent", makeInput([]));
        expect(result).toBeUndefined();
    });

    it("exposes agent metadata for all agents", () => {
        const meta = coordinator.getAgentMeta();
        expect(meta).toHaveLength(4);
        for (const m of meta) {
            expect(m.id).toBeTruthy();
            expect(m.name).toBeTruthy();
            expect(m.skill).toBeTruthy();
        }
    });

    it("each result has a timestamp", () => {
        const results = coordinator.runAll(makeInput([]));
        for (const r of results) {
            expect(r.timestamp).toBeTruthy();
            expect(() => new Date(r.timestamp)).not.toThrow();
        }
    });
});
