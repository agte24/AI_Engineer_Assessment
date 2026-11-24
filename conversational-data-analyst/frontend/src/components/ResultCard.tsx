import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Copy, Check, Database, Code } from 'lucide-react';
import { AnalyticsResponse } from '../types/analytics';

export const ResultCard: React.FC<{ result: AnalyticsResponse }> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleCopy = () => {
    const payload = `${result.answerText}\n\nData:\n${JSON.stringify(result.data, null, 2)}`;
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const xKey = result.xKey || Object.keys(result.data[0] || {})[0];
  const yKey = result.yKey || Object.keys(result.data[0] || {})[1];

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff', marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{result.answerText}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowSql(!showSql)} style={btnStyle} title="View Generated SQL">
            <Code size={14} /> SQL
          </button>
          <button onClick={handleCopy} style={btnStyle} title="Copy Result & Data">
            {copied ? <Check size={14} color="green" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {result.data.length === 0 ? (
        <p style={{ color: '#64748b' }}>No records matched this query.</p>
      ) : result.visualizationType === 'kpi' ? (
        <div style={{ padding: 20, background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase' }}>{xKey}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#2563eb' }}>
            {Number(result.data[0][yKey]).toLocaleString()}
          </div>
        </div>
      ) : result.visualizationType === 'bar' ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={result.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : result.visualizationType === 'line' ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={result.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={yKey} stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              {Object.keys(result.data[0]).map((col) => (
                <th key={col} style={{ padding: 8, borderBottom: '1px solid #cbd5e1' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.data.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i} style={{ padding: 8, borderBottom: '1px solid #e2e8f0' }}>
                    {typeof val === 'number' ? val.toLocaleString() : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Database size={12} /> Source table: <code>{result.datasetUsed}</code>
      </div>

      {showSql && (
        <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 10, borderRadius: 6, fontSize: 12, overflowX: 'auto' }}>
          {result.executedSql}
        </pre>
      )}
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  cursor: 'pointer',
  fontSize: 12,
};