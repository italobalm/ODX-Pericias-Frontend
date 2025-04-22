"use client";

import api from "@/lib/axiosConfig";
import { useEffect, useState, FormEvent } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { isAxiosError } from "axios";

export default function ReportRegisterPage() {
  const [caso, setCaso] = useState("");
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
  const [formData] = useState<Record<string, string>>({});
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [reportId, setReportId] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [casosDisponiveis, setCasosDisponiveis] = useState<{ _id: string; titulo: string }[]>([]);

  const isFormValid =
    caso &&
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

    useEffect(() => {
      async function fetchCasos() {
        try {
          const response = await api.get("/api/case");
          setCasosDisponiveis(response.data);
        } catch (error) {
          console.error("Erro ao buscar casos:", error);
        }
      }
      fetchCasos();
    }, []);


    useEffect(() => {
      async function buscarEvidencias() {
        if (!formData.caso) return;
        try {
          const response = await api.get(`/api/report/${formData.caso}/evidences`);
          const evidenciasIds = response.data.map((ev: { _id: string }) => ev._id);
          setEvidencias(evidenciasIds);
        } catch (error) {
          console.error("Erro ao buscar evidências do caso:", error);
        }
      }
      buscarEvidencias();
    }, [formData.caso]);
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        titulo,
        descricao,
        objetoPericia,
        analiseTecnica,
        metodoUtilizado,
        destinatario,
        materiaisUtilizados,
        examesRealizados,
        consideracoesTecnicoPericiais,
        conclusaoTecnica,
        casoReferencia: caso,
        evidencias,
        ...formData,
      };

      const response = await api.post("/api/report", payload);
      const { report, pdf } = response.data;

      setReportId(report._id);

      const blob = new Blob([pdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
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

      const blob = new Blob([pdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
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

  return (
    <div className="p-6">
      <button
        onClick={() => window.history.back()}
        className="text-sm text-blue-600 flex items-center mb-4"
      >
        <FaArrowLeft className="mr-2" />
        Voltar
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Relatório de Perícia</h2>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Básicas</h3>

          <select
            value={caso}
            onChange={(e) => setCaso(e.target.value)}
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
          className={`btn w-full p-2 rounded ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white"}`}
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
          />
          {!signed ? (
            <button
              onClick={handleSign}
              className="btn bg-green-600 text-white p-2 rounded"
            >
              Assinar Digitalmente
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}