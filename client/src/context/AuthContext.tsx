import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setToken, getToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await api.auth.me();
          setUser(res.user);
        } catch (err) {
          console.warn('Stored token expired or invalid:', err);
          setToken(null);
          setTokenState(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setUser(res.user);
    setTokenState(res.token);
    setToken(res.token);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.auth.register({ name, email, password, phone });
    setUser(res.user);
    setTokenState(res.token);
    setToken(res.token);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    setToken(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'ADMIN',
        isAuthModalOpen,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
