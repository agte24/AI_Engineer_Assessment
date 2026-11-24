import { z } from 'zod';

// Strict schema that the AI/Planner must output instead of raw SQL
export const QueryPlanSchema = z.object({
  dataset: z.enum(['onboarding_applications', 'transactions', 'customers']),
  metric: z.enum(['count', 'sum_amount', 'avg_amount', 'rejection_rate']),
  groupBy: z.enum(['month', 'segment', 'branch_name', 'status', 'customer_name', 'none']),
  filterSegment: z.enum(['Retail', 'SME', 'Corporate']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
  limit: z.number().int().min(1).max(50).default(10),
  visualizationType: z.enum(['bar', 'line', 'table', 'kpi']),
  explanation: z.string(),
});

export type QueryPlan = z.infer<typeof QueryPlanSchema>;

export interface AnalyticsResponse {
  question: string;
  answerText: string;
  visualizationType: 'bar' | 'line' | 'table' | 'kpi';
  data: Record<string, string | number>[];
  xKey?: string;
  yKey?: string;
  executedSql: string;
  datasetUsed: string;
}