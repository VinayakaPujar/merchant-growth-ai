import { useEffect, useState } from 'react';
import { request } from '../services/api.js';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ amount: 500, status: 'success', productName: 'Organic Rice', quantity: 1, createdAt: new Date().toISOString().slice(0, 10) });

  const loadTransactions = async (pageNumber = page, statusFilter = status, searchFilter = search) => {
    setLoading(true);
    try {
      const data = await request(`/transactions?page=${pageNumber}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}${searchFilter ? `&search=${encodeURIComponent(searchFilter)}` : ''}`);
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, status, search]);

  const handleAdd = async (event) => {
    event.preventDefault();
    try {
      await request('/transactions', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setForm({ amount: 500, status: 'success', productName: 'Organic Rice', quantity: 1, createdAt: new Date().toISOString().slice(0, 10) });
      await loadTransactions(1, status, search);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="stack">
      <div className="card panel">
        <h3>Transaction management</h3>
        <form className="form-grid" onSubmit={handleAdd}>
          <div>
            <label className="label">Amount</label>
            <input className="input" type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="label">Product</label>
            <input className="input" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Quantity</label>
            <input className="input" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button className="primary-btn" type="submit">Add transaction</button>
          </div>
        </form>
      </div>

      <div className="card panel">
        <div className="form-grid">
          <div>
            <label className="label">Search product</label>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by name" />
          </div>
          <div>
            <label className="label">Status filter</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        <div className="table-wrap" style={{ marginTop: 16 }}>
          {loading ? <p className="muted">Loading transactions...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td>{tx.productName}</td>
                    <td>{currency.format(tx.amount || 0)}</td>
                    <td><span className={`status-pill status-${tx.status}`}>{tx.status}</span></td>
                    <td>{tx.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <button className="secondary-btn" onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
          <span className="muted">Page {page}</span>
          <button className="secondary-btn" onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
