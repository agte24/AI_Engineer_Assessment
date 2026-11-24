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