import type { IAgent, AgentInput, AgentResult } from "../../types/agent";
import { BudgetAnalyzerAgent } from "./BudgetAnalyzerAgent";
import { SavingsAdvisorAgent } from "./SavingsAdvisorAgent";
import { TrendAnalyzerAgent } from "./TrendAnalyzerAgent";
import { AlertAgent } from "./AlertAgent";

export class AgentCoordinator {
    private readonly agents: IAgent[];

    constructor(agents?: IAgent[]) {
        this.agents = agents ?? [
            new BudgetAnalyzerAgent(),
            new SavingsAdvisorAgent(),
            new TrendAnalyzerAgent(),
            new AlertAgent(),
        ];
    }

    runAll(input: AgentInput): AgentResult[] {
        return this.agents.map((agent) => agent.run(input));
    }

    runById(id: string, input: AgentInput): AgentResult | undefined {
        const agent = this.agents.find((a) => a.id === id);
        return agent?.run(input);
    }

    getAgentMeta(): Array<{ id: string; name: string; description: string; skill: IAgent["skill"] }> {
        return this.agents.map(({ id, name, description, skill }) => ({
            id,
            name,
            description,
            skill,
        }));
    }
}
