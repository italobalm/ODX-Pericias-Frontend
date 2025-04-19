"use client";

import api from "../../lib/axiosConfig";
import { User, AuthResponse } from "@/types/User";
import { ApiError } from "@/types/Error";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Tipagem do contexto
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>; // Update to return a Promise
  error: string | null;
}

// Criação do contexto
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get<User>("/api/auth/logged-user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  async function login(email: string, senha: string) {
    try {
      setError(null);
      const response = await api.post<AuthResponse>("/api/auth/login", {
        email,
        senha,
      });

      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      setUser(userData);
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.msg || "Erro inesperado no login.";
      console.error("Erro no login:", msg);
      setError(msg);
      throw new Error(msg);
    }
  }

  async function logout() {
    try {
      // ponto final de logout
      await api.post("/api/auth/logout");
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.msg || "Erro ao realizar logout no servidor.";
      console.error("Erro ao realizar logout:", msg);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumo
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}