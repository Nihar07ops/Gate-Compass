import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { DEMO_MODE, demoAuth } from '../config/demo';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      if (DEMO_MODE) {
        const user = await demoAuth.getUser();
        setUser(user);
      } else {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (DEMO_MODE) {
      const { token, user } = await demoAuth.login(email, password);
      setUser(user);
      return user;
    } else {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    }
  };

  const register = async (name, email, password) => {
    if (DEMO_MODE) {
      const { token, user } = await demoAuth.register(name, email, password);
      setUser(user);
      return user;
    } else {
      const response = await api.post('/api/auth/register', { name, email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
