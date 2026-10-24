import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { request } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { setToken, setMerchant } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessCategory: '',
    monthlyMarketingBudget: 5000
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      setToken(result.token);
      setMerchant(result.merchant);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2>Create account</h2>
        <p>Register your merchant business and get AI-powered insights.</p>

        {error && <div className="alert">{error}</div>}

        <form className="stack" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label className="label">Full name</label>
              <input className="input" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" name="email" value={form.email} onChange={handleChange} type="email" required />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <input className="input" name="password" value={form.password} onChange={handleChange} type="password" minLength={6} required />
          </div>

          <div className="form-grid">
            <div>
              <label className="label">Business name</label>
              <input className="input" name="businessName" value={form.businessName} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Business category</label>
              <input className="input" name="businessCategory" value={form.businessCategory} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="label">Monthly marketing budget</label>
            <input className="input" name="monthlyMarketingBudget" value={form.monthlyMarketingBudget} onChange={handleChange} type="number" min="0" />
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 18, marginBottom: 0 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
