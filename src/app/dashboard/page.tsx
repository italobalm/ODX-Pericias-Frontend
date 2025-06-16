"use client";

import { apiDashboard, apiPredicao } from "@/lib/axiosConfig"; // Importar as duas instâncias do Axios
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
  casosPorMes?: { mes: string; quantidade: number }[];
  vitima?: DadosItem[];
  sexo?: DadosItem[];
  estado?: DadosItem[];
  lesoes?: DadosItem[];
  cidade?: DadosItem[];
}

interface PredicaoData {
  classe_predita: string;
  probabilidades: { [key: string]: number };
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
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predicao, setPredicao] = useState<PredicaoData | null>(null);
  const [predicaoLoading, setPredicaoLoading] = useState(false);
  const [predicaoError, setPredicaoError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    idade: "",
    sexo: "",
    cidade: "",
    estado: "",
  });

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiDashboard.get("/api/dashboard");
        setDados(res.data);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setError("Erro ao carregar dados do dashboard. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  // Função para realizar a predição
  const handlePredicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicaoLoading(true);
    setPredicaoError(null);
    try {
      const res = await apiPredicao.post("/api/predizer", {
        idade: parseInt(formData.idade),
        sexo: formData.sexo,
        cidade: formData.cidade,
        estado: formData.estado,
      });
      setPredicao(res.data);
    } catch (err) {
      console.error("Erro ao fazer predição:", err);
      setPredicaoError("Erro ao realizar predição. Verifique os dados e tente novamente.");
    } finally {
      setPredicaoLoading(false);
    }
  };

  // Atualizar dados do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const dadosAtuais: DadosItem[] = (dados?.[filtroSelecionado] as DadosItem[]) || [];
  const tipoGrafico = dadosAtuais[0]?.tipoGrafico || "barra";

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg text-gray-500">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum dado disponível.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>

      {/* Seção de predição */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4 text-gray-700">Fazer Predição de Tipo de Caso</h2>
        <form onSubmit={handlePredicao} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Idade</label>
              <input
                type="number"
                name="idade"
                value={formData.idade}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Digite a idade"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                required
              >
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Ex.: São Paulo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <input
                type="text"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Ex.: SP"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={predicaoLoading}
            className={`px-4 py-2 rounded-md text-white font-medium transition ${
              predicaoLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {predicaoLoading ? "Processando..." : "Fazer Predição"}
          </button>
        </form>

        {predicaoError && (
          <p className="mt-4 text-red-600 font-semibold">{predicaoError}</p>
        )}
        {predicao && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700">Resultado da Predição</h3>
            <p className="mt-2">
              <strong>Classe Predita:</strong> {predicao.classe_predita}
            </p>
            <p className="mt-1">
              <strong>Probabilidades:</strong>
            </p>
            <ul className="list-disc pl-5">
              {Object.entries(predicao.probabilidades).map(([classe, prob]) => (
                <li key={classe}>
                  {classe}: {(prob * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Seção do dashboard */}
      <div className="bg-white rounded-xl shadow p-6 text-center xl:text-left">
        <p className="text-lg font-semibold text-gray-700">Total de Casos Registrados</p>
        <p className="text-4xl font-extrabold text-green-600 mt-2">{dados.totalCasos.toLocaleString()}</p>
      </div>

      {dados.casosPorMes && dados.casosPorMes.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4 text-center xl:text-left text-gray-700">Casos ao longo dos meses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dados.casosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Line
                type="monotone"
                dataKey="quantidade"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-start">
        {filtros.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setFiltroSelecionado(key as FiltroKey)}
            className={`px-5 py-2 rounded-md border transition font-medium ${
              filtroSelecionado === key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <section className="xl:w-1/2 w-full h-80 bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="font-semibold mb-4 text-center xl:text-left text-gray-700">Comparações</h2>
          <ResponsiveContainer width="100%" height="100%">
            {tipoGrafico === "pizza" ? (
              <PieChart>
                <Pie
                  data={dadosAtuais}
                  dataKey="quantidade"
                  nameKey="categoria"
                  outerRadius={90}
                  fill="#3b82f6"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            ) : (
              <BarChart data={dadosAtuais} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="quantidade" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </section>

        <section className="xl:w-1/2 w-full bg-white rounded-xl shadow p-6 overflow-x-auto">
          <h2 className="font-semibold mb-4 text-center xl:text-left text-gray-700">Dados Detalhados</h2>
          <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 border-b">Categoria</th>
                <th className="px-6 py-3 border-b">Quantidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dadosAtuais.map(({ categoria, quantidade }, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap">{categoria}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{quantidade.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}