"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Case {
  id: string;
  title: string;
  description: string;
  status: "pendente" | "em andamento" | "concluido";
}

interface Expert {
  id: string;
  name: string;
}

export default function RequestPage() {
  const [cases, setCases] = useState<Case[]>([]); // Lista de casos
  const [experts, setExperts] = useState<Expert[]>([]); // Lista de peritos
  const [selectedExpert, setSelectedExpert] = useState<string>(""); // Perito selecionado
  const [selectedCase, setSelectedCase] = useState<string>(""); // Caso selecionado

  useEffect(() => {
    // Carregar lista de casos pendentes
    axios.get("/api/cases?status=pendente").then((res) => {
      setCases(res.data);
    });

    // Carregar lista de peritos
    axios.get("/api/experts").then((res) => {
      setExperts(res.data);
    });
  }, []);

  const handleAssignCase = () => {
    if (!selectedCase || !selectedExpert) {
      alert("Selecione um caso e um perito.");
      return;
    }

    // Atribuir o caso ao perito
    axios
      .put(`/api/cases/${selectedCase}/assign`, {
        expertId: selectedExpert,
      })
      .then((res) => {
        alert("Caso atribuído com sucesso!");
        // Atualizar a lista de casos após a atribuição
        setCases(cases.filter((caseItem) => caseItem.id !== selectedCase));
      })
      .catch((err) => {
        console.error(err);
        alert("Erro ao atribuir o caso.");
      });
  };

  return (
    <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Solicitações
      </h1>

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-10 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Casos Pendentes</h2>

        {cases.length === 0 ? (
          <p className="text-gray-500">Nenhum caso pendente.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {cases.map((caseItem) => (
              <li
                key={caseItem.id}
                className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div>
                  <p className="font-medium text-gray-800">{caseItem.title}</p>
                  <p className="text-sm text-gray-500">
                    {caseItem.description}
                  </p>
                </div>

                <div className="flex gap-4">
                  {/* Seleção do Perito */}
                  <select
                    className="p-2 border border-gray-300 rounded-md text-sm"
                    onChange={(e) => setSelectedExpert(e.target.value)}
                    value={selectedExpert}
                  >
                    <option value="">Escolha um Perito</option>
                    {experts.map((expert) => (
                      <option key={expert.id} value={expert.id}>
                        {expert.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      setSelectedCase(caseItem.id);
                      handleAssignCase();
                    }}
                    className="bg-teal-600 text-white py-2 px-4 rounded-md text-sm"
                  >
                    Atribuir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
