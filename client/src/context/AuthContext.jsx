import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAuthority: () => false,
  isCitizen: () => false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser  = localStorage.getItem('civicpulse_user');
      const savedToken = localStorage.getItem('civicpulse_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (e) {
      localStorage.removeItem('civicpulse_user');
      localStorage.removeItem('civicpulse_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('civicpulse_user', JSON.stringify(userData));
    localStorage.setItem('civicpulse_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civicpulse_user');
    localStorage.removeItem('civicpulse_token');
  };

  const isAuthority = () => user?.role === 'authority';
  const isCitizen   = () => user?.role === 'citizen';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#dae0e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        <div style={{ color: '#ff4500', fontSize: 14, fontWeight: 600 }}>Loading…</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthority, isCitizen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);