// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import api from '../lib/axiosConfig';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Tentando login com:', { email, senha: password }); // Depuração
      const response = await api.post('/api/auth/login', { // Ajustado para '/api/auth/login'
        email,
        senha: password, // Corrigido para 'senha'
      });
      const { token, usuario } = response.data;
      if (token && usuario) {
        localStorage.setItem('token', token);
        setUser(usuario);
        await fetchLoggedUser();
        setError(null);
      } else {
        throw new Error('Token ou usuário não recebidos do servidor');
      }
    } catch (err: any) {
      console.error('Erro no login:', err.response?.data || err.message);
      setError(err.response?.data?.msg || 'Erro ao fazer login. Verifique o endpoint ou credenciais.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchLoggedUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/auth/logged-user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    fetchLoggedUser();
  }, []);

  return { user, loading, error, login, logout, fetchLoggedUser };
};

export default useAuth;