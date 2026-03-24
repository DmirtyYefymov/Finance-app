import type { IAgent, AgentInput, AgentResult, AgentSkill } from "../../types/agent";

export abstract class BaseAgent implements IAgent {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly skill: AgentSkill;

    abstract run(input: AgentInput): AgentResult;

    protected buildResult(_input: AgentInput, insights: AgentResult["insights"]): AgentResult {
        return {
            agentId: this.id,
            agentName: this.name,
            agentDescription: this.description,
            skill: this.skill,
            insights,
            timestamp: new Date().toISOString(),
        };
    }
}
