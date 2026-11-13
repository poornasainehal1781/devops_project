import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospital_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hospital_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/api/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('hospital_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { access_token, role, user_id, full_name } = res.data;
    localStorage.setItem('hospital_token', access_token);
    setToken(access_token);

    // Fetch detailed profile
    const profileRes = await api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const profileData = profileRes.data;
    setUser(profileData);
    localStorage.setItem('hospital_user', JSON.stringify(profileData));
    return profileData;
  };

  const register = async (patientData) => {
    const res = await api.post('/api/auth/register', patientData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
    setToken(null);
    setUser(null);
  };

  const role = user?.role ? user.role.toUpperCase() : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

