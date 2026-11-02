/**
 * Uses Claude (Anthropic API).
 * API route that turns a natural-language prompt into a saved agent configuration and manages agent CRUD.
 */
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";
import { AgentConfig, AgentRun, db, tools } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { and, count, desc, eq } from "drizzle-orm";
// import { calculateNextDailyRun } from "@/lib/agent-schedule";

const DEMO_AGENT_LIMIT = 5;
const CLAUDE_MODEL = "claude-sonnet-5-5";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function toJsonSchema(schema: any): any {
    if (Array.isArray(schema)) return schema.map(toJsonSchema);
    if (schema && typeof schema === "object") {
        const out: any = {};
        for (const [key, value] of Object.entries(schema)) {
            if (key === "propertyOrdering" || key === "nullable") continue;
            if (key === "type" && typeof value === "string") {
                out[key] = value.toLowerCase();
            } else {
                out[key] = toJsonSchema(value);
            }
        }
        return out;
    }
    return schema;
}

export async function POST(req: NextRequest) {

    const { prompt, timezone } = await req.json();
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';

    if (!userEmail) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    if (!prompt?.trim()) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    try {

        const agentCount = await db.select({ value: count() })
            .from(AgentConfig)
            .where(eq(AgentConfig.userEmail, userEmail));

        if ((agentCount[0]?.value ?? 0) >= DEMO_AGENT_LIMIT) {
            return NextResponse.json(
                { error: `Demo app limit reached. You can create max ${DEMO_AGENT_LIMIT} agents.` },
                { status: 403 }
            )
        }

        // Send only the tool metadata Claude needs for planning; credentials and
        // connected-account details stay server-side.
        const aiTools = await db.select({
            slug: tools.slug,
            name: tools.name,
            description: tools.description,
            category: tools.category,
            provider: tools.provider,
            capabilities: tools.capabilities,
            useCases: tools.useCases
        }).from(tools)

        const inputSchema = toJsonSchema(AgentConfigRespSchema);
        if (!inputSchema.type) inputSchema.type = "object";

        // Forcing a tool call makes Claude return structured JSON matching the schema.
        const response = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 4096,
            messages: [
                {
                    role: "user",
                    content: AgentConfigSystemPrompt
                        .replace('{USER_PROMPT}', prompt)
                        .replace('{AVAILABLE_TOOLS}', JSON.stringify(aiTools, null, 2)),
                },
            ],
            tools: [
                {
                    name: "agent_config_response",
                    description: "Return either clarification questions or a ready-to-save agent config.",
                    input_schema: inputSchema,
                },
            ],
            tool_choice: { type: "tool", name: "agent_config_response" },
        });

        const toolBlock = response.content.find((b) => b.type === "tool_use");
        // Claude returns either clarification questions or a ready-to-save config.
        const aiOutput: any = toolBlock && toolBlock.type === "tool_use" ? toolBlock.input : {};

        if (aiOutput.status == 'ready') {
            const agentId = crypto.randomUUID();
            const dbResult = await db.insert(AgentConfig).values({
                ...aiOutput.config,
                agentImage: 'https://api.dicebear.com/10.x/gaze/svg?tags=animation&seed=' + agentId,
                agentId: agentId,
                userEmail: userEmail,
                schedule: {
                    time: aiOutput?.config?.schedule.time,
                    type: aiOutput?.config?.schedule.type,
                    frequency: aiOutput?.config?.schedule.frequency,
                    timezone: timezone
                }
            }).returning();

            // Pre-create the first scheduled occurrence so Inngest can pick it up.
            const schedule = aiOutput?.config?.schedule;
            const firstRun = schedule?.type == 'recurring'
                && schedule.frequency == 'daily' ? calculateNextDailyRun({
                    time: schedule.time,
                    timezone: timezone
                }) : null

            console.log("firstRun", firstRun);
            if (firstRun) {
                const runInsert = await db.insert(AgentRun)
                    .values({
                        agentId,
                        userEmail: userEmail,
                        scheduledFor: firstRun,
                        timezone: timezone,
                        status: 'scheduled',
                    }).returning();
                console.log(runInsert)
            }

            return NextResponse.json({ ...dbResult[0], status_: 'ready' });
        }

        return NextResponse.json(aiOutput);

    } catch (e) {
        console.error('Error', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 })
    }

}

export async function PUT(req: NextRequest) {
    const agentConfig = await req.json();

    console.log(agentConfig);

    try {
        const result = await db.update(AgentConfig).set({
            ...agentConfig,
            createdAt: new Date()
        }).where(eq(AgentConfig.agentId, agentConfig?.agentId))
            .returning();

        console.log(result[0]);
        // Remove stale future occurrences before creating a replacement schedule.
        const deleteScheduledAgentRun = await db.delete(AgentRun)
            .where(and(eq(AgentRun.agentId, agentConfig?.agentId), eq(AgentRun.status, 'scheduled')))
        // Active recurring agents should always have exactly one upcoming run.
        if (agentConfig?.status == 'active') {
            const nextRun = calculateNextDailyRun({ time: agentConfig?.schedule.time, timezone: agentConfig?.timeZone });

            await db
                .insert(AgentRun)
                .values({
                    agentId: agentConfig.agentId,
                    userEmail: agentConfig.userEmail,
                    scheduledFor: nextRun,
                    timezone: agentConfig?.schedule.timezone,
                    status: "scheduled",
                })
                .onConflictDoNothing();
        }

        return NextResponse.json(result[0])
    }
    catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })

    }
}


export async function GET(req: NextRequest) {
    const user = await currentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 400 })
    }

    const result = await db.select().from(AgentConfig)
        .where(eq(AgentConfig.userEmail, user?.primaryEmailAddress?.emailAddress ?? ''))
        .orderBy(desc(AgentConfig?.createdAt))

    return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
    const { agentId } = await req.json();

    try {
        const deleteAgentRun = await db.delete(AgentRun)
            .where(and(eq(AgentRun.agentId, agentId)))

        const deleteAgentConfig = await db.delete(AgentConfig)
            .where(eq(AgentConfig.agentId, agentId));


        return NextResponse.json({ msg: 'Agent Deleted!' }, { status: 200 })
    }
    catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 400 })
    }

}