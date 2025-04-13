"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaIdCard,
  FaKey,
  FaRegUser,
  FaSignOutAlt,
  FaTooth,
} from "react-icons/fa";

export default function ConfiguracoesPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [cro, setCro] = useState("");
  const [rg, setRg] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar dados do usuário
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        setUserName(data.name);
        setEmail(data.email);
        setCro(data.cro || "");
        setRg(data.rg || "");
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  // Salvar dados no backend
  const handleSave = async () => {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, email, cro, rg }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error("Erro ao salvar dados");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const handleGoBack = () => router.back();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
            <p className="text-sm text-gray-600">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <Field
            label="Nome"
            icon={<FaRegUser className="text-teal-500" />}
            value={userName}
            setValue={setUserName}
            placeholder="Digite seu nome"
          />
          <Field
            label="Email"
            icon={<FaEnvelope className="text-teal-500" />}
            value={email}
            setValue={setEmail}
            placeholder="Digite seu email"
            type="email"
          />
          <Field
            label="CRO"
            icon={<FaTooth className="text-teal-500" />}
            value={cro}
            setValue={setCro}
            placeholder="Digite seu número do CRO"
          />
          <Field
            label="RG"
            icon={<FaIdCard className="text-teal-500" />}
            value={rg}
            setValue={setRg}
            placeholder="Digite seu RG"
          />
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <button
            onClick={handleSave}
            className="w-full bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700 transition text-sm font-medium"
          >
            Salvar Alterações
          </button>
          <button
            onClick={() => router.push("/changePassword")}
            className="w-full bg-white border border-gray-300 text-gray-800 p-3 rounded-xl hover:bg-gray-100 transition text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <FaKey className="text-teal-500" />
            <span>Alterar Senha</span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-red-600 text-white p-3 rounded-xl hover:bg-red-500 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <FaSignOutAlt />
            <span>Sair da Conta</span>
          </button>
        </div>

        {saved && (
          <p className="text-green-600 text-sm text-center mt-4 transition-opacity animate-fade-in">
            Alterações salvas com sucesso!
          </p>
        )}
      </div>
    </div>
  );
}

// Componente reutilizável de campo
function Field({ label, icon, value, setValue, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-300 transition">
        <span className="mr-3">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm bg-transparent outline-none"
        />
      </div>
    </div>
  );
}
