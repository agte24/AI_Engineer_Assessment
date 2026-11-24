import { db, initSchema } from './database';

export function seedDatabase(): void {
  initSchema();

  const existing = db.prepare('SELECT COUNT(*) as count FROM branches').get() as { count: number };
  if (existing.count > 0) return;

  const insertBranch = db.prepare('INSERT INTO branches (branch_id, branch_name, region) VALUES (?, ?, ?)');
  const branches = [
    ['BR-01', 'Mumbai Fort', 'West'],
    ['BR-02', 'Pune Koregaon', 'West'],
    ['BR-03', 'Bengaluru Indiranagar', 'South'],
    ['BR-04', 'Delhi Connaught', 'North'],
  ];
  branches.forEach((b) => insertBranch.run(...b));

  const insertCustomer = db.prepare(
    'INSERT INTO customers (customer_id, customer_name, segment, branch_id, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  const customers = [
    ['CUST-101', 'Apex Logistics Pvt Ltd', 'SME', 'BR-01', '2026-01-10'],
    ['CUST-102', 'Aarav Sharma', 'Retail', 'BR-02', '2026-01-14'],
    ['CUST-103', 'Vanguard Tech Solutions', 'Corporate', 'BR-03', '2026-02-02'],
    ['CUST-104', 'Priya Nair', 'Retail', 'BR-03', '2026-02-18'],
    ['CUST-105', 'Horizon Textiles', 'SME', 'BR-01', '2026-03-05'],
    ['CUST-106', 'Rohan Mehta', 'Retail', 'BR-04', '2026-03-22'],
    ['CUST-107', 'Nova Pharma Corp', 'Corporate', 'BR-01', '2026-04-09'],
  ];
  customers.forEach((c) => insertCustomer.run(...c));

  const insertApp = db.prepare(
    'INSERT INTO onboarding_applications (application_id, customer_name, segment, branch_id, status, submitted_month) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const applications = [
    ['APP-01', 'Aarav Sharma', 'Retail', 'BR-02', 'Approved', '2026-01'],
    ['APP-02', 'Apex Logistics Pvt Ltd', 'SME', 'BR-01', 'Approved', '2026-01'],
    ['APP-03', 'Kiran Traders', 'SME', 'BR-04', 'Rejected', '2026-01'],
    ['APP-04', 'Priya Nair', 'Retail', 'BR-03', 'Approved', '2026-02'],
    ['APP-05', 'Vanguard Tech Solutions', 'Corporate', 'BR-03', 'Approved', '2026-02'],
    ['APP-06', 'Zenith Retail', 'Retail', 'BR-04', 'Rejected', '2026-02'],
    ['APP-07', 'Horizon Textiles', 'SME', 'BR-01', 'Approved', '2026-03'],
    ['APP-08', 'Rohan Mehta', 'Retail', 'BR-04', 'Rejected', '2026-03'],
    ['APP-09', 'BluePeak Foods', 'SME', 'BR-02', 'Approved', '2026-03'],
    ['APP-10', 'Nova Pharma Corp', 'Corporate', 'BR-01', 'Approved', '2026-04'],
    ['APP-11', 'Neha Gupta', 'Retail', 'BR-02', 'Approved', '2026-04'],
    ['APP-12', 'Metro Exports', 'SME', 'BR-04', 'Rejected', '2026-04'],
  ];
  applications.forEach((a) => insertApp.run(...a));

  const insertTxn = db.prepare(
    'INSERT INTO transactions (transaction_id, customer_id, amount, txn_type, txn_month) VALUES (?, ?, ?, ?, ?)'
  );
  const txns = [
    ['TXN-01', 'CUST-101', 450000, 'Credit', '2026-01'],
    ['TXN-02', 'CUST-102', 32000, 'Debit', '2026-01'],
    ['TXN-03', 'CUST-103', 1250000, 'Credit', '2026-02'],
    ['TXN-04', 'CUST-104', 18500, 'Debit', '2026-02'],
    ['TXN-05', 'CUST-105', 680000, 'Credit', '2026-03'],
    ['TXN-06', 'CUST-107', 2100000, 'Credit', '2026-03'],
    ['TXN-07', 'CUST-101', 390000, 'Debit', '2026-04'],
    ['TXN-08', 'CUST-106', 54000, 'Credit', '2026-04'],
  ];
  txns.forEach((t) => insertTxn.run(...t));

  console.log('Database seeded successfully.');
}

if (require.main === module) {
  seedDatabase();
}