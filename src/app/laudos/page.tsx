"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import api from "@/lib/axiosConfig";
import { useAuth } from "@/app/providers/AuthProvider";
import { Evidence } from "@/types/Evidence";
import { IVitima } from "@/types/Vitima";
import { ILaudo } from "@/types/Laudo";
import { AxiosError } from "axios";
import { motion } from "framer-motion";


export default function GerarLaudoPage() {
  const router = useRouter();
  const { evidenceId } = useParams() as { evidenceId: string };
  const { user, loading: authLoading, error: authError } = useAuth();

  const [evidence, setEvidence] = useState<(Evidence & { vitima?: IVitima }) | null>(null);
  const [laudoDetails, setLaudoDetails] = useState<ILaudo | null>(null);
  const [vitimas, setVitimas] = useState<IVitima[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Estados do formulário do laudo
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
        const fetchEvidenceAndVictims = async () => {
          setIsLoading(true);
          try {
            // Buscar evidência
            const evidenceResponse = await api.get(`/api/evidence/${evidenceId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
              params: { populate: "vitima" },
            });
            setEvidence(evidenceResponse.data);
    
            // Buscar vítimas associadas ao caso
            const caseId = evidenceResponse.data.caso;
            if (caseId) {
              try {
                const vitimasResponse = await api.get<{ data: IVitima[] }>(`/api/vitima?caso=${caseId}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                });
                setVitimas(vitimasResponse.data.data || []);
              } catch (vitimaErr: unknown) {
                const axiosError = vitimaErr as AxiosError<{ msg?: string }>;
                setError(axiosError.response?.data?.msg || "Erro ao buscar vítimas associadas.");
                setVitimas([]);
              }
            } else {
              setVitimas([]);
            }
    
            setError("");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err: unknown) {
            setError("Evidência não encontrada. Você pode criar o laudo sem evidência associada.");
            setEvidence(null);
          } finally {
            setIsLoading(false);
          }
        };
    
        const fetchLaudo = async () => {
          try {
            const response = await api.get(`/api/laudo?evidencia=${evidenceId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });
    
            if (response.data.laudos && response.data.laudos.length > 0) {
              const existingLaudo = response.data.laudos[0];
              setLaudoDetails(existingLaudo);
              setFormData({
                vitimaId: existingLaudo.vitima?._id || "",
                dadosAntemortem: existingLaudo.dadosAntemortem || "",
                dadosPostmortem: existingLaudo.dadosPostmortem || "",
                analiseLesoes: existingLaudo.analiseLesoes || "",
                conclusao: existingLaudo.conclusao || "",
              });
            } else {
              setLaudoDetails(null);
            }
          } catch (err: unknown) {
            const axiosError = err as AxiosError<{ msg?: string }>;
            setError(axiosError.response?.data?.msg || "Erro ao buscar dados do laudo.");
          }
        };
    
        if (evidenceId) {
          fetchEvidenceAndVictims();
          fetchLaudo();
        } else {
          setIsLoading(false);
        }
      }
    }, [user, authLoading, evidenceId]);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Preencha todos os campos obrigatórios, incluindo a vítima.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const laudoData = {
        evidencia: evidenceId || undefined,
        vitima: formData.vitimaId,
        perito: user?._id,
        dadosAntemortem: formData.dadosAntemortem,
        dadosPostmortem: formData.dadosPostmortem,
        analiseLesoes: formData.analiseLesoes,
        conclusao: formData.conclusao,
      };

      let response;
      if (laudoDetails) {
        response = await api.put(`/api/laudo/${laudoDetails._id}`, laudoData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await api.post("/api/laudo", laudoData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setSuccess(laudoDetails ? "Laudo atualizado com sucesso." : "Laudo criado com sucesso.");
      setLaudoDetails(response.data.laudo);
      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(
        axiosError.response?.data?.msg || `Erro ao ${laudoDetails ? "atualizar" : "criar"} o laudo.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (!laudoDetails?._id) {
      setError("Nenhum laudo encontrado para assinar.");
      return;
    }

    setIsSigning(true);
    try {
      const response = await api.post(`/api/laudo/sign/${laudoDetails._id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      setLaudoDetails(response.data.laudo);
      setSuccess("Laudo assinado digitalmente com sucesso.");
      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao assinar o laudo.");
    } finally {
      setIsSigning(false);
    }
  };

  const downloadPDF = async () => {
    if (!laudoDetails?._id) {
      setError("Nenhum laudo encontrado para gerar o PDF.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/api/laudo/generate/pdf/${laudoDetails._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      const { pdf: pdfBase64 } = response.data;

      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a") as HTMLAnchorElement;
      link.href = url;
      link.download = `laudo-${evidence?.caso || "laudo"}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao gerar o PDF do laudo.");
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gerar Laudo</h1>
        </div>
    
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6 space-y-6"
        >
          {error && <p className="text-red-500">{error}</p>}
          {success && (
            <div className="space-y-4">
              <p className="text-green-500">{success}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={downloadPDF}
                  className="w-full sm:w-auto bg-teal-500 text-white p-3 rounded-md hover:bg-teal-700 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Gerando PDF..." : "Baixar PDF do Laudo"}
                </button>
                {laudoDetails && !laudoDetails.assinaturaDigital && (
                  <button
                    onClick={handleSign}
                    className="w-full sm:w-auto bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition disabled:opacity-50"
                    disabled={isSigning}
                  >
                    {isSigning ? "Assinando..." : "Assinar Digitalmente"}
                  </button>
                )}
                {laudoDetails?.assinaturaDigital && (
                  <p className="text-green-500">Laudo já assinado digitalmente.</p>
                )}
              </div>
            </div>
          )}
    
          {/* Formulário do Laudo */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700 mt-6">Dados do Laudo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vítima Associada *</label>
                <select
                  name="vitimaId"
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
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dados Antemortem *</label>
                <textarea
                  name="dadosAntemortem"
                  value={formData.dadosAntemortem}
                  onChange={handleChange}
                  placeholder="Descreva os dados antemortem (ex: registros odontológicos, características físicas)"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dados Postmortem *</label>
                <textarea
                  name="dadosPostmortem"
                  value={formData.dadosPostmortem}
                  onChange={handleChange}
                  placeholder="Descreva os dados postmortem (ex: estado da arcada dentária, lesões observadas)"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Análise de Lesões *</label>
                <textarea
                  name="analiseLesoes"
                  value={formData.analiseLesoes}
                  onChange={handleChange}
                  placeholder="Descreva a análise das lesões (ex: fraturas, marcas de trauma)"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Conclusão *</label>
                <textarea
                  name="conclusao"
                  value={formData.conclusao}
                  onChange={handleChange}
                  placeholder="Descreva a conclusão do laudo (ex: identificação confirmada ou não)"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
            </div>
    
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition disabled:opacity-50"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Carregando..." : laudoDetails ? "Atualizar Laudo" : "Criar Laudo"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
}