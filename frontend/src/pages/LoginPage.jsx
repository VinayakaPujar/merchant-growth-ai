import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { setToken, setMerchant } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'demo@merchantgrowth.ai', password: 'Demo@12345' });
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
      const result = await request('/auth/login', {
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
        <h2>Welcome back</h2>
        <p>Sign in to your merchant dashboard.</p>

        {error && <div className="alert">{error}</div>}

        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <label className="label">Email</label>
            <input className="input" name="email" value={form.email} onChange={handleChange} type="email" required />
          </div>

          <div>
            <label className="label">Password</label>
            <input className="input" name="password" value={form.password} onChange={handleChange} type="password" required />
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: 18, marginBottom: 0 }}>
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
