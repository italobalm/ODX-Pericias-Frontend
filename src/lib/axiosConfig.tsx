import axios from 'axios';

// Instância para a API de dashboard
const apiDashboard = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Ex.: https://odx-pericias-back.onrender.com
});

// Instância para a API de predição
const apiPredicao = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PREDICAO_URL, // Ex.: https://modelo-ml-gxi9.onrender.com
});

// Adiciona o token automaticamente para a API de dashboard (se necessário)
apiDashboard.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição (dashboard):', error);
    return Promise.reject(error);
  }
);

// Adiciona o token automaticamente para a API de predição (se necessário)
apiPredicao.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição (predição):', error);
    return Promise.reject(error);
  }
);

// Trata erros 401 para a API de dashboard
apiDashboard.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.log('Erro 401: Token inválido (dashboard). Limpando localStorage e redirecionando para /login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Trata erros 401 para a API de predição
apiPredicao.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.log('Erro 401: Token inválido (predição). Limpando localStorage e redirecionando para /login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiDashboard, apiPredicao };