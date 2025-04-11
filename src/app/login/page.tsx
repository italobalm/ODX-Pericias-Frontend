"use client";

import { useState } from "react";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden bg-white">
        {/* MOBILE HEADER */}
        <div className="md:hidden flex flex-col w-full p-6">
          <button
            onClick={handleGoBack}
            className="text-gray-800 hover:text-gray-600 transition mb-4"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={100}
            unoptimized
          />
          <h1 className="text-3xl font-bold text-gray-800 mt-6">Bem-vindo</h1>
          <p className="text-lg text-gray-600 mt-2">Faça login em sua conta</p>
        </div>

        {/* LADO ESQUERDO (desktop) */}
        <div className="hidden md:flex flex-col justify-center items-start bg-teal-500 text-white px-16 py-12 w-1/2 space-y-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={120}
            unoptimized
          />
          <h2 className="text-3xl font-bold mt-6">Bem vindo!</h2>
          <p className="text-lg">Faça login para acessar suas perícias.</p>
        </div>

        {/* FORMULÁRIO */}
        <div className="w-full md:w-1/2 p-6 sm:p-10">
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
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring focus:ring-blue-300 text-gray-800 placeholder-gray-500"
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
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring focus:ring-blue-300 text-gray-800 placeholder-gray-500"
                required
              />
            </div>
            <button
              type="submit"
              onClick={() => (window.location.href = "/initialScreen")}
              className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition"
            >
              Entrar
            </button>
          </form>

          <div className="mt-4 flex justify-end text-sm">
            <a href="/forgotPassword" className="text-teal-500 hover:underline">
              Esqueci minha senha
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
