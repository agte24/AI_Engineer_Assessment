import { db } from '../db/database';
import { AnalyticsResponse, QueryPlan } from '../types/analytics';

export function executeQueryPlan(question: string, plan: QueryPlan): AnalyticsResponse {
  let sql = '';
  const params: unknown[] = [];
  let xKey = 'label';
  let yKey = 'value';

  if (plan.dataset === 'onboarding_applications') {
    const groupColMap: Record<string, string> = {
      month: 'a.submitted_month',
      segment: 'a.segment',
      branch_name: 'b.branch_name',
      status: 'a.status',
      customer_name: 'a.customer_name',
      none: "'Total'",
    };

    const groupExpr = groupColMap[plan.groupBy];
    xKey = plan.groupBy === 'none' ? 'metric' : plan.groupBy;

    let metricExpr = 'COUNT(*)';
    if (plan.metric === 'rejection_rate') {
      metricExpr = "ROUND(100.0 * SUM(CASE WHEN a.status = 'Rejected' THEN 1 ELSE 0 END) / COUNT(*), 1)";
      yKey = 'rejection_rate_pct';
    } else {
      yKey = 'applications';
    }

    const whereClause = plan.filterSegment ? 'WHERE a.segment = ?' : '';
    if (plan.filterSegment) params.push(plan.filterSegment);

    sql = `
      SELECT ${groupExpr} AS ${xKey}, ${metricExpr} AS ${yKey}
      FROM onboarding_applications a
      JOIN branches b ON a.branch_id = b.branch_id
      ${whereClause}
      GROUP BY ${groupExpr}
      ORDER BY ${plan.groupBy === 'month' ? xKey : yKey} ${plan.sortOrder}
      LIMIT ?
    `.trim();
    params.push(plan.limit);
  } else if (plan.dataset === 'transactions') {
    const groupColMap: Record<string, string> = {
      month: 't.txn_month',
      segment: 'c.segment',
      branch_name: 'b.branch_name',
      customer_name: 'c.customer_name',
      status: 't.txn_type',
      none: "'Total Transaction Value'",
    };

    const groupExpr = groupColMap[plan.groupBy];
    xKey = plan.groupBy === 'none' ? 'metric' : plan.groupBy;

    const metricExpr =
      plan.metric === 'avg_amount'
        ? 'ROUND(AVG(t.amount), 2)'
        : plan.metric === 'count'
        ? 'COUNT(*)'
        : 'SUM(t.amount)';
    yKey = plan.metric === 'count' ? 'transaction_count' : 'total_amount';

    sql = `
      SELECT ${groupExpr} AS ${xKey}, ${metricExpr} AS ${yKey}
      FROM transactions t
      JOIN customers c ON t.customer_id = c.customer_id
      JOIN branches b ON c.branch_id = b.branch_id
      GROUP BY ${groupExpr}
      ORDER BY ${yKey} ${plan.sortOrder}
      LIMIT ?
    `.trim();
    params.push(plan.limit);
  } else {
    sql = `
      SELECT segment AS segment, COUNT(*) AS customer_count
      FROM customers
      GROUP BY segment
      ORDER BY customer_count ${plan.sortOrder}
      LIMIT ?
    `.trim();
    xKey = 'segment';
    yKey = 'customer_count';
    params.push(plan.limit);
  }

  // Defense-in-depth read-only assertion
  if (!/^SELECT\s/i.test(sql)) {
    throw new Error('Security violation: Only SELECT queries are permitted.');
  }

  const rows = db.prepare(sql).all(...params) as Record<string, string | number>[];

  return {
    question,
    answerText: plan.explanation,
    visualizationType: rows.length === 1 && plan.groupBy === 'none' ? 'kpi' : plan.visualizationType,
    data: rows,
    xKey,
    yKey,
    executedSql: sql,
    datasetUsed: plan.dataset,
  };
}