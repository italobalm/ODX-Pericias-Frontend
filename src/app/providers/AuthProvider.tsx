"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Tipagem do usuário, incluindo o perfil
interface User {
  userFullName: string;
  croNumber: string;
  userId: "admin" | "perito" | "assistente";
  perfil: "Admin" | "Perito" | "Assistente";
}

// Contexto e Provider
interface AuthContextProps {
  user: User | null;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/me"); // Altere o endpoint conforme sua API
        const { nome, cro, perfil } = response.data;

        const formattedUser: User = {
          userFullName: nome,
          croNumber: cro ?? "N/A",
          userId: perfil.toLowerCase() as "admin" | "perito" | "assistente",
          perfil: perfil as "Admin" | "Perito" | "Assistente",
        };

        setUser(formattedUser);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
