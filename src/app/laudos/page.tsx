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
import Image from "next/image";

export default function GerarLaudoPage() {
  const router = useRouter();
  const { evidenceId } = useParams() as { evidenceId: string };
  const { user, loading: authLoading, error: authError } = useAuth();

  const [evidence, setEvidence] = useState<(Evidence & { vitima?: IVitima }) | null>(null);
  const [laudoDetails, setLaudoDetails] = useState<ILaudo | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Estados do formulário do laudo
  const [formData, setFormData] = useState({
    dadosAntemortem: "",
    dadosPostmortem: "",
    analiseLesoes: "",
    conclusao: "",
    assinaturaDigital: "",
  });

  const isFormValid = formData.dadosAntemortem && formData.dadosPostmortem && formData.analiseLesoes && formData.conclusao;

  useEffect(() => {
    if (user && !authLoading) {
      // Função para buscar detalhes da evidência e vítima
      const fetchEvidence = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/api/evidence/${evidenceId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            params: { populate: "vitima" },
          });
          setEvidence(response.data);
          setError("");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
          setError("Evidência não encontrada. Você pode criar o laudo sem evidência associada.");
          setEvidence(null); // Permitir que a página continue sem evidência
        } finally {
          setIsLoading(false);
        }
      };

      // Função para buscar um laudo existente, se houver
      const fetchLaudo = async () => {
        try {
          const response = await api.get(`/api/laudo?evidencia=${evidenceId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          });

          if (response.data.laudos && response.data.laudos.length > 0) {
            const existingLaudo = response.data.laudos[0];
            setLaudoDetails(existingLaudo);
            setFormData({
              dadosAntemortem: existingLaudo.dadosAntemortem || "",
              dadosPostmortem: existingLaudo.dadosPostmortem || "",
              analiseLesoes: existingLaudo.analiseLesoes || "",
              conclusao: existingLaudo.conclusao || "",
              assinaturaDigital: existingLaudo.assinaturaDigital || "",
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
        fetchEvidence();
        fetchLaudo();
      } else {
        setIsLoading(false); // Permitir carregamento sem evidenceId
      }
    }
  }, [user, authLoading, evidenceId]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
      const token = localStorage.getItem("authToken");

      const laudoData = {
        evidencia: evidenceId || undefined, // Evidencia é opcional
        perito: user?._id,
        dadosAntemortem: formData.dadosAntemortem,
        dadosPostmortem: formData.dadosPostmortem,
        analiseLesoes: formData.analiseLesoes,
        conclusao: formData.conclusao,
        assinaturaDigital: formData.assinaturaDigital || undefined,
      };

      let response;
      if (laudoDetails) {
        // Atualizar laudo existente
        response = await api.put(`/api/laudo/${laudoDetails._id}`, laudoData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Criar novo laudo
        response = await api.post("/api/laudo", laudoData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setSuccess(laudoDetails ? "Laudo atualizado com sucesso." : "Laudo criado com sucesso.");
      setLaudoDetails(response.data.laudo);
      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || `Erro ao ${laudoDetails ? "atualizar" : "criar"} o laudo.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para gerar e baixar o PDF usando o backend
  const downloadPDF = async () => {
    if (!laudoDetails?._id) {
      setError("Nenhum laudo encontrado para gerar o PDF.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/api/laudo/generate-pdf/${laudoDetails._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });

      const { pdf: pdfBase64 } = response.data;

      // Converte o Base64 para um Blob
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      // Cria um link temporário para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `laudo-${evidence?.caso || "laudo"}-${new Date().toISOString().split("T")[0]}.pdf`);
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
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800 transition p-2" title="Voltar">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gerar Laudo</h1>
      </div>

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6 space-y-6">
        {error && <p className="text-red-500">{error}</p>}
        {success && (
          <div className="space-y-4">
            <p className="text-green-500">{success}</p>
            <button
              onClick={downloadPDF}
              className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Gerando PDF..." : "Baixar PDF do Laudo"}
            </button>
          </div>
        )}

        {/* Dados da Evidência */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Dados da Evidência</h2>
          {isLoading ? (
            <p className="text-gray-600">Carregando detalhes da evidência...</p>
          ) : evidence ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caso</label>
                <input
                  type="text"
                  value={evidence.caso || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={evidence.categoria || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coletado por</label>
                <input
                  type="text"
                  value={evidence.coletadoPor || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Upload</label>
                <input
                  type="text"
                  value={evidence.dataUpload ? new Date(evidence.dataUpload).toLocaleDateString("pt-BR") : "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              {evidence.tipo === "texto" && (
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                  <textarea
                    value={evidence.conteudo || "N/A"}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                    rows={4}
                    disabled
                  />
                </div>
              )}
              {evidence.tipo === "imagem" && evidence.vitima?.imagens && evidence.vitima.imagens.length > 0 && !failedImages.has(evidence._id) && (
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                  <Image
                    src={evidence.vitima.imagens[0]}
                    alt="Imagem da Evidência"
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover rounded-md"
                    onError={() => setFailedImages((prev) => new Set(prev).add(evidence._id))}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma evidência associada. Preencha os dados do laudo abaixo.</p>
          )}
        </div>

        {/* Dados da Vítima */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 mt-6">Dados da Vítima</h2>
          {isLoading ? (
            <p className="text-gray-600">Carregando detalhes da vítima...</p>
          ) : evidence?.vitima ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={evidence.vitima.nome || "Não identificada"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input
                  type="text"
                  value={evidence.vitima.dataNascimento || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idade Aproximada</label>
                <input
                  type="text"
                  value={evidence.vitima.idadeAproximada?.toString() || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
                <input
                  type="text"
                  value={evidence.vitima.nacionalidade || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={evidence.vitima.cidade || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <input
                  type="text"
                  value={evidence.vitima.sexo || "Indeterminado"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado do Corpo</label>
                <input
                  type="text"
                  value={evidence.vitima.estadoCorpo || "Inteiro"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesões</label>
                <input
                  type="text"
                  value={evidence.vitima.lesoes || "N/A"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identificada</label>
                <input
                  type="text"
                  value={evidence.vitima.identificada ? "Sim" : "Não"}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                  disabled
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma vítima associada à evidência.</p>
          )}
        </div>

        {/* Formulário do Laudo */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 mt-6">Dados do Laudo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assinatura Digital (Opcional)</label>
              <input
                type="text"
                name="assinaturaDigital"
                value={formData.assinaturaDigital}
                onChange={handleChange}
                placeholder="Insira a assinatura digital, se disponível"
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
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
      </div>
    </div>
  );
}