"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaKey,
  FaUserShield,
  FaSignOutAlt,
} from "react-icons/fa";

export default function ConfiguracoesPage() {
  const router = useRouter();

  // Simulação de dados iniciais
  const [userName, setUserName] = useState("Italo Melo");
  const [email, setEmail] = useState("italo@email.com");
  const [phone, setPhone] = useState("(81) 91234-5678");
  const [role, setRole] = useState("perito");
  const [saved, setSaved] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleSave = () => {
    // Aqui você pode enviar os dados atualizados para uma API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <button onClick={handleGoBack} className="text-gray-800 hover:text-gray-600">
          <FaArrowLeft className="text-2xl" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <div style={{ width: 32 }}></div>
      </header>

      {/* Perfil e campos editáveis */}
      <div className="bg-white p-6 mt-4 w-full max-w-md rounded-2xl shadow-md space-y-4">
        <div className="flex items-center space-x-3">
          <FaUserShield className="text-teal-500 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Perfil</p>
            <p className="font-semibold text-gray-800 capitalize">{role}</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">Nome</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring focus:ring-blue-300 text-gray-800 placeholder-gray-500"
            placeholder="Digite seu nome"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring focus:ring-blue-300 text-gray-800 placeholder-gray-500"
            placeholder="Digite seu email"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500 block mb-1">Telefone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring focus:ring-blue-300 text-gray-800 placeholder-gray-500"
            placeholder="Digite seu telefone"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition"
        >
          Salvar Alterações
        </button>

        {saved && (
          <p className="text-green-600 text-sm mt-2 text-center">
            Alterações salvas com sucesso!
          </p>
        )}
      </div>

      {/* Ações adicionais */}
      <div className="w-full max-w-md mt-8 space-y-4">
        <button
          onClick={() => router.push("/changePassword")}
          className="w-full bg-white p-4 flex items-center space-x-3 rounded-xl shadow hover:bg-gray-100 border border-gray-300"
        >
          <FaKey className="text-teal-500 text-xl" />
          <span className="text-gray-800 font-medium">Alterar Senha</span>
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-red-600 p-4 flex items-center space-x-3 rounded-xl shadow hover:bg-red-400 text-white"
        >
          <FaSignOutAlt className="text-xl" />
          <span className="font-medium">Sair da Conta</span>
        </button>
      </div>
    </div>
  );
}
