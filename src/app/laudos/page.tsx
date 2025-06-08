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
          const response = await api.get<{ data: IVitima[] }>("/api/vitima", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          });
          console.log("Resposta de /api/vitima:", response.data); // Log para depuração
          setVitimas(response.data.data || []);
          setError("");
        } catch (err: unknown) {
          const axiosError = err as AxiosError<{ msg?: string }>;
          setError(axiosError.response?.data?.msg || "Erro ao buscar vítimas.");
          console.error("Erro ao buscar vítimas:", axiosError); // Log para depuração
          setVitimas([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVictims();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (formData.vitimaId) {
      const selectedVitima = vitimas.find((v) => v._id === formData.vitimaId);
      if (selectedVitima?.caso) {
        setCaseId(selectedVitima.caso);
        const fetchEvidencias = async () => {
          try {
            const evidenciasResponse = await api.get(`/api/evidence?caso=${selectedVitima.caso}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });
            console.log("Resposta de /api/evidence:", evidenciasResponse.data); // Log para depuração
            setEvidencias(evidenciasResponse.data.map((e: { _id: string }) => e._id) || []);
          } catch (err: unknown) {
            const axiosError = err as AxiosError<{ msg?: string }>;
            setError(axiosError.response?.data?.msg || "Erro ao buscar evidências.");
            console.error("Erro ao buscar evidências:", axiosError); // Log para depuração
            setEvidencias([]);
          }
        };
        fetchEvidencias();
      } else {
        setCaseId(null);
        setEvidencias([]);
      }
    } else {
      setCaseId(null);
      setEvidencias([]);
    }
  }, [formData.vitimaId, vitimas]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const downloadPDF = (pdfBase64: string, caseId: string | null) => {
    try {
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laudo-${caseId || "laudo"}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Erro ao baixar o PDF.");
      console.error("Erro ao baixar o PDF:", err);
    }
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
        evidencias: evidencias.length > 0 ? evidencias : [],
        caso: caseId || undefined,
        dadosAntemortem: formData.dadosAntemortem,
        dadosPostmortem: formData.dadosPostmortem,
        analiseLesoes: formData.analiseLesoes,
        conclusao: formData.conclusao,
      };

      const response = await api.post("/api/laudo", laudoData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      const { laudo, pdf: pdfBase64 } = response.data;
      setSuccess("Laudo criado e assinado com sucesso. PDF baixado automaticamente.");
      // Baixar o PDF assinado
      downloadPDF(pdfBase64, laudo.caso || null);

      // Limpar o formulário
      setFormData({
        vitimaId: "",
        dadosAntemortem: "",
        dadosPostmortem: "",
        analiseLesoes: "",
        conclusao: "",
      });
      setEvidencias([]);
      setCaseId(null);
      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao criar e assinar o laudo.");
      console.error("Erro ao criar o laudo:", axiosError);
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
    <div className="max-w-2xl mx-auto pt-28 p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-200 transition p-2"
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
        className="bg-white rounded-xl p-4 md:p-8 shadow-md space-y-6"
      >
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <div>
          <label htmlFor="vitimaId" className="block text-sm font-medium text-gray-700 mb-1">
            Vítima *
          </label>
          <select
            name="vitimaId"
            id="vitimaId"
            value={formData.vitimaId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-teal-300 disabled:opacity-50"
            disabled={isLoading}
            required
          >
            <option value="">Selecione uma vítima</option>
            {vitimas.map((vitima) => (
              <option key={vitima._id} value={vitima._id}>
                {vitima.nome || `Vítima ${vitima._id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dadosAntemortem" className="block text-sm font-medium text-gray-700 mb-1">
            Dados Antemortem *
          </label>
          <textarea
            name="dadosAntemortem"
            id="dadosAntemortem"
            value={formData.dadosAntemortem}
            onChange={handleChange}
            placeholder="Descreva os dados antemortem (ex: registros odontológicos, características físicas)"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-teal-300 disabled:opacity-50"
            rows={3}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="dadosPostmortem" className="block text-sm font-medium text-gray-700 mb-1">
            Dados Postmortem *
          </label>
          <textarea
            name="dadosPostmortem"
            id="dadosPostmortem"
            value={formData.dadosPostmortem}
            onChange={handleChange}
            placeholder="Descreva os dados postmortem (ex: estado da arcada dentária, lesões observadas)"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-teal-300 disabled:opacity-50"
            rows={3}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="analiseLesoes" className="block text-sm font-medium text-gray-700 mb-1">
            Análise de Lesões *
          </label>
          <textarea
            name="analiseLesoes"
            id="analiseLesoes"
            value={formData.analiseLesoes}
            onChange={handleChange}
            placeholder="Descreva a análise das lesões (ex: fraturas, marcas de trauma)"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-teal-300 disabled:opacity-50"
            rows={3}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="conclusao" className="block text-sm font-medium text-gray-700 mb-1">
            Conclusão *
          </label>
          <textarea
            name="conclusao"
            id="conclusao"
            value={formData.conclusao}
            onChange={handleChange}
            placeholder="Descreva a conclusão do laudo (ex: identificação confirmada ou não)"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-teal-300 disabled:opacity-50"
            rows={3}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition disabled:opacity-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition disabled:opacity-50"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? "Criando e assinando..." : "Criar e Assinar Laudo"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}