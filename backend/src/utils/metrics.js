import { parse } from 'csv-parse/sync';

export function safeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function roundCurrency(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function buildDailyRevenueMap(transactions) {
  const map = new Map();

  for (const tx of transactions) {
    const dateKey = new Date(tx.createdAt).toISOString().slice(0, 10);
    map.set(dateKey, (map.get(dateKey) || 0) + Number(tx.amount || 0));
  }

  return Array.from(map.entries())
    .map(([date, total]) => ({ date, revenue: roundCurrency(total) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function buildTopProducts(transactions) {
  const map = new Map();

  for (const tx of transactions) {
    const current = map.get(tx.productName) || 0;
    map.set(tx.productName, current + Number(tx.amount || 0));
  }

  return Array.from(map.entries())
    .map(([name, revenue]) => ({ name, revenue: roundCurrency(revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export function safeDate(value) {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function normalizeCSVRows(csvText) {
  if (!csvText || !String(csvText).trim()) {
    throw new Error('CSV content is missing.');
  }

  const rows = parse(String(csvText), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true
  });

  if (!rows.length) {
    throw new Error('No rows were found in the CSV file.');
  }

  return rows;
}
