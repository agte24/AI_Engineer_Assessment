import OpenAI from 'openai';
import { QueryPlan, QueryPlanSchema } from '../types/analytics';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateQueryPlan(question: string): Promise<QueryPlan> {
  const normalized = question.trim().toLowerCase();

  // Guardrail against off-topic or malicious prompts
  if (normalized.length < 3 || /(drop table|delete from|insert into|update\s+\w+\s+set)/i.test(normalized)) {
    throw new Error('Invalid or unsafe question. Please ask a valid banking analytics question.');
  }

  // If OpenAI key is configured, use LLM with Structured JSON Output
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a banking data analyst planner. Convert the user's question into a JSON object strictly matching:
{
  "dataset": "onboarding_applications" | "transactions" | "customers",
  "metric": "count" | "sum_amount" | "avg_amount" | "rejection_rate",
  "groupBy": "month" | "segment" | "branch_name" | "status" | "customer_name" | "none",
  "filterSegment": "Retail" | "SME" | "Corporate" (optional),
  "sortOrder": "ASC" | "DESC",
  "limit": number (1-50),
  "visualizationType": "bar" | "line" | "table" | "kpi",
  "explanation": "Brief 1-sentence summary of what is being shown"
}
If the question is unrelated to banking customers, onboarding applications, or transactions, return {"error": "Unsupported topic"}.`,
          },
          { role: 'user', content: question },
        ],
      });

      const raw = JSON.parse(completion.choices[0].message.content || '{}');
      if (raw.error) throw new Error(raw.error);
      return QueryPlanSchema.parse(raw);
    } catch (err) {
      if (err instanceof Error && err.message === 'Unsupported topic') {
        throw new Error('I can only answer questions about banking customers, onboarding applications, and transactions.');
      }
      // Fall through to deterministic planner if API fails
    }
  }

  return fallbackRulePlanner(normalized);
}

// Deterministic NLP fallback (works 100% offline with zero external dependencies)
function fallbackRulePlanner(q: string): QueryPlan {
  if (q.includes('rejection') || q.includes('rejected')) {
    return {
      dataset: 'onboarding_applications',
      metric: 'rejection_rate',
      groupBy: 'branch_name',
      sortOrder: 'DESC',
      limit: 10,
      visualizationType: 'bar',
      explanation: 'Rejection rate (%) across bank branches based on onboarding applications.',
    };
  }

  if (q.includes('top') && (q.includes('customer') || q.includes('transaction'))) {
    return {
      dataset: 'transactions',
      metric: 'sum_amount',
      groupBy: 'customer_name',
      sortOrder: 'DESC',
      limit: 5,
      visualizationType: 'table',
      explanation: 'Top customers ranked by total transaction volume.',
    };
  }

  if (q.includes('retail') && q.includes('sme')) {
    return {
      dataset: 'onboarding_applications',
      metric: 'count',
      groupBy: 'segment',
      sortOrder: 'DESC',
      limit: 10,
      visualizationType: 'bar',
      explanation: 'Comparison of onboarding application volumes across customer segments.',
    };
  }

  if (q.includes('monthly') || q.includes('trend') || q.includes('month')) {
    return {
      dataset: 'onboarding_applications',
      metric: 'count',
      groupBy: 'month',
      sortOrder: 'ASC',
      limit: 12,
      visualizationType: 'line',
      explanation: 'Monthly trend of onboarding applications submitted.',
    };
  }

  if (q.includes('total transaction') || q.includes('transaction volume')) {
    return {
      dataset: 'transactions',
      metric: 'sum_amount',
      groupBy: 'none',
      sortOrder: 'DESC',
      limit: 1,
      visualizationType: 'kpi',
      explanation: 'Total cumulative transaction value across all accounts.',
    };
  }

  if (q.includes('onboarding') || q.includes('application')) {
    return {
      dataset: 'onboarding_applications',
      metric: 'count',
      groupBy: 'segment',
      sortOrder: 'DESC',
      limit: 10,
      visualizationType: 'bar',
      explanation: 'Onboarding application counts grouped by customer segment.',
    };
  }

  throw new Error(
    'Could not map question to banking datasets. Try asking about monthly onboarding, branch rejection rates, segment comparisons, or top customers by transaction value.'
  );
}