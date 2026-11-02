/**
 * Shared Composio SDK client for Claude (Anthropic provider).
 */
import { Composio } from '@composio/core';
import { ClaudeAgentSDKProvider } from '@composio/claude-agent-sdk';
import { createSdkMcpServer, query } from '@anthropic-ai/claude-agent-sdk';

export const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY,
    provider: new ClaudeAgentSDKProvider() as any,
});