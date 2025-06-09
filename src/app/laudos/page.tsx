"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import api from '@/lib/axiosConfig';
import { useAuth } from '@/app/providers/AuthProvider';
import { IVitima } from '@/types/Vitima';
import { ILaudo } from '@/types/Laudo';
import { Case } from '@/types/Case';
import { Evidence } from '@/types/Evidence';
import { AxiosError } from 'axios';
import { motion } from 'framer-motion';

interface FormData {
  vitimaId: string;
  casoId: string;
  dadosAntemortem: string;
  dadosPostmortem: string;
}

export default function GerarLaudoPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

  const [vitimas, setVitimas] = useState<IVitima[]>([]);
  const [casos, setCasos] = useState<Case[]>([]);
  const [evidencias, setEvidencias] = useState<Evidence[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    vitimaId: "",
    casoId: "",
    dadosAntemortem: "",
    dadosPostmortem: "",
  });

  // Validate form
  const isFormValid =
    formData.vitimaId &&
    formData.casoId &&
    formData.dadosAntemortem &&
    formData.dadosPostmortem &&
    evidencias.length > 0;

  // Fetch victims on mount
  useEffect(() => {
    if (user && !authLoading) {
      const fetchVictims = async () => {
        setIsLoading(true);
        try {
          const response = await api.get<{ data: IVitima[] }>("/api/vitima", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          });
          setVitimas(response.data.data || []);
          setError("");
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

  // Fetch cases and evidences when vitimaId changes
  useEffect(() => {
    if (formData.vitimaId) {
      const fetchCasesAndEvidences = async () => {
        setIsLoading(true);
        try {
          // Fetch cases
          const caseResponse = await api.get<{ data: Case[] }>("/api/case", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            params: { vitima: formData.vitimaId },
          });
          const fetchedCases = caseResponse.data.data || [];
          setCasos(fetchedCases);

          // Fetch evidences
          const evidenceResponse = await api.get<{ data: Evidence[] }>("/api/evidence", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            params: { vitima: formData.vitimaId },
          });
          const fetchedEvidences = evidenceResponse.data.data || [];
          setEvidencias(fetchedEvidences);

          // Set error if no cases or evidences are found
          if (fetchedCases.length === 0) {
            setError("Nenhum caso encontrado para a vítima selecionada.");
          } else if (fetchedEvidences.length === 0) {
            setError("Nenhuma evidência encontrada para a vítima selecionada.");
          } else {
            setError("");
          }
        } catch (err: unknown) {
          const axiosError = err as AxiosError<{ msg?: string }>;
          setError(axiosError.response?.data?.msg || "Erro ao buscar casos ou evidências.");
          setCasos([]);
          setEvidencias([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCasesAndEvidences();
    } else {
      setCasos([]);
      setEvidencias([]);
      setFormData((prev) => ({ ...prev, casoId: "" }));
    }
  }, [formData.vitimaId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const downloadPDF = (pdfBase64: string, laudoId: string) => {
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
      link.download = `laudo-${laudoId}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Erro ao baixar o PDF.");
      console.error("Erro ao baixar PDF:", err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Preencha todos os campos obrigatórios e verifique se há um caso e evidências associados à vítima.");
      return;
    }

    setIsLoading(true);
    try {
      const laudoData = {
        vitima: formData.vitimaId,
        perito: user?.id,
        dadosAntemortem: formData.dadosAntemortem,
        dadosPostmortem: formData.dadosPostmortem,
        caso: formData.casoId,
        evidencias: evidencias.map((ev) => ev._id),
      };

      console.log("Enviando laudoData:", laudoData);

      const createResponse = await api.post<{ msg: string; laudo: ILaudo; pdf: string }>(
        "/api/laudo",
        laudoData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );
      const { laudo: createdLaudo, pdf: signedPdf } = createResponse.data;

      if (createdLaudo._id) {
        downloadPDF(signedPdf, createdLaudo._id);
      } else {
        setError("Erro: ID do laudo não encontrado.");
      }

      setSuccess("Laudo criado, assinado e PDF baixado com sucesso.");
      setError("");
      setFormData({
        vitimaId: "",
        casoId: "",
        dadosAntemortem: "",
        dadosPostmortem: "",
      });
      setCasos([]);
      setEvidencias([]);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      const errorMsg = axiosError.response?.data?.msg || "Erro ao criar ou assinar o laudo.";
      setError(errorMsg);
      console.error("Erro ao processar laudo:", axiosError.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  if (authError)
    return <div className="text-center mt-20 text-red-500">Erro de autenticação: {authError}</div>;
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
          <label htmlFor="vitimaId" className="block text-sm font-medium text-gray-700 mb-1">
            Vítima *
          </label>
          <select
            name="vitimaId"
            id="vitimaId"
            value={formData.vitimaId}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
            disabled={isLoading}
            required
          >
            <option value="">Selecione uma vítima</option>
            {vitimas.map((vitima) => (
              <option key={vitima._id} value={vitima._id}>
                {vitima.nome || "Não identificada"} ({vitima.sexo || "Indeterminado"}, {vitima.estadoCorpo || "N/A"})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="casoId" className="block text-sm font-medium text-gray-700 mb-1">
            Caso *
          </label>
          <select
            name="casoId"
            id="casoId"
            value={formData.casoId}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
            disabled={isLoading || casos.length === 0}
            required
          >
            <option value="">Selecione um caso</option>
            {casos.map((caso) => (
              <option key={caso._id} value={caso._id}>
                {caso.titulo || "Caso sem título"} ({caso.casoReferencia || "N/A"})
              </option>
            ))}
          </select>
          {formData.vitimaId && casos.length === 0 && (
            <p className="text-red-500 text-sm mt-1">Nenhum caso associado à vítima selecionada.</p>
          )}
        </div>

        {formData.vitimaId && evidencias.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold text-gray-700 mb-2">Evidências Associadas:</h4>
            <ul className="list-disc pl-5 text-gray-600">
              {evidencias.map((evidencia) => (
                <li key={evidencia._id}>
                  {evidencia.categoria} ({evidencia.tipo},{' '}
                  {evidencia.tipo === 'texto' ? evidencia.texto || 'N/A' : evidencia.imagem ? 'Imagem' : 'N/A'})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dados Antemortem *</label>
          <textarea
            name="dadosAntemortem"
            value={formData.dadosAntemortem}
            onChange={handleChange}
            placeholder="Descreva os dados antemortem (ex: registros odontológicos, características físicas)"
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
            rows={4}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dados Postmortem *</label>
          <textarea
            name="dadosPostmortem"
            value={formData.dadosPostmortem}
            onChange={handleChange}
            placeholder="Descreva os dados postmortem (ex: estado da arcada dentária, lesões observadas)"
            className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
            rows={4}
            disabled={isLoading}
            required
          />
        </div>

        <div className="text-sm text-gray-600 italic">
          A análise de lesões e a conclusão serão geradas automaticamente pela inteligência artificial.
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