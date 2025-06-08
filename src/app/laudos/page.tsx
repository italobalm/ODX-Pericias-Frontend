// GerarLaudoPage.tsx

"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import api from "@/lib/axiosConfig";
import { useAuth } from "@/app/providers/AuthProvider";
import { IVitima } from "@/types/Vitima";
import { AxiosError } from "axios";
import { motion } from "framer-motion";

export default function GerarLaudoPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

  const [vitimas, setVitimas] = useState<IVitima[]>([]);
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    vitimaId: "",
    dadosAntemortem: "",
    dadosPostmortem: "",
    analiseLesoes: "",
    conclusao: "",
  });

  const isFormValid =
    formData.vitimaId &&
    formData.dadosAntemortem &&
    formData.dadosPostmortem &&
    formData.analiseLesoes &&
    formData.conclusao;

  useEffect(() => {
    if (user && !authLoading) {
      const fetchVictims = async () => {
        setIsLoading(true);
        try {
          const response = await api.get<{ vitimas: IVitima[] }>("/api/vitima", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          });
          setVitimas(response.data.vitimas || []);
        } catch (err: unknown) {
          const axiosError = err as AxiosError<{ msg?: string }>;
          setError(axiosError.response?.data?.msg || "Erro ao buscar vítimas.");
          setVitimas([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVictims();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const selectedVitima = vitimas.find((v) => v._id === formData.vitimaId);
    if (selectedVitima?.caso) {
      setCaseId(selectedVitima.caso);
      const fetchEvidencias = async () => {
        try {
          const evidenciasResponse = await api.get(`/api/evidence?caso=${selectedVitima.caso}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          });
          setEvidencias(evidenciasResponse.data.map((e: { _id: string }) => e._id) || []);
        } catch {
          setEvidencias([]);
        }
      };
      fetchEvidencias();
    } else {
      setCaseId(null);
      setEvidencias([]);
    }
  }, [formData.vitimaId, vitimas]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    try {
      const laudoData = {
        vitima: formData.vitimaId,
        perito: user?._id,
        evidencias: evidencias,
        caso: caseId || undefined,
        dadosAntemortem: formData.dadosAntemortem,
        dadosPostmortem: formData.dadosPostmortem,
        analiseLesoes: formData.analiseLesoes,
        conclusao: formData.conclusao,
      };

      await api.post("/api/laudo", laudoData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      setSuccess("Laudo criado com sucesso.");
      setError("");
      setFormData({
        vitimaId: "",
        dadosAntemortem: "",
        dadosPostmortem: "",
        analiseLesoes: "",
        conclusao: "",
      });
      setEvidencias([]);
      setCaseId(null);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao criar o laudo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  if (authError) return <div className="text-center mt-20 text-red-500">Erro de autenticação: {authError}</div>;
  if (!user || !["admin", "perito"].includes(user.perfil.toLowerCase())) {
    router.push("/initialScreen");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-28 p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition p-2"
          title="Voltar"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Criar Novo Laudo</h1>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-4 md:p-6 shadow-md space-y-6"
      >
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <div>
          <label htmlFor="vitimaId" className="block text-sm font-medium text-gray-700">
            Vítima
          </label>
          <select
            name="vitimaId"
            id="vitimaId"
            value={formData.vitimaId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          >
            <option value="">Selecione uma vítima</option>
            {vitimas.map((vitima) => (
              <option key={vitima._id} value={vitima._id}>
                {vitima.nome || vitima._id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dados Antemortem</label>
          <textarea
            name="dadosAntemortem"
            value={formData.dadosAntemortem}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dados Postmortem</label>
          <textarea
            name="dadosPostmortem"
            value={formData.dadosPostmortem}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Análise de Lesões</label>
          <textarea
            name="analiseLesoes"
            value={formData.analiseLesoes}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Conclusão</label>
          <textarea
            name="conclusao"
            value={formData.conclusao}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 text-white p-3 rounded-md hover:bg-teal-700 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Criar Laudo"}
        </button>
      </motion.form>
    </div>
  );
}
