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
  logout: () => Promise<void>;
  error: string | null;
}

// Criação do contexto
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token")); // Track token changes

  useEffect(() => {
    async function fetchUser() {
      const currentToken = localStorage.getItem("token");
      setToken(currentToken);
      if (!currentToken) {
        setUser(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        const { data } = await api.get<User>("/api/auth/logged-user", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        setUser(data);
        setError(null);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setError("Falha ao carregar usuário. Por favor, faça login novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [token]); 

  async function login(email: string, senha: string) {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post<AuthResponse>("/api/auth/login", {
        email,
        senha,
      });

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken); // Trigger useEffect
      setUser(userData);
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.msg || "Erro inesperado no login.";
      console.error("Erro no login:", msg);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.msg || "Erro ao realizar logout no servidor.";
      console.error("Erro ao realizar logout:", msg);
    } finally {
      localStorage.removeItem("token");
      setToken(null); // Trigger useEffect
      setUser(null);
      setLoading(false);
      setError(null);
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