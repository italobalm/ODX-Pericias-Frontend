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
      console.log('Token received from login:', token);
      localStorage.setItem('token', token);
      console.log('Token stored in localStorage:', localStorage.getItem('token'));
      setUser(userData);
      setError(null);
      
      return userData;
    } catch (error) {
      console.error('Failed to login:', error);
      const errorTyped = error as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || 'Não foi possível fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoggedUser = async () => {
    const token = localStorage.getItem('token');
    console.log('Token retrieved for fetchLoggedUser:', token);
    if (!token) {
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      console.log('Buscando usuário logado de:', `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logged-user`);
      const response = await api.get<User>('/api/auth/logged-user');
      console.log('fetchLoggedUser response:', response.data);
      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch logged user:', error);
      const errorTyped = error as ApiError;
      setError(errorTyped.response?.data?.msg || 'Erro ao carregar os dados do usuário. Verifique a conexão com o servidor.');
      setUser(null); // Garante que o user seja resetado se der erro
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

  // Recupera o usuário automaticamente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchLoggedUser();
    }
  }, [user]);

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
