// Remover estados e inputs de analiseTecnica e conclusaoTecnica
"use client";

import api from "@/lib/axiosConfig";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { isAxiosError } from "axios";
import { Evidence } from "@/types/Evidence";
import { IVitima } from "@/types/Vitima";
import { ILaudo } from "@/types/Laudo";
import { CaseListResponse, Case } from "@/types/Case";
import { ReportResponse } from "@/types/Report";
import { motion } from "framer-motion";

export default function ReportRegisterPage() {
  const router = useRouter();
  const [casoReferencia, setCasoReferencia] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [objetoPericia, setObjetoPericia] = useState("");
  const [metodoUtilizado, setMetodoUtilizado] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [materiaisUtilizados, setMateriaisUtilizados] = useState("");
  const [examesRealizados, setExamesRealizados] = useState("");
  const [consideracoesTecnicoPericiais, setConsideracoesTecnicoPericiais] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [evidencias, setEvidencias] = useState<Evidence[]>([]);
  const [vitimas, setVitimas] = useState<IVitima[]>([]);
  const [laudos, setLaudos] = useState<ILaudo[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [reportId, setReportId] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [casosDisponiveis, setCasosDisponiveis] = useState<Case[]>([]);

  const isFormValid =
    casoReferencia &&
    titulo &&
    descricao &&
    objetoPericia &&
    metodoUtilizado &&
    destinatario &&
    materiaisUtilizados &&
    examesRealizados &&
    consideracoesTecnicoPericiais;

  // Buscar casos disponíveis
  useEffect(() => {
    async function fetchCasos() {
      try {
        const response = await api.get<CaseListResponse>("/api/case");
        setCasosDisponiveis(response.data.casos);
      } catch (error) {
        setError("Erro ao buscar casos.");
        console.error("Erro ao buscar casos:", error);
      }
    }
    fetchCasos();
  }, []);

  // Buscar evidências, vítimas e laudos quando um caso é selecionado
  useEffect(() => {
    async function fetchCaseData() {
      if (!casoReferencia) {
        setEvidencias([]);
        setVitimas([]);
        setLaudos([]);
        return;
      }
      try {
        const evidenciasResponse = await api.get<{ evidencias: Evidence[] }>(
          `/api/evidence?caso=${casoReferencia}&populate=vitima`
        );
        const fetchedEvidencias = evidenciasResponse.data.evidencias || [];
        setEvidencias(fetchedEvidencias);

        const vitimaIds = Array.from(new Set(fetchedEvidencias.map((e) => e.vitima)));
        const vitimasResponse = await api.get<{ vitimas: IVitima[] }>(
          `/api/vitima?ids=${vitimaIds.join(",")}`
        );
        setVitimas(vitimasResponse.data.vitimas || []);

        const evidenciaIds = fetchedEvidencias.map((e) => e._id);
        const laudosResponse = await api.get<{ laudos: ILaudo[] }>(
          `/api/laudo?evidencias=${evidenciaIds.join(",")}`
        );
        setLaudos(laudosResponse.data.laudos || []);
      } catch (error) {
        setError("Erro ao buscar dados do caso (evidências, vítimas ou laudos).");
        console.error("Erro ao buscar dados do caso:", error);
      }
    }
    fetchCaseData();
  }, [casoReferencia]);

  const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (!file.type.startsWith("audio/")) {
        setError("Por favor, selecione um arquivo de áudio válido (MP3, WAV, etc.).");
        setAudioFile(null);
        return;
      }
      setAudioFile(file);
      setError("");
    } else {
      setAudioFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isFormValid) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      console.log("Form is invalid:", {
        casoReferencia,
        titulo,
        descricao,
        objetoPericia,
        metodoUtilizado,
        destinatario,
        materiaisUtilizados,
        examesRealizados,
        consideracoesTecnicoPericiais,
      });
      return;
    }
  
    console.log("Submitting form with casoReferencia:", casoReferencia);
  
    try {
      const formData = new FormData();
      formData.append("titulo", casoReferencia.trim());
      formData.append("descripcion", descricao.trim());
      formData.append("objetoPericia", objetoPericia.trim());
      formData.append("metodoUtilizado", metodoUtilizado.trim());
      formData.append("destinatario", destinatario.trim());
      formData.append("materiaisUtilizados", materiaisUtilizados.trim());
      formData.append("examesRealizados", examesRealizados.trim());
      formData.append("consideracoesTecnicoPericiais", consideracoesTecnicoPericiais.trim());
      formData.append("casoReferencia", casoReferencia.trim());
      if (audioFile) {
        formData.append("audio", audioFile);
      }
  
      // Logar o conteúdo do FormData
      for (const [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }
  
      const response = await api.post<ReportResponse>("/api/report", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      const { report, pdf } = response.data;
  
      if (report) {
        setReportId(report._id);
      }
  
      if (!pdf || typeof pdf !== "string") {
        setError("Erro: O PDF retornado pelo servidor é inválido ou não foi fornecido.");
        return;
      }
  
      const byteCharacters = atob(pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
  
      console.log("PDF URL:", url);
      setPdfUrl(url);
      setSubmitted(true);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.msg || "Erro ao gerar o relatório.");
        console.error("Axios error:", err.response?.data);
      } else {
        setError("Erro ao gerar o relatório.");
        console.error("Unknown error:", err);
      }
    }
  };
  
  const handleSign = async () => {
    if (!reportId) {
      setError("Nenhum relatório gerado para assinar.");
      return;
    }
    try {
      const response = await api.post<ReportResponse>(`/api/report/sign/${reportId}`);
      const { pdf } = response.data;

      if (!pdf || typeof pdf !== "string") {
        setError("Erro: O PDF assinado retornado pelo servidor é inválido ou não foi fornecido.");
        return;
      }

      const byteCharacters = atob(pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      console.log("PDF Assinado URL:", url);
      setPdfUrl(url);
      setSigned(true);
      setError("");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.msg || "Erro ao assinar o relatório.");
      } else {
        setError("Erro ao assinar o relatório.");
      }
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = signed ? "report_signed.pdf" : "report.pdf";
    link.click();
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Relatórios</h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-500 p-4 rounded-xl mb-6">{error}</div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-md mb-10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Relatório de Perícia</h2>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Informações Básicas</h3>

            <select
              value={casoReferencia}
              onChange={(e) => setCasoReferencia(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
              required
            >
              <option value="">Selecione um Caso</option>
              {casosDisponiveis.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.titulo}
                </option>
              ))}
            </select>

            {evidencias.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2">Evidências Associadas:</h4>
                <ul className="list-disc pl-5 text-gray-600">
                  {evidencias.map((ev) => (
                    <li key={ev._id}>
                      {ev.categoria} ({ev.tipo})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vitimas.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2">Vítimas Associadas:</h4>
                <ul className="list-disc pl-5 text-gray-600">
                  {vitimas.map((v) => (
                    <li key={v._id}>
                      {v.nome || "Não identificada"} - {v.sexo}, {v.estadoCorpo}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {laudos.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-2">Laudos Associados:</h4>
                <ul className="list-disc pl-5 text-gray-600">
                  {laudos.map((l) => (
                    <li key={l._id}>
                      Laudo para Vítima: {typeof l.vitima === "object" && l.vitima?.nome ? l.vitima.nome : "Não identificada"} - Criado em: {new Date(l.dataCriacao).toLocaleDateString("pt-BR")}
                      {l.assinaturaDigital && <span className="text-green-500 ml-2">(Assinado)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <input
              type="text"
              placeholder="Título *"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500"
              required
            />

            <textarea
              placeholder="Descrição *"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500"
              required
            />

            <textarea
              placeholder="Objeto da Perícia *"
              value={objetoPericia}
              onChange={(e) => setObjetoPericia(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Análise Técnica
              </label>
              <p className="text-gray-500 italic">
                Este campo será preenchido automaticamente pela inteligência artificial com base nas informações do caso.
              </p>
            </div>

            <textarea
              placeholder="Método Utilizado *"
              value={metodoUtilizado}
              onChange={(e) => setMetodoUtilizado(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500"
              required
            />

            <textarea
              placeholder="Destinatário *"
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500"
              required
            />

            <textarea
              placeholder="Materiais Utilizados *"
              value={materiaisUtilizados}
              onChange={(e) => setMateriaisUtilizados(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500"
              required
            />

            <textarea
              placeholder="Exames Realizados *"
              value={examesRealizados}
              onChange={(e) => setExamesRealizados(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500"
              required
            />

            <textarea
              placeholder="Considerações Técnico-Periciais *"
              value={consideracoesTecnicoPericiais}
              onChange={(e) => setConsideracoesTecnicoPericiais(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conclusão Técnica
              </label>
              <p className="text-gray-500 italic">
                Este campo será preenchido automaticamente pela inteligência artificial com base nas informações do caso.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observação em Áudio (opcional)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="w-full p-3 border border-gray-300 rounded-xl text-gray-800"
              />
              {audioFile && (
                <p className="mt-2 text-gray-600">Arquivo selecionado: {audioFile.name}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full p-3 rounded-xl text-white transition ${
              isFormValid
                ? "bg-teal-600 hover:bg-teal-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Gerar Relatório
          </button>
        </form>
      </motion.div>

      {submitted && pdfUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 space-y-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Relatório Gerado</h3>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            className="border border-gray-200 rounded-xl shadow-md"
            title="Visualização do Relatório"
          />
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <button
              onClick={handleDownload}
              className="bg-teal-600 text-white p-3 rounded-xl hover:bg-teal-700 transition"
            >
              Baixar PDF
            </button>
            {!signed ? (
              <button
                onClick={handleSign}
                className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition"
              >
                Assinar Digitalmente
              </button>
            ) : (
              <p className="text-green-500">Relatório assinado digitalmente.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}