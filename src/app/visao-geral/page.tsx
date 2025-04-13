"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const filtros = [
  { label: "Vítima", key: "vitima" },
  { label: "Sexo", key: "sexo" },
  { label: "Estado do Corpo", key: "estado" },
  { label: "Lesões", key: "lesoes" },
  { label: "Cidade", key: "cidade" },
];

export default function VisaoGeral() {
  const [filtroSelecionado, setFiltroSelecionado] = useState("vitima");
  const [dados, setDados] = useState({});

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const res = await fetch("/api/dashboardRoutes");
        const json = await res.json();
        setDados(json);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };

    fetchDados();
  }, []);

  const dadosAtuais = dados[filtroSelecionado] || [];
  const totalCasos = dados.totalCasos || 0;

  return (
    <div className="p-4 space-y-6">
      {/* Título alinhado à esquerda */}
      <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>

      {/* Destaques */}
      <div className="bg-white rounded-xl shadow p-4 text-center xl:text-left">
        <p className="text-lg font-semibold text-gray-700">
          Total de Casos Registrados
        </p>
        <p className="text-3xl font-bold text-green-500 mt-1">{totalCasos}</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-start gap-2">
        {filtros.map((filtro) => (
          <button
            key={filtro.key}
            onClick={() => setFiltroSelecionado(filtro.key)}
            className={`px-4 py-2 rounded-md border text-sm transition 
              ${
                filtroSelecionado === filtro.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {/* Gráfico e Tabela */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Gráfico */}
        <div className="xl:w-1/2 w-full h-80 bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-center xl:text-left">
            Comparações
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosAtuais}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela */}
        <div className="xl:w-1/2 w-full bg-white rounded-xl shadow p-4 overflow-x-auto">
          <h2 className="font-semibold mb-2 text-center xl:text-left">Dados</h2>
          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 border-b">Categoria</th>
                <th className="px-4 py-3 border-b">Quantidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dadosAtuais.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {item.categoria}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {item.quantidade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
