import type { Transaction, Currency, ExchangeRates } from "./index";

export type AgentSkill =
    | "budget-analysis"
    | "savings-advice"
    | "trend-analysis"
    | "alert-monitoring";

export type InsightType = "info" | "warning" | "success" | "danger";

export interface Insight {
    type: InsightType;
    title: string;
    message: string;
    value?: number;
}

export interface AgentInput {
    transactions: Transaction[];
    rates: ExchangeRates | null;
    currency: Currency;
}

export interface AgentResult {
    agentId: string;
    agentName: string;
    agentDescription: string;
    skill: AgentSkill;
    insights: Insight[];
    timestamp: string;
}

export interface IAgent {
    id: string;
    name: string;
    description: string;
    skill: AgentSkill;
    run(input: AgentInput): AgentResult;
}
