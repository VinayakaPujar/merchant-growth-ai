import { useEffect, useState } from 'react';
import { request } from '../services/api.js';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function ForecastPage() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const payload = await request('/forecast');
        setForecast(payload);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="panel card"><p className="muted">Loading forecast...</p></div>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <div className="stack">
      <div className="card panel">
        <h3>7-day sales forecast</h3>
        <p className="muted">{forecast?.message || 'Forecast is based on a moving-average baseline and should be treated as an estimate.'}</p>
      </div>

      <div className="card panel">
        <h4>Historical revenue</h4>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(forecast?.historical || []).slice(-10).map((item) => (
              <tr key={item.date}>
                <td>{item.date}</td>
                <td>{currency.format(item.revenue || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card panel">
        <h4>Estimated future sales</h4>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Estimated revenue</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {(forecast?.forecast || []).map((item) => (
              <tr key={item.date}>
                <td>{item.date}</td>
                <td>{currency.format(item.estimatedRevenue || 0)}</td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
