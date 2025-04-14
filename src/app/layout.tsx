"use client";

import type { Metadata } from "next";
import Head from "next/head";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Geist } from "next/font/google";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define a interface para os dados do usuário
interface User {
  userFullName: string;
  croNumber: string;
  userId: "admin" | "perito" | "assistente";
}

// Define a interface do contexto
interface AuthContextProps {
  user: User | null;
  setUser: (user: User) => void;
}

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider para o contexto de autenticação
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Aqui você faria a chamada ao backend para obter os dados do usuário logado.
    // Neste exemplo, simulamos essa chamada com um valor fixo.
    const fetchUser = async () => {
      // Simulação de resposta do backend
      const simulatedUser: User = {
        userFullName: "Dr. João Perito",
        croNumber: "CRO-12345",
        userId: "admin",
      };
      setUser(simulatedUser);
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para utilizar o AuthContext em qualquer componente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const metadata: Metadata = {
  title: "ODX Perícias",
  description: "A solução ideal para laudos rápidos e confiáveis",
  icons: { icon: "/logo.png" },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <Head>
        <link rel="icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="A solução ideal para laudos rápidos e confiáveis"
        />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
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
