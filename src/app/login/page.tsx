"use client";

import { useState } from "react";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Substitua a URL abaixo pela URL real da sua API de autenticação
      const response = await axios.post("/api/login", { email, password });

      if (response.status === 200) {
        // Autenticação bem-sucedida
        router.push("/initialScreen");
      } else {
        // Qualquer status diferente de 200 pode ser tratado como erro
        setErrorMessage("Email ou senha incorretos.");
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao tentar fazer login."
      );
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-teal-100 to-teal-300 flex items-center justify-center overflow-hidden">
      {/* Bolinhas no fundo */}
      <div className="absolute inset-0 z-0 animate-[pulseDots_2s_ease-in-out_infinite] opacity-30 bg-[radial-gradient(circle,_white_2px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Botão de voltar */}
      <button
        onClick={handleGoBack}
        className="absolute top-6 left-6 z-10 text-gray-800 hover:text-teal-100 transition"
      >
        <FaArrowLeft className="text-3xl" />
      </button>

      {/* Container principal do login */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden bg-white mx-4 md:mx-0">
        {/* MOBILE HEADER */}
        <div className="md:hidden flex flex-col w-full p-6">
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

            {errorMessage && (
              <div className="text-red-600 text-sm">{errorMessage}</div>
            )}

            <button
              type="submit"
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

      {/* Custom keyframe animation para as bolinhas */}
      <style jsx>{`
        @keyframes pulseDots {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
