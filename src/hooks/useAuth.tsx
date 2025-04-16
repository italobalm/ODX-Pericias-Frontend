import { useState, useEffect } from 'react';
import api from '../lib/axiosConfig';
import { User, AuthResponse, ApiError } from '../types/user'; // Importar as interfaces do arquivo types

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/api/auth/login', { email, senha });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      setError(null);
      
      return userData;
    } catch (error) {
      console.error('Failed to login:', error);
      const errorTyped = error as ApiError;
      const errorMessage = errorTyped.response?.data?.message || 'Não foi possível fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      throw new Error(errorMessage);
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
      const response = await api.get<User>('/api/auth/logged-user');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch logged user:', error);
      setError('Não foi possível carregar os dados do usuário. Você foi desconectado.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    fetchLoggedUser();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    fetchLoggedUser
  };
};

export default useAuth;