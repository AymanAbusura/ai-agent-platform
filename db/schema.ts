import { pgTable, serial, text, timestamp, integer, uuid, varchar, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  agentCredits: integer("agentCredits").default(3),
  usageCredits: integer("usageCredits").default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tools = pgTable("tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),

  category: varchar("category", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),

  icon: varchar("icon", { length: 100 }),

  status: varchar("status", { length: 50 }).default("active"),

  requirsAuth: boolean("requires_Auth").default(false),
  authType: varchar("auth_type", { length: 50 }),
  authProvider: varchar("auth_provider", { length: 100 }),

  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  useCases: jsonb("use_cases").$type<string[]>().default([]),

  permissions: jsonb("permissions").$type<string[]>().default([]),

  approvalRules: jsonb("approval_rules").$type<Record<string, boolean>>(),

  config: jsonb("config").$type<Record<string, any>>(),

  riskLevel: varchar("risk_level", { length: 30 }).default("low"),

  canRead: boolean("can_read").default(false),
  canWrite: boolean("can_write").default(false),
  canDelete: boolean("can_delete").default(false),
  canExecute: boolean("can_execute").default(true),

  enabled: boolean("enabled").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;