import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

console.log("BaseURL configurada no Axios:", process.env.NEXT_PUBLIC_API_URL);

// Adiciona o token automaticamente antes de cada request
api.interceptors.request.use(
  (config) => {
    // if (typeof window !== 'undefined') {
    //   const token = localStorage.getItem('token');
    //   if (token) {
    //     config.headers = config.headers || {};
    //     config.headers['Authorization'] = `Bearer ${token}`;
    //   }
    // }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Trata erros 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.log('Erro 401: Token inválido. Limpando localStorage e redirecionando para /login');
      localStorage.removeItem('token');
      window.location.href = '/login'; // Força redirecionamento
    }
    return Promise.reject(error);
  }
);

export default api;