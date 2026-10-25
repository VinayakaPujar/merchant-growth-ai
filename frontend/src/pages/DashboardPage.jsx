import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { request } from '../services/api.js';
import { AlertTriangle, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState({ hasAnomaly: false, anomalies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboard, anomalyData] = await Promise.all([
          request('/dashboard'),
          request('/anomalies')
        ]);
        setData(dashboard);
        setAlerts(anomalyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleInvestigate = async () => {
    const message = alerts.anomalies?.[0]
      ? `I spotted an anomaly: ${alerts.anomalies[0].title}. Please help me investigate the recent transaction pattern.`
      : 'Review the recent sales pattern and tell me what I should investigate.';

    window.localStorage.setItem('merchant-growth-ai-chat-seed', message);
    window.location.href = '/chat';
  };

  const handleExportPdf = async () => {
    const element = document.querySelector('#executive-digest');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0b0f19' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const img = new Image();
    img.src = imgData;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const width = img.width;
    const height = img.height;
    const ratio = Math.min(pageWidth / width, pageHeight / height);
    const finalWidth = width * ratio;
    const finalHeight = height * ratio;

    pdf.addImage(imgData, 'PNG', (pageWidth - finalWidth) / 2, 10, finalWidth, finalHeight);
    pdf.save('merchant-growth-ai-executive-digest.pdf');
  };

  if (loading) return <div className="panel card"><p className="muted">Loading dashboard...</p></div>;
  if (error) return <div className="alert">{error}</div>;

  const metrics = data?.metricSummary || {};
  const revenueSeries = metrics.revenueOverTime || [];
  const topProducts = metrics.topProducts || [];
  const recentTransactions = metrics.recentTransactions || [];
  const pieData = topProducts.slice(0, 5).map((item) => ({ name: item.name, value: item.revenue }));

  return (
    <div id="executive-digest" className="stack">
      {alerts.hasAnomaly && (
        <div className="alert-banner">
          <div className="alert-banner__content">
            <AlertTriangle size={18} />
            <div>
              <strong>{alerts.anomalies[0]?.title}</strong>
              <div>{alerts.anomalies[0]?.message}</div>
            </div>
          </div>
          <button className="primary-btn" onClick={handleInvestigate}>Investigate</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="secondary-btn" onClick={handleExportPdf}>
          <Download size={16} style={{ marginRight: 8 }} /> Export Executive Digest
        </button>
      </div>

      <div className="grid grid-3">
        <div className="card metric-card">
          <div className="label">Total successful revenue</div>
          <p className="value">{currency.format(metrics.totalRevenue || 0)}</p>
          <div className="detail">Successful sales only</div>
        </div>
        <div className="card metric-card">
          <div className="label">Successful transactions</div>
          <p className="value">{metrics.successfulTransactions || 0}</p>
          <div className="detail">Completed sales</div>
        </div>
        <div className="card metric-card">
          <div className="label">Failed transactions</div>
          <p className="value">{metrics.failedTransactions || 0}</p>
          <div className="detail">Payment failures</div>
        </div>
        <div className="card metric-card">
          <div className="label">Payment success rate</div>
          <p className="value">{(metrics.successRate || 0).toFixed(1)}%</p>
          <div className="detail">Across completed and failed payments</div>
        </div>
        <div className="card metric-card">
          <div className="label">Average order value</div>
          <p className="value">{currency.format(metrics.averageOrderValue || 0)}</p>
          <div className="detail">Average successful order</div>
        </div>
        <div className="card metric-card">
          <div className="label">Top product revenue</div>
          <p className="value">{topProducts.length ? currency.format(topProducts[0].revenue) : currency.format(0)}</p>
          <div className="detail">{topProducts.length ? topProducts[0].name : 'No sales yet'}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card panel">
          <h3>Revenue over time</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#37b7ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#37b7ff" stopOpacity={0.08}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#8bb0c8" tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#8bb0c8" />
                <Tooltip formatter={(value) => currency.format(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#37b7ff" fillOpacity={1} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card panel">
          <h3>Top products by revenue</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" stroke="#8bb0c8" tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#8bb0c8" width={110} />
                <Tooltip formatter={(v) => currency.format(v)} />
                <Bar dataKey="revenue" fill="#58d6ff" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card panel">
          <h3>Recent transactions</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td>{tx.productName}</td>
                    <td>{currency.format(tx.amount || 0)}</td>
                    <td>
                      <span className={`status-pill status-${tx.status}`}>{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card panel">
          <h3>Product share</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={90} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={['#37b7ff', '#58d6ff', '#1bc88a', '#f0af4d', '#ff5a7f'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => currency.format(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
