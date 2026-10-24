import { useEffect, useState } from 'react';
import { request } from '../services/api.js';

export default function InsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const payload = await request('/insights');
        setInsights(payload);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="panel card"><p className="muted">Loading insights...</p></div>;
  if (error) return <div className="alert">{error}</div>;

  return (
    <div className="stack">
      <div className="card panel">
        <h3>AI business insights</h3>
        <p>{insights?.summary || 'No summary available.'}</p>
        <div className="muted">Source: {insights?.source || 'unknown'}</div>
      </div>

      <div className="grid grid-2">
        {(insights?.keyFindings || []).map((item, index) => (
          <div key={index} className="card panel">
            <h4>{item.title}</h4>
            <p>{item.description}</p>
            <ul>
              {(item.supportingData || []).map((row, idx) => (
                <li key={idx}><strong>{row.label}:</strong> {row.value}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card panel">
        <h3>Recommended actions</h3>
        <ul>
          {(insights?.recommendations || []).map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
