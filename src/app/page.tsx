"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./providers/AuthProvider";
import Image from "next/image";
import { ApiError } from "@/types/Error";

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { login, loading, error, user } = useAuth();

  // Registro do Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);
        })
        .catch((error) => {
          console.error("Falha ao registrar o Service Worker:", error);
        });
    }
  }, []);

  // Redirecionamento se o usuário já estiver logado
  useEffect(() => {
    if (user) {
      router.push("/initialScreen");
    } else {
      setEmail("");
      setSenha("");
      setErrorMessage(null);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await login(email, senha);
    } catch (err) {
      const errorTyped = err as ApiError;
      setErrorMessage(errorTyped.response?.data?.msg || "Erro ao fazer login.");
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-teal-100 to-teal-300 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 animate-[pulseDots_2s_ease-in-out_infinite] opacity-30 bg-[radial-gradient(circle,_white_2px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden bg-white mx-4 md:mx-0">
        <div className="md:hidden flex flex-col w-full p-6">
          <Image src="/logo.png" alt="Logo" width={80} height={100} unoptimized />
          <h1 className="text-3xl font-bold text-gray-800 mt-6">Bem-vindo</h1>
          <p className="text-lg text-gray-600 mt-2">Faça login em sua conta</p>
        </div>

        <div className="hidden md:flex flex-col justify-center items-start bg-teal-500 text-white px-16 py-12 w-1/2 space-y-4">
          <Image src="/logo.png" alt="Logo" width={100} height={120} unoptimized />
          <h2 className="text-3xl font-bold mt-6">Bem-vindo!</h2>
          <p className="text-lg">Faça login para acessar suas perícias.</p>
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring focus:ring-blue-300 text-gray-800 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring focus:ring-blue-300 text-gray-800 placeholder-gray-500"
                required
              />
            </div>

            {(errorMessage || error) && (
              <div className="text-red-600 text-sm">{errorMessage || error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition"
              disabled={loading}
            >
              {loading ? "Carregando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 flex justify-end text-sm">
            <a href="/forgot-password" className="text-teal-500 hover:underline">
              Esqueci minha senha
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseDots {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}