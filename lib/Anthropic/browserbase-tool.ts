/**
 * Claude Agent SDK tool that performs read-only live web research through Browserbase.
 * (Claude version of browserbase-tool.ts)
 */
import Browserbase from "@browserbasehq/sdk";
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

async function researchWithBrowserbase(task: string) {
    const bb = new Browserbase({
        apiKey: process.env.BROWSERBASE_API_KEY!,
    });

    // Browserbase handles the live browsing session and returns a run to poll.
    const { runId } = await bb.agents.runs.create({
        agentId: process.env.BROWSERBASE_AGENT_ID,
        task: task,
        browserSettings: { proxies: true },
    });

    // Keep API-backed agent runs bounded so callers receive a deterministic result.
    const deadline = Date.now() + 4 * 60 * 1000;
    const terminal = ["COMPLETED", "FAILED", "STOPPED", "TIMED_OUT"];
    while (Date.now() < deadline) {
        const run = await bb.agents.runs.retrieve(runId);

        if (terminal.includes(run.status)) {
            return {
                runId,
                status: run.status,
                result: run.result,
            };
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Browser run out of time");
}

// Claude Agent SDK signature: tool(name, description, zodShape, handler).
// The shape is a plain object of zod fields, not z.object(...).
export const browserbaseResearchTool = tool(
    "browser_research",
    `Use this tool when the user asks to browse or search the live internet,
compare current product prices, check current availability, or verify
information from websites. This is a read-only browser tool.`,
    {
        task: z.string().min(10).describe("The complete live web search task to perform"),
    },
    async ({ task }) => {
        try {
            const resp = await researchWithBrowserbase(task);
            return {
                content: [{ type: "text" as const, text: JSON.stringify(resp) }],
            };
        } catch (e) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: JSON.stringify({
                            status: "ERROR",
                            error: e instanceof Error ? e.message : String(e),
                        }),
                    },
                ],
                isError: true,
            };
        }
    }
);