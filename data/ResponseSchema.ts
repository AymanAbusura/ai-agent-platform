/**
 * Claude response schema (plain JSON Schema) that constrains generated agent
 * configurations and clarification questions. Used as a tool input_schema.
 */
export const AgentConfigRespSchema = {
    type: "object",
    properties: {
        status: {
            type: "string",
            enum: ["needs_clarification", "ready"],
        },

        clarificationQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },

                    question: { type: "string" },

                    type: {
                        type: "string",
                        enum: [
                            "single_select",
                            "multi_select",
                            "text",
                            "number",
                            "date",
                            "time",
                        ],
                    },

                    options: {
                        type: "array",
                        items: { type: "string" },
                    },

                    allowCustom: { type: "boolean" },

                    customPlaceholder: { type: "string" },
                },
                required: [
                    "id",
                    "question",
                    "type",
                    "options",
                    "allowCustom",
                    "customPlaceholder",
                ],
            },
        },

        config: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                instructions: { type: "string" },
                objective: { type: "string" },

                tools: {
                    type: "array",
                    items: { type: "string" },
                },

                skills: {
                    type: "array",
                    items: { type: "string" },
                },

                schedule: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            enum: ["once", "recurring", "manual"],
                        },
                        frequency: { type: "string" },
                        time: { type: "string" },
                    },
                    required: ["type", "frequency", "time"],
                },

                outputFormat: { type: "string" },
            },
            required: [
                "name",
                "description",
                "instructions",
                "objective",
                "tools",
                "skills",
                "schedule",
                "outputFormat",
            ],
        },
    },

    required: ["status", "clarificationQuestions"],
} as const;