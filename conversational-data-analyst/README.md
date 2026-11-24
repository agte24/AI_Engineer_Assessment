# Conversational Data Analyst

A full-stack natural-language business intelligence application built with React, Node.js, Express, TypeScript, SQLite, and Recharts.

## Architecture
- **Frontend (`React + TypeScript + Recharts`)**: Chat-style interface with prompt suggestions, dynamic visualization selection (KPI cards, Bar charts, Line charts, Tables), SQL transparency toggle, and one-click clipboard copy.
- **Backend (`Node.js + Express + TypeScript`)**:
  - **Query Planner (`queryPlanner.ts`)**: Translates natural-language questions into a strictly typed `QueryPlan` JSON contract validated via `Zod`. Supports OpenAI structured outputs with an automatic deterministic NLP fallback so the system works seamlessly offline or without API keys.
  - **Safe Query Executor (`queryExecutor.ts`)**: Compiles the validated `QueryPlan` into parameterized, read-only `SELECT` SQL statements using an explicit column/table allowlist.
- **Database (`SQLite` via `better-sqlite3`)**: Normalized relational schema across `branches`, `customers`, `onboarding_applications`, and `transactions`, automatically seeded on startup.

## Setup Instructions
1. **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm test
   npm run dev