/**
 * Factory that prepares a Claude Agent SDK run with Composio tools, browser research,
 * and agent-specific instructions. (Claude version of build-agent.ts)
 */
import { CreatedAgentType } from "@/components/custom/agents/CreateAgent";
import { getOrCreateAgentSession } from "../get-agent-composio-session";
import { createSdkMcpServer, query } from "@anthropic-ai/claude-agent-sdk";
// NOTE: this must be rewritten in Claude Agent SDK format (see notes). Send me the file and I'll convert it.
import { browserbaseResearchTool } from "./browserbase-tool";

export async function buildAgent(agentConfig: CreatedAgentType, userEmail: string) {
    // Each agent gets its own Composio session so toolkit access follows its config.
    const session = await getOrCreateAgentSession(agentConfig, userEmail);
    const composioTools = await session.tools();

    // Compose persisted agent details into one system prompt.
    const systemPrompt = `
    Role: ${agentConfig?.description},

    Instructions:
    ${agentConfig.instructions},

    Primary Objective
    ${agentConfig.objective},

    Skills:
    ${(agentConfig.skills ?? []).join(', ')}

    Browser Research Rules:
- Use browser_research when the user explicitly asks to search or browse the internet.
- Use browser_research for current prices, availability, comparisons, news, and other live facts.
- Do not claim that pricing is current unless browser_research verified it.
- Include the source URLs returned by browser_research in the final answer.
- Clearly distinguish verified facts from conclusions or recommendations.
- Browser research is read-only. Never use it to purchase, log in, submit forms,
  upload files, download files, or modify external systems.


    Use only the available tools when needed.
    Do not claim that an action succeeded unless the tool result confirms it.
    Ask for confirmation before destructive or high-risk actions.
    `.trim();

    // The Claude Agent SDK exposes custom tools through in-process MCP servers.
    const composioServer = createSdkMcpServer({
        name: "composio",
        version: "1.0.0",
        tools: composioTools as any,
    });

    const browserServer = createSdkMcpServer({
        name: "browserbase",
        version: "1.0.0",
        tools: [browserbaseResearchTool] as any,
    });

    // There is no Agent class in the Claude SDK, so we return the run options instead.
    return {
        name: agentConfig.name,
        systemPrompt,
        options: {
            model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
            systemPrompt,
            mcpServers: {
                composio: composioServer,
                browserbase: browserServer,
            },
            // "mcp__<server>" allows every tool from that server.
            allowedTools: ["mcp__composio", "mcp__browserbase"],
            // Keep the agent away from the machine's built-in Claude Code tools.
            disallowedTools: [
                "Bash", "Read", "Write", "Edit", "Glob", "Grep",
                "WebFetch", "WebSearch", "Task", "NotebookEdit",
            ],
            maxTurns: 30,
        },
    };
}

/**
 * Runs the built agent on a prompt and returns the final text answer.
 */
export async function runAgent(
    agent: Awaited<ReturnType<typeof buildAgent>>,
    prompt: string
): Promise<string> {
    let finalText = "";

    for await (const message of query({ prompt, options: agent.options as any })) {
        if (message.type === "result" && message.subtype === "success") {
            finalText = message.result;
        }
    }

    return finalText;
}