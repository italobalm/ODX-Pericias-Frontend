"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaArrowLeft,
  FaUserShield,
  FaKey,
  FaSignOutAlt,
} from "react-icons/fa";

export default function ConfiguracoesPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("Italo Melo");
  const [email, setEmail] = useState("italo@email.com");
  const [phone, setPhone] = useState("(81) 91234-5678");
  const [saved, setSaved] = useState(false);

  const handleGoBack = () => router.back();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md md:max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* MOBILE HEADER */}
        <div className="md:hidden flex flex-col w-full items-start p-6">
          <button
            onClick={handleGoBack}
            className="text-gray-800 hover:text-gray-600 transition mb-4"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mt-6">
            Configurações
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* DESKTOP LEFT SIDE */}
        <div className="hidden md:flex md:flex-col md:justify-center md:items-start bg-teal-500 text-white px-16 py-12 w-1/2 space-y-4">
          <button
            onClick={handleGoBack}
            className="text-white hover:text-gray-200 transition"
          >
            <FaArrowLeft className="text-2xl mb-6" />
          </button>
          <h2 className="text-3xl font-bold">Configurações</h2>
          <p className="text-lg">
            Gerencie seus dados de perfil e segurança.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 space-y-4">
          <div className="flex items-center space-x-3">
            <FaUserShield className="text-teal-500 text-xl" />
            <div>
              <p className="text-sm text-gray-500">Perfil</p>
              <p className="font-semibold text-gray-800 capitalize">perito</p>
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

          <div className="pt-6 space-y-4">
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
      </div>
    </div>
  );
}
