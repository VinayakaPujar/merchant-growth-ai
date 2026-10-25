import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'merchant-growth-ai-token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY) || '');
  const [merchant, setMerchant] = useState(() => {
    const saved = localStorage.getItem('merchant-growth-ai-user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (merchant) {
      localStorage.setItem('merchant-growth-ai-user', JSON.stringify(merchant));
    } else {
      localStorage.removeItem('merchant-growth-ai-user');
    }
  }, [merchant]);

  const value = useMemo(() => ({
    token,
    merchant,
    setToken,
    setMerchant,
    logout: () => {
      setToken('');
      setMerchant(null);
    }
  }), [token, merchant]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
