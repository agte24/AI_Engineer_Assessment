import { describe, it, expect, beforeAll } from 'vitest';
import { seedDatabase } from '../db/seed';
import { executeQueryPlan } from '../services/queryExecutor';
import { generateQueryPlan } from '../services/queryPlanner';

describe('Conversational Data Analyst Security & Query Execution', () => {
  beforeAll(() => {
    seedDatabase();
  });

  it('blocks destructive SQL injection attempts', async () => {
    await expect(generateQueryPlan('DROP TABLE customers; --')).rejects.toThrow();
  });

  it('computes branch rejection rates accurately', () => {
    const result = executeQueryPlan('Which branches have the highest rejection rate?', {
      dataset: 'onboarding_applications',
      metric: 'rejection_rate',
      groupBy: 'branch_name',
      sortOrder: 'DESC',
      limit: 5,
      visualizationType: 'bar',
      explanation: 'Branch rejection rates',
    });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.executedSql).toContain('SELECT');
    expect(result.data[0]).toHaveProperty('branch_name');
    expect(result.data[0]).toHaveProperty('rejection_rate_pct');
  });
});