// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { login, user, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await login(email, password);
      if (user) {
        router.push("/initialScreen");
      }
    } catch (err) {
      setErrorMessage(error || "Erro ao fazer login.");
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (user) router.push("/initialScreen");

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-teal-100 to-teal-300 flex items-center justify-center">
      <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring focus:ring-blue-300"
              required
            />
          </div>
          {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}
          <button
            type="submit"
            className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition"
            disabled={loading}
          >
            Entrar
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/forgotPassword" className="text-teal-500 hover:underline">
            Esqueci minha senha
          </a>
        </div>
      </div>
    </div>
  );
}