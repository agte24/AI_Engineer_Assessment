import React, { useState } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { AnalyticsResponse } from './types/analytics';
import { ResultCard } from './components/ResultCard';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text?: string;
  result?: AnalyticsResponse;
}

const SAMPLE_QUESTIONS = [
  'Show monthly onboarding applications.',
  'Which branches have the highest rejection rate?',
  'Compare retail and SME onboarding volumes.',
  'Show the top five customers by transaction value.',
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: questionText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process question');
      }

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-ai`, role: 'assistant', result: data },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: 'error',
          text: err instanceof Error ? err.message : 'Something went wrong',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles color="#2563eb" /> Banking Conversational Data Analyst
        </h1>
        <p style={{ color: '#475569', margin: '4px 0 0' }}>
          Ask natural-language questions across Customers, Branches, Onboarding Applications, and Transactions.
        </p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => askQuestion(q)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 360, background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', paddingTop: 120 }}>
            Select a sample question above or type your own below to query the banking database.
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 16 }}>
            {m.role === 'user' && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: '#2563eb', color: '#fff', padding: '8px 14px', borderRadius: 12, display: 'inline-block' }}>
                  {m.text}
                </span>
              </div>
            )}

            {m.role === 'assistant' && m.result && <ResultCard result={m.result} />}

            {m.role === 'error' && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {m.text}
              </div>
            )}
          </div>
        ))}
        {loading && <div style={{ color: '#64748b', fontSize: 14 }}>Analyzing banking datasets...</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          askQuestion(input);
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Which branches have the highest rejection rate?"
          style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0 20px',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Send size={16} /> Ask
        </button>
      </form>
    </div>
  );
}