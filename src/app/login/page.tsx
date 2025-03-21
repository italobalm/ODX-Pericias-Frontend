"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa"; // Importando o ícone de seta

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Impede o recarregamento da página
  };

  const handleGoBack = () => {
    window.history.back(); // Volta para a página anterior
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Título */}
      <header className="w-full max-w-md mt-10 mb-6">
        <div className="flex items-center justify-start mb-4">
          {/* Botão de Voltar */}
          <button
            onClick={handleGoBack}
            className="text-gray-800 hover:text-gray-600 transition"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
        </div>
        {/* Logo do app */}
        <Image
          src="../logo.png"
          alt="Logo"
          width={80}
          height={100}
          className="mt-10"
          unoptimized
        />
        <h1 className="text-3xl font-bold text-gray-800 text-left mt-6">
          Bem-vindo
        </h1>
        <p className="text-lg text-gray-600 mt-2">Faça login em sua conta</p>
      </header>

      {/* Container centralizado com uma animação */}
      <div className="w-full max-w-md bg-white p-6 mt-14 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition"
          >
            Entrar
          </button>
        </form>

        {/* Links de recuperação de senha e registro */}
        <div className="mt-4 flex justify-between text-sm">
          <a href="/forgotPassword" className="text-teal-500 hover:underline">
            Esqueci minha senha
          </a>
          <Link href="/register" className="text-teal-500 hover:underline">
            Não possuo conta
          </Link>
        </div>
      </div>
    </div>
  );
}
