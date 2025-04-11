"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft, FaKey, FaSignOutAlt } from "react-icons/fa";

export default function ConfiguracoesPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("Italo Melo");
  const [email, setEmail] = useState("italo@email.com");
  const [saved, setSaved] = useState(false);

  const handleGoBack = () => router.back();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-[#f0f2f5]">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-6 md:p-10">
        {/* Seta e título */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-800 transition mb-4"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
          <p className="text-sm text-gray-600">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Grid alinhado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {/* Linha 1 - Nome | (vazio) */}
          <div>
            <label className="text-sm text-gray-500 block mb-1">Nome</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring focus:ring-blue-300"
              placeholder="Digite seu nome"
            />
          </div>
          <div /> {/* Espaço vazio ao lado de Nome */}
          {/* Linha 2 - Email | Salvar Alterações */}
          <div>
            <label className="text-sm text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring focus:ring-blue-300"
              placeholder="Digite seu email"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSave}
              className="w-full bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700 text-sm font-medium"
            >
              Salvar Alterações
            </button>
          </div>
          {/* Linha 3 - Alterar Senha | Sair da Conta */}
          <div className="flex items-end">
            <button
              onClick={() => router.push("/changePassword")}
              className="w-full bg-white border border-gray-300 text-gray-800 p-3 rounded-xl hover:bg-gray-100 text-sm font-medium flex items-center justify-center space-x-2 shadow-sm"
            >
              <FaKey className="text-teal-500" />
              <span>Alterar Senha</span>
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-red-600 text-white p-3 rounded-xl hover:bg-red-500 text-sm font-medium flex items-center justify-center space-x-2"
            >
              <FaSignOutAlt />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>

        {/* Feedback */}
        {saved && (
          <p className="text-green-600 text-sm text-center mt-6">
            Alterações salvas com sucesso!
          </p>
        )}
      </div>
    </div>
  );
}
