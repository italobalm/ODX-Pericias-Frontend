"use client";

import api from "@/lib/axiosConfig";
import { useState, FormEvent } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { isAxiosError } from "axios";

export default function ReportRegisterPage() {
  const [step, setStep] = useState(1);
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
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isStep1Valid = caso && titulo && descricao;
  const isStep2Valid = objetoPericia && analiseTecnica && metodoUtilizado && destinatario;

  const handleGoBack = () => step === 1 ? window.history.back() : setStep(step - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("introducao") || name.startsWith("analise") || name.startsWith("conclusao")) {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    } else if (name === "evidencias") {
      setEvidencias(value.split(",").map(id => id.trim()).filter(Boolean));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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

      const response = await api.post("/api/report", payload, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setSubmitted(true);

    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Erro ao gerar o relatório.");
      } else {
        setError("Erro ao gerar o relatório.");
      }
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      {step === 1 && (
        <form onSubmit={() => setStep(2)}>
          <h2 className="text-xl font-bold mb-4">Informações Básicas</h2>
          <input type="text" placeholder="Caso" value={caso} onChange={(e) => setCaso(e.target.value)} className="input" />
          <input type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input" />
          <textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="textarea" />
          <button disabled={!isStep1Valid} className="btn">Próximo</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={() => setStep(3)}>
          <h2 className="text-xl font-bold mb-4">Dados Periciais</h2>
          <textarea placeholder="Objeto da Perícia" value={objetoPericia} onChange={(e) => setObjetoPericia(e.target.value)} className="textarea" />
          <textarea placeholder="Análise Técnica" value={analiseTecnica} onChange={(e) => setAnaliseTecnica(e.target.value)} className="textarea" />
          <input type="text" placeholder="Método Utilizado" value={metodoUtilizado} onChange={(e) => setMetodoUtilizado(e.target.value)} className="input" />
          <input type="text" placeholder="Destinatário" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} className="input" />
          <button disabled={!isStep2Valid} className="btn">Próximo</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4">Detalhes Finais</h2>
          <textarea placeholder="Materiais Utilizados" value={materiaisUtilizados} onChange={(e) => setMateriaisUtilizados(e.target.value)} className="textarea" />
          <textarea placeholder="Exames Realizados" value={examesRealizados} onChange={(e) => setExamesRealizados(e.target.value)} className="textarea" />
          <textarea placeholder="Considerações Técnico-Periciais" value={consideracoesTecnicoPericiais} onChange={(e) => setConsideracoesTecnicoPericiais(e.target.value)} className="textarea" />
          <textarea placeholder="Conclusão Técnica" value={conclusaoTecnica} onChange={(e) => setConclusaoTecnica(e.target.value)} className="textarea" />
          <input type="text" name="introducao_pt" placeholder="Introdução (PT)" onChange={handleChange} className="input" />
          <input type="text" name="analise_en" placeholder="Análise (EN)" onChange={handleChange} className="input" />
          <input type="text" name="conclusao_es" placeholder="Conclusão (ES)" onChange={handleChange} className="input" />
          <input type="text" name="evidencias" placeholder="IDs das Evidências (separados por vírgula)" onChange={handleChange} className="input" />
          <button className="btn">Finalizar e Gerar PDF</button>
        </form>
      )}

      {step > 1 && <button onClick={handleGoBack} className="text-sm text-blue-600 flex items-center mt-4"><FaArrowLeft className="mr-2" />Voltar</button>}

      {submitted && pdfUrl && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Relatório Gerado</h3>
          <iframe src={pdfUrl} width="100%" height="600px" className="border" />
          <a href={pdfUrl} download="relatorio.pdf" className="btn mt-4">Baixar PDF</a>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
