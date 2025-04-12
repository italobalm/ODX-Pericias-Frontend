"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaFilter, FaUser, FaCalendar, FaCheckCircle } from "react-icons/fa"; // Ícones do react-icons

type CaseStatus = "arquivado" | "em andamento" | "concluido";

interface Case {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: CaseStatus;
  assignedTo: string; // Responsável pelo caso
}

export default function CaseManagementPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filters, setFilters] = useState({
    status: "",
    assignedTo: "",
    date: "",
  });
  const [filtersVisible, setFiltersVisible] = useState(false); // Estado para controlar a visibilidade dos filtros

  useEffect(() => {
    // Aqui você pode pegar os dados da API ou do seu banco de dados.
    axios.get("/api/cases").then((res) => {
      setCases(res.data);
    });
  }, []);

  // Função para filtrar os casos
  const filterCases = () => {
    return cases.filter((caseItem) => {
      return (
        (filters.status ? caseItem.status === filters.status : true) &&
        (filters.assignedTo
          ? caseItem.assignedTo
              .toLowerCase()
              .includes(filters.assignedTo.toLowerCase())
          : true) &&
        (filters.date ? caseItem.createdAt.includes(filters.date) : true)
      );
    });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Gestão de Casos
      </h1>

      {/* Ícone para abrir/fechar filtros no modo mobile */}
      <div className="md:hidden flex justify-end mb-10">
        <button
          onClick={() => setFiltersVisible(!filtersVisible)}
          className="text-gray-700 text-xl"
        >
          <FaFilter />
        </button>
      </div>

      {/* Filtros - visíveis no desktop ou quando clicado no mobile */}
      <div
        className={`bg-white rounded-xl p-4 md:p-6 shadow-md mb-6 space-y-4 ${
          filtersVisible ? "block" : "hidden"
        } md:block`}
      >
        <h2 className="text-lg font-semibold text-gray-700">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-500" />
            <input
              type="text"
              name="assignedTo"
              placeholder="Responsável"
              value={filters.assignedTo}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FaCalendar className="text-gray-500" />
            <input
              type="date"
              name="date"
              placeholder="Data"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FaCheckCircle className="text-gray-500" />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-300"
            >
              <option value="">Selecione o status</option>
              <option value="arquivado">Arquivado</option>
              <option value="em andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Casos Filtrados */}
      <div className="space-y-10">
        {/* Casos Arquivados */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">
            Casos Arquivados
          </h2>
          {filterCases().filter((caseItem) => caseItem.status === "arquivado")
            .length === 0 ? (
            <p className="text-gray-500">Nenhum caso arquivado.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filterCases()
                .filter((caseItem) => caseItem.status === "arquivado")
                .map((caseItem) => (
                  <li
                    key={caseItem.id}
                    className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {caseItem.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {caseItem.description}
                        <br />
                        Criado em:{" "}
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-teal-600 font-semibold">
                      Arquivado
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Casos em Andamento */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">
            Casos em Andamento
          </h2>
          {filterCases().filter(
            (caseItem) => caseItem.status === "em andamento"
          ).length === 0 ? (
            <p className="text-gray-500">Nenhum caso em andamento.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filterCases()
                .filter((caseItem) => caseItem.status === "em andamento")
                .map((caseItem) => (
                  <li
                    key={caseItem.id}
                    className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {caseItem.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {caseItem.description}
                        <br />
                        Criado em:{" "}
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-yellow-600 font-semibold">
                      Em Andamento
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Casos Concluídos */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">
            Casos Concluídos
          </h2>
          {filterCases().filter((caseItem) => caseItem.status === "concluido")
            .length === 0 ? (
            <p className="text-gray-500">Nenhum caso concluído.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filterCases()
                .filter((caseItem) => caseItem.status === "concluido")
                .map((caseItem) => (
                  <li
                    key={caseItem.id}
                    className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {caseItem.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {caseItem.description}
                        <br />
                        Criado em:{" "}
                        {new Date(caseItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-600 font-semibold">
                      Concluído
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
