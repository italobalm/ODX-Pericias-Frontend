"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); //Adicionando preventDefault pra quando o user clicar em entrar, não recarregue a página
  };


//A partir daqui, a tela começa a aparecer para o usuário
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <header className="p-8">
        <Image
          src="../logo.png"
          alt="Logo"
          width={80}
          height={100}
          className="mt-10"
          unoptimized
        />
        <h1 className="text-3xl font-bold mt-10">Bem vindo</h1>
        <p className="text-lg text-gray-600 mt-2">Faça login em sua conta</p>
      </header>

      <div className="p-8 bg-white rounded shadow-md w-full max-w-md mx-auto mb-0">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 font-semibold">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Entrar
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <a href="#" className="text-teal-500 hover:underline">
            Esqueci minha senha
          </a>
          <a href="#" className="text-teal-500 hover:underline">
            Não possuo conta
          </a>
        </div>
      </div>
    </div>
  );
}
