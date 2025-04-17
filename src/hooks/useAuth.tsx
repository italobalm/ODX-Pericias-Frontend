import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/axiosConfig";
import { User, AuthResponse } from "../types/User";
import { ApiError } from "../types/Error";

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoading(true);
      api.get<AuthResponse>("/api/auth/verify-token", { // Exemplo de endpoint para verificar token
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
      const response = await api.post<AuthResponse>("/api/auth/login", { email, senha });
      const { token, user: userData } = response.data;
      localStorage.setItem("token", token);
      setUser(userData);
      setError(null);
      router.push("/initialScreen"); // Redirect to initialScreen after login
    } catch (error) {
      const errorTyped = error as ApiError;
      const errorMessage = errorTyped.response?.data?.msg || "Não foi possível fazer login.";
      setError(errorMessage);
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
    setUser(null);
    router.push("/login"); // Redirect to login after logout
  };

  return { user, loading, error, login, logout };
};

export default useAuth;
