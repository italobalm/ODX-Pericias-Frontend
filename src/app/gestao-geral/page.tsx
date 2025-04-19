"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function CaseManagementPage() {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto pt-28 p-4 md:p-8">
      {/* Cabeçalho com seta de voltar e título */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-900 transition"
          title="Voltar"
        >
          <FaArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Gestão de Casos
        </h1>
      </div>

      {/* Botões de navegação */}
      <div className="flex flex-col items-center gap-8 mt-16">
        <button
          onClick={() => router.push("/gestao-evidencias")}
          className="w-64 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
        >
          Evidências
        </button>
        <button
          onClick={() => router.push("/gestao-casos")}
          className="w-64 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
        >
          Casos
        </button>
        <button
          onClick={() => router.push("/gestao-relatorios")}
          className="w-64 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
        >
          Relatórios
        </button>
      </div>
    </div>
  );
}
