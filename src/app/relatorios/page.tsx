"use client";

import api from "@/lib/axiosConfig";
import { useRouter } from "next/navigation";

import { useEffect, useState, FormEvent } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { isAxiosError } from "axios";
import { Evidence } from "@/types/Evidence";

export default function ReportRegisterPage() {
  const router = useRouter();
  const [casoReferencia, setCasoReferencia] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [objetoPericia, setObjetoPericia] = useState("");
  const [analiseTecnica, setAnaliseTecnica] = useState("");
  const [metodoUtilizado, setMetodoUtilizado] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [materiaisUtilizados, setMateriaisUtilizados] = useState("");
  const [examesRealizados, setExamesRealizados] = useState("");
  const [consideracoesTecnicoPericiais, setConsideracoesTecnicoPericiais] = useState("");
  const [conclusaoTecnica, setConclusaoTecnica] = useState("");
  const [evidencias, setEvidencias] = useState<Evidence[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [reportId, setReportId] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [casosDisponiveis, setCasosDisponiveis] = useState<{ _id: string; titulo: string }[]>([]);

  const isFormValid =
    casoReferencia &&
    titulo &&
    descricao &&
    objetoPericia &&
    analiseTecnica &&
    metodoUtilizado &&
    destinatario &&
    materiaisUtilizados &&
    examesRealizados &&
    consideracoesTecnicoPericiais &&
    conclusaoTecnica;

  // Buscar casos disponíveis
  useEffect(() => {
    async function fetchCasos() {
      try {
        const response = await api.get("/api/cases");
        setCasosDisponiveis(response.data.casos);
      } catch (error) {
        setError("Erro ao buscar casos.");
        console.error("Erro ao buscar casos:", error);
      }
    }
    fetchCasos();
  }, []);

  // Buscar evidências quando um caso é selecionado
  useEffect(() => {
    async function buscarEvidencias() {
      if (!casoReferencia) {
        setEvidencias([]);
        return;
      }
      try {
        const response = await api.get(`/api/cases/${casoReferencia}/evidences`);
        setEvidencias(response.data.evidencias);
      } catch (error) {
        setError("Erro ao buscar evidências do caso.");
        console.error("Erro ao buscar evidências:", error);
      }
    }
    buscarEvidencias();
  }, [casoReferencia]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const trimmedPayload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        objetoPericia: objetoPericia.trim(),
        analiseTecnica: analiseTecnica.trim(),
        metodoUtilizado: metodoUtilizado.trim(),
        destinatario: destinatario.trim(),
        materiaisUtilizados: materiaisUtilizados.trim(),
        examesRealizados: examesRealizados.trim(),
        consideracoesTecnicoPericiais: consideracoesTecnicoPericiais.trim(),
        conclusaoTecnica: conclusaoTecnica.trim(),
        casoReferencia: casoReferencia.trim(),
      };

      if (Object.values(trimmedPayload).some((value) => !value)) {
        setError("Todos os campos devem ser preenchidos.");
        return;
      }

      const response = await api.post("/api/report", trimmedPayload);
      const { report, pdf } = response.data;

      setReportId(report._id);

      // Converter base64 para Blob
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
      } else {
        setError("Erro ao gerar o relatório.");
      }
      console.error(err);
    }
  };

  const handleSign = async () => {
    if (!reportId) {
      setError("Nenhum relatório gerado para assinar.");
      return;
    }
    try {
      const response = await api.post(`/api/report/sign/${reportId}`);
      const { pdf } = response.data;

      // Converter base64 para Blob
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
      {/* Cabeçalho com seta de voltar e título */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-900 transition"
          title="Voltar"
        >
          <FaArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Relatórios
        </h1>
      </div>

      {/* Bloco de erro */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Relatório de Perícia</h2>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Básicas</h3>

          <select
            value={casoReferencia}
            onChange={(e) => setCasoReferencia(e.target.value)}
            className="select w-full p-2 border rounded"
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
            <div className="bg-gray-100 p-4 rounded">
              <h4 className="font-semibold">Evidências Associadas:</h4>
              <ul className="list-disc pl-5">
                {evidencias.map((ev) => (
                  <li key={ev._id}>
                    {ev.categoria} ({ev.tipo})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="input w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Objeto da Perícia"
            value={objetoPericia}
            onChange={(e) => setObjetoPericia(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Análise Técnica"
            value={analiseTecnica}
            onChange={(e) => setAnaliseTecnica(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Método Utilizado"
            value={metodoUtilizado}
            onChange={(e) => setMetodoUtilizado(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Destinatário"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Materiais Utilizados"
            value={materiaisUtilizados}
            onChange={(e) => setMateriaisUtilizados(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Exames Realizados"
            value={examesRealizados}
            onChange={(e) => setExamesRealizados(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Considerações Técnico-Periciais"
            value={consideracoesTecnicoPericiais}
            onChange={(e) => setConsideracoesTecnicoPericiais(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />

          <textarea
            placeholder="Conclusão Técnica"
            value={conclusaoTecnica}
            onChange={(e) => setConclusaoTecnica(e.target.value)}
            className="textarea w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`btn w-full p-2 rounded ${
            !isFormValid ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white"
          }`}
        >
          Gerar Relatório
        </button>
      </form>

      {submitted && pdfUrl && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Relatório Gerado</h3>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            className="border rounded"
            title="Visualização do Relatório"
          />
          <div className="flex space-x-4">
            <button
              onClick={handleDownload}
              className="btn bg-blue-600 text-white p-2 rounded"
            >
              Baixar PDF
            </button>
            {!signed ? (
              <button
                onClick={handleSign}
                className="btn bg-green-600 text-white p-2 rounded"
              >
                Assinar Digitalmente
              </button>
            ) : (
              <p className="text-green-600">Relatório assinado digitalmente.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}