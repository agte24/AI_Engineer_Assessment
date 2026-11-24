import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'banking.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      branch_id TEXT PRIMARY KEY,
      branch_name TEXT NOT NULL,
      region TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      customer_id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      segment TEXT NOT NULL CHECK(segment IN ('Retail', 'SME', 'Corporate')),
      branch_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    );

    CREATE TABLE IF NOT EXISTS onboarding_applications (
      application_id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      segment TEXT NOT NULL CHECK(segment IN ('Retail', 'SME', 'Corporate')),
      branch_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Approved', 'Rejected', 'Pending')),
      submitted_month TEXT NOT NULL,
      FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      transaction_id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      txn_type TEXT NOT NULL CHECK(txn_type IN ('Credit', 'Debit')),
      txn_month TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );
  `);
}