/**
 * Agent execution wrapper that validates status and returns the final Claude output.
 * (Claude version of execute-agent.ts)
 */
import { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { buildAgent, runAgent } from "./build-agent";

export async function executeAgent({
    agentConfig,
    userEmail,
    input,
}: {
    agentConfig: CreatedAgentType,
    userEmail: string,
    input: string
}) {

    if (agentConfig.status.toLowerCase() !== 'active') {
        throw new Error('Agent is not active!')
    }

    // Build the runtime agent lazily so tool connections are fresh for each run.
    const agent = await buildAgent(agentConfig, userEmail);

    // Chat messages provide input; scheduled/manual runs fall back to the saved objective.
    const finalOutput = await runAgent(agent, input?.trim() || agentConfig?.objective);

    return {
        finalOutput
    }
}