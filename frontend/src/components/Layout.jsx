import { useMemo } from 'react';
import { ArrowLeftRight, BarChart3, BrainCircuit, CreditCard, MessageSquareText, Percent, Sparkles } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/insights', label: 'AI Insights', icon: BrainCircuit },
  { to: '/chat', label: 'AI Chat', icon: MessageSquareText },
  { to: '/forecast', label: 'Forecast', icon: Sparkles },
  { to: '/offers', label: 'Offers', icon: Percent }
];

export default function Layout() {
  const { merchant, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><ArrowLeftRight size={18} /></div>
          <span>Merchant Growth AI</span>
        </div>

        <nav className="nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>Growth dashboard</h1>
          <div className="user-meta">
            <div className="user-pill">{merchant?.businessName || 'Merchant'}</div>
            <button className="secondary-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
