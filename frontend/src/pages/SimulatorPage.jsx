import { useState } from 'react';
import { request } from '../services/api.js';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function SimulatorPage() {
  const [discount, setDiscount] = useState(15);
  const [growth, setGrowth] = useState(40);
  const [adSpend, setAdSpend] = useState(12000);

  const baselineRevenue = 150000;
  const baselineProfitMargin = 0.28;
  const baselineCustomers = 4800;

  const projectedRevenue = baselineRevenue * (1 + growth / 100) * (1 - discount / 100 * 0.35);
  const projectedProfit = projectedRevenue * baselineProfitMargin - adSpend * 0.9;
  const estimatedAcquisitionLift = baselineCustomers * (1 + growth / 100) * (1 + discount / 100 * 0.25);

  return (
    <div className="stack">
      <div className="card panel">
        <h3>What-if scenario simulator</h3>
        <p className="muted">Model how discounted campaigns and spend changes could affect revenue and profitability.</p>
      </div>

      <div className="grid grid-2">
        <div className="card panel">
          <div className="stack">
            <div>
              <label className="label">Promotional discount percentage: {discount}%</label>
              <input className="input" type="range" min="0" max="50" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Estimated volume growth surge: +{growth}%</label>
              <input className="input" type="range" min="10" max="200" value={growth} onChange={(e) => setGrowth(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Planned ad spend: {currency.format(adSpend)}</label>
              <input className="input" type="range" min="1000" max="50000" step="500" value={adSpend} onChange={(e) => setAdSpend(Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="card panel">
          <h4>Projected outcome</h4>
          <ul>
            <li><strong>Projected gross revenue:</strong> {currency.format(projectedRevenue)}</li>
            <li><strong>Projected net profit:</strong> {currency.format(projectedProfit)}</li>
            <li><strong>Estimated customer acquisition lift:</strong> {Math.round(estimatedAcquisitionLift).toLocaleString('en-IN')}</li>
            <li><strong>Scenario note:</strong> This is an estimate and should be used for planning rather than guaranteed revenue performance.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
