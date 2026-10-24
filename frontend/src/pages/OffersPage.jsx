import { useState } from 'react';
import { request } from '../services/api.js';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function OffersPage() {
  const [budget, setBudget] = useState(5000);
  const [focus, setFocus] = useState('repeat shoppers');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await request('/offers', {
        method: 'POST',
        body: JSON.stringify({ budget: Number(budget), focus })
      });
      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <div className="card panel">
        <h3>Smart offer generator</h3>
        <div className="form-grid">
          <div>
            <label className="label">Campaign budget</label>
            <input className="input" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} min="0" />
          </div>
          <div>
            <label className="label">Target focus</label>
            <select className="select" value={focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="repeat shoppers">Repeat shoppers</option>
              <option value="new customers">New customers</option>
              <option value="basket expansion">Basket expansion</option>
              <option value="high-intent buyers">High-intent buyers</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="primary-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate offers'}
          </button>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {result && (
        <div className="stack">
          <div className="card panel">
            <h4>Budget validation</h4>
            <p>Total planned spend: {currency.format(result.totalPlannedSpend || 0)}</p>
            <p>Remaining budget: {currency.format(result.remainingBudget || 0)}</p>
            <div className="budget-bar">
              <span style={{ width: `${Math.min(100, ((result.totalPlannedSpend || 0) / Math.max(result.budget || 1, 1)) * 100)}%` }}></span>
            </div>
            <p className="muted">{result.validation?.message}</p>
          </div>

          <div className="offer-grid">
            {(result.offers || []).map((offer, index) => (
              <div key={index} className="card offer-item">
                <h4>{offer.name}</h4>
                <p><strong>Target:</strong> {offer.targetSegment}</p>
                <p><strong>Spend:</strong> {currency.format(offer.suggestedSpend || 0)}</p>
                <p><strong>Reason:</strong> {offer.reason}</p>
                <p><strong>Success metric:</strong> {offer.successMetric}</p>
                <p><strong>Risk:</strong> {offer.risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
