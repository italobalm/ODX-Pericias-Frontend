"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Tipagem do usuário
type Perfil = "Admin" | "Perito" | "Assistente";
type UserId = "admin" | "perito" | "assistente";

interface User {
  userFullName: string;
  croNumber: string;
  userId: UserId;
  perfil: Perfil;
}

// Tipagem do contexto
interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await axios.get("/auth/logged-user");

        const formattedUser: User = {
          userFullName: data.nome,
          croNumber: data.cro ?? "N/A",
          userId: data.perfil.toLowerCase() as UserId,
          perfil: data.perfil as Perfil,
        };

        setUser(formattedUser);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        setUser(null); // Garante reset em caso de erro
      }
    }

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
