import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/axiosConfig";
import { User, AuthResponse } from "../types/User";
import { ApiError } from "../types/Error";

const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Tenta restaurar o usuário do localStorage (opcional)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token) {
      setLoading(true);
  
      api.get<AuthResponse>("/api/auth/logged-user", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          setUser(response.data.user); 
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);
  

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      console.log("Iniciando login com:", email);
      const response = await api.post<AuthResponse>("/api/auth/login", { email, senha });
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData)); // Persiste usuário (opcional)
      setUser(userData);
      setError(null);
      console.log("Login bem-sucedido, usuário:", userData);
    } catch (error) {
      const errorTyped = error as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || "Não foi possível fazer login.";
      setError(errorMessage);
      console.error("Erro no login:", errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Remove usuário (opcional)
    setUser(null);
    router.push("/login");
  };

  return { user, loading, error, login, logout };
};

export default useAuth;