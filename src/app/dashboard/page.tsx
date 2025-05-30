"use client";

import api from "@/lib/axiosConfig";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Line,
  PieChart,
  Pie,
} from "recharts";

type FiltroKey = "vitima" | "sexo" | "estado" | "lesoes" | "cidade";

interface DadosItem {
  categoria: string;
  quantidade: number;
  tipoGrafico?: "barra" | "pizza";
}

interface DashboardData {
  totalCasos: number;
  casoPorMes?: { mes: string; quantidade: number }[];
  vitima?: DadosItem[];
  sexo?: DadosItem[];
  estado?: DadosItem[];
  lesoes?: DadosItem[];
  cidade?: DadosItem[];
}

const filtros = [
  { label: "Vítima", key: "vitima" },
  { label: "Sexo", key: "sexo" },
  { label: "Estado do Corpo", key: "estado" },
  { label: "Lesões", key: "lesoes" },
  { label: "Cidade", key: "cidade" },
];

export default function VisaoGeral() {
  const [filtroSelecionado, setFiltroSelecionado] = useState<FiltroKey>("vitima");
  const [dados, setDados] = useState<DashboardData>({ totalCasos: 0 });

  useEffect(() => {
    const fetchDados = async () => {
      try {
        console.log("Iniciando requisição para /dashboard");
        const res = await api.get("/dashboard");
        console.log("Dados recebidos:", res.data);
        setDados(res.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", {
        
        });
      }
    };

    fetchDados();
  }, []);

  const dadosAtuais: DadosItem[] = (dados[filtroSelecionado] as DadosItem[]) || [];
  const tipoGrafico = dadosAtuais[0]?.tipoGrafico || "barra";

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>

      <div className="bg-white rounded-xl shadow p-4 text-center xl:text-left">
        <p className="text-lg font-semibold text-gray-700">
          Total de Casos Registrados
        </p>
        <p className="text-3xl font-bold text-green-500 mt-1">{dados.totalCasos}</p>
      </div>

      {dados.casoPorMes && dados.casoPorMes.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-center xl:text-left">
            Casos ao longo dos meses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dados.casoPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="quantidade"
                stroke="#3b82f6"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap justify-start gap-2">
        {filtros.map((filtro) => (
          <button
            key={filtro.key}
            onClick={() => setFiltroSelecionado(filtro.key as FiltroKey)}
            className={`px-4 py-2 rounded-md border text-sm transition ${
              filtroSelecionado === filtro.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        <div className="xl:w-1/2 w-full h-80 bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-center xl:text-left text-gray-500">
            Comparações
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <>
              {tipoGrafico === "pizza" && (
                <PieChart>
                  <Pie
                    data={dadosAtuais}
                    dataKey="quantidade"
                    nameKey="categoria"
                    outerRadius={80}
                    fill="#3b82f6"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  />
                  <Tooltip />
                </PieChart>
              )}
              {tipoGrafico === "barra" && (
                <BarChart
                  data={dadosAtuais}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="quantidade"
                    fill="#34d399"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </>
          </ResponsiveContainer>
        </div>

        <div className="xl:w-1/2 w-full bg-white rounded-xl shadow p-4 overflow-x-auto">
          <h2 className="font-semibold mb-2 text-center xl:text-left text-gray-500">Dados</h2>
          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 border-b text-gray-600">Categoria</th>
                <th className="px-4 py-3 border-b text-gray-600">Quantidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dadosAtuais.map((item: DadosItem, index: number) => (
                <tr key={index} className="hover:bg-white">
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                    {item.categoria}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">
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