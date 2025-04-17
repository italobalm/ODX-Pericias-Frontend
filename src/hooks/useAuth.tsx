import { useState, useEffect } from 'react';
import api from '../lib/axiosConfig';
import { User, AuthResponse } from '../types/User';
import { ApiError } from '../types/Error';


const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/api/auth/login', { email, senha });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      setError(null);
    } catch (error) {
      const errorTyped = error as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || 'Não foi possível fazer login.';
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
      return;
    }
    try {
      setLoading(true);
      const response = await api.get<User>('/api/auth/logged-user');
      setUser(response.data);
      setError(null);
    } catch (error) {
      const errorTyped = error as ApiError;
      setError(errorTyped.response?.data?.msg || 'Erro ao carregar os dados do usuário.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchLoggedUser();
    }
  }, [user]);  // Remove dependência de 'loading' aqui, garantindo que a busca seja feita uma vez

  return { user, loading, error, login, logout, fetchLoggedUser };
};

export default useAuth;
