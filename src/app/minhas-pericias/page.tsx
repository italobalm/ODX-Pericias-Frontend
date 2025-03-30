"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

interface Pericia {
  id: string;
  titulo: string;
  status: "andamento" | "concluida" | "arquivada";
}

export default function MinhasPericias() {
  const [pericias, setPericias] = useState<Pericia[]>([]);

  useEffect(() => {
    async function fetchPericias() {
      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/pericias");
        setPericias(response.data);
      } catch (error) {
        console.error("Erro ao buscar perícias", error);
      }
    }
    fetchPericias();
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const periciasAndamento = pericias.filter(p => p.status === "andamento");
  const periciasConcluidas = pericias.filter(p => p.status === "concluida");
  const periciasArquivadas = pericias.filter(p => p.status === "arquivada");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full max-w-md mt-10 mb-6">
        <div className="flex items-center justify-start mb-4">
          <button onClick={handleGoBack} className="text-gray-800 hover:text-gray-600 transition">
            <FaArrowLeft className="text-2xl" />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Minhas Perícias</h1>
      </header>

      <div className="w-full max-w-md space-y-8">
        {/* Em Andamento */}
        <section>
          <h2 className="text-xl font-semibold text-blue-600 mb-3">Em Andamento</h2>
          <div className="space-y-3">
            {periciasAndamento.length > 0 ? (
              periciasAndamento.map(pericia => (
                <div key={pericia.id} className="p-4 bg-blue-100 border-l-4 border-blue-500 rounded-2xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">{pericia.titulo}</h3>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Nenhuma perícia em andamento.</p>
            )}
          </div>
        </section>

        {/* Concluídas */}
        <section>
          <h2 className="text-xl font-semibold text-green-600 mb-3">Concluídas</h2>
          <div className="space-y-3">
            {periciasConcluidas.length > 0 ? (
              periciasConcluidas.map(pericia => (
                <div key={pericia.id} className="p-4 bg-green-100 border-l-4 border-green-500 rounded-2xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">{pericia.titulo}</h3>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Nenhuma perícia concluída.</p>
            )}
          </div>
        </section>

        {/* Arquivadas */}
        <section>
          <h2 className="text-xl font-semibold text-gray-600 mb-3">Arquivadas</h2>
          <div className="space-y-3">
            {periciasArquivadas.length > 0 ? (
              periciasArquivadas.map(pericia => (
                <div key={pericia.id} className="p-4 bg-gray-200 border-l-4 border-gray-500 rounded-2xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800">{pericia.titulo}</h3>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Nenhuma perícia arquivada.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
