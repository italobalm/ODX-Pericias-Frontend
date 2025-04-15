"use client";

import Head from "next/head";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Geist } from "next/font/google";
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

// Componente do Provider de Autenticação
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Efeito para buscar o usuário ao carregar o layout
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/me"); // Altere o endpoint conforme sua API
        const { nome, cro, perfil } = response.data;

        const formattedUser: User = {
          userFullName: nome,
          croNumber: cro ?? "N/A",
          userId: perfil.toLowerCase() as "admin" | "perito" | "assistente",
          perfil: perfil as "Admin" | "Perito" | "Assistente", // Ajuste para o perfil
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

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Fonte
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Layout principal
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <Head>
        <title>ODX Perícias</title>
        <meta
          name="description"
          content="A solução ideal para laudos rápidos e confiáveis"
        />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <body className={`${geistSans.variable} antialiased bg-gray-100`}>
        <AuthProvider>
          <Navbar />
          <main className="pt-28 px-4 max-w-6xl mx-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
