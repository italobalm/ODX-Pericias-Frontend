"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

interface Relatorio {
  id: string;
  titulo: string;
  descricao: string;
  objetoPericia: string;
  analiseTecnica: string;
  metodoUtilizado: string;
  destinatario: string;
  materiaisUtilizados: string;
  examesRealizados: string;
  consideracoesTecnicoPericias: string;
  conclusaoTecnica: string;
  evidencias: string;
  criadoEm: string;
  assinadoDigitalmente: boolean;
}

export default function RelatoriosPage() {
  const [aba, setAba] = useState<"registrados" | "novo">("registrados");
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string>("");
  const [formData, setFormData] = useState<Omit<Relatorio, "id" | "criadoEm">>({
    titulo: "",
    descricao: "",
    objetoPericia: "",
    analiseTecnica: "",
    metodoUtilizado: "",
    destinatario: "",
    materiaisUtilizados: "",
    examesRealizados: "",
    consideracoesTecnicoPericias: "",
    conclusaoTecnica: "",
    evidencias: "",
    assinadoDigitalmente: false,
  });
  const [mensagem, setMensagem] = useState<string>("");

  useEffect(() => {
    const buscarRelatorios = async () => {
      try {
        const response = await axios.get("/api/relatorios");
        setRelatorios(response.data);
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
      }
    };
    buscarRelatorios();
  }, []);

  const gerarPDF = async () => {
    try {
      const response = await axios.post("/api/relatorios/pdf", { relatorioId: relatorioSelecionado }, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio.pdf";
      a.click();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  const relatorio = relatorios.find((r) => r.id === relatorioSelecionado);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/relatorios", formData);
      setMensagem("Relatório criado com sucesso!");
      setFormData({
        titulo: "",
        descricao: "",
        objetoPericia: "",
        analiseTecnica: "",
        metodoUtilizado: "",
        destinatario: "",
        materiaisUtilizados: "",
        examesRealizados: "",
        consideracoesTecnicoPericias: "",
        conclusaoTecnica: "",
        evidencias: "",
        assinadoDigitalmente: false,
      });
    } catch (error) {
      setMensagem("Erro ao criar relatório.");
      console.error(error);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Relatórios</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setAba("registrados")}
          className={`px-4 py-2 rounded ${aba === "registrados" ? "bg-teal-500 text-white" : "bg-gray-100"}`}
        >
          Relatórios Registrados
        </button>
        <button
          onClick={() => setAba("novo")}
          className={`px-4 py-2 rounded ${aba === "novo" ? "bg-teal-500 text-white" : "bg-gray-100"}`}
        >
          Elaborar Relatório
        </button>
      </div>

      {aba === "registrados" && (
        <div className="space-y-4">
          {relatorios.map((r) => (
            <div key={r.id} className="border p-4 rounded bg-white shadow flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{r.titulo}</p>
                <p className="text-sm text-gray-500">Criado em: {r.criadoEm}</p>
              </div>
              <button
                onClick={() => setRelatorioSelecionado(r.id)}
                className="text-teal-600 hover:underline text-sm"
              >
                Visualizar
              </button>
            </div>
          ))}
        </div>
      )}

      {aba === "novo" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mensagem && <p className="text-sm text-teal-600 font-medium">{mensagem}</p>}
          {Object.keys(formData).map((key) => (
            key === "assinadoDigitalmente" ? (
              <label key={key} className="block">
                <input
                  type="checkbox"
                  name="assinadoDigitalmente"
                  checked={formData.assinadoDigitalmente}
                  onChange={handleChange}
                  className="mr-2"
                />
                Assinar digitalmente
              </label>
            ) : (
              <textarea
                key={key}
                name={key}
                placeholder={key.replace(/([A-Z])/g, " $1")}
                value={(formData as any)[key]}
                onChange={handleChange}
                className="w-full border rounded p-2 text-sm"
                rows={3}
              />
            )
          ))}
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
            Salvar Relatório
          </button>
        </form>
      )}

      {relatorio && (
        <div className="mt-6">
          <button
            onClick={gerarPDF}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Baixar Relatório
          </button>

          <div id="relatorioFinal" className="p-6 bg-white text-black w-full max-w-[800px] mx-auto mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <Image src="/logo.png" alt="Logo" width={120} height={60} />
              <div className="text-sm text-right text-gray-600 mt-4 sm:mt-0">
                <p>Responsável: Dr. Fulano de Tal</p>
                <p>Órgão: Instituto de Medicina Legal</p>
                <p>CRO: 12345-ES</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-6">
              Relatório de Perícia Odontológica Forense
            </h2>

            <p className="mb-2"><strong>Título:</strong> {relatorio.titulo}</p>
            <p className="mb-2"><strong>Descrição:</strong> {relatorio.descricao}</p>
            <p className="mb-2"><strong>Data de criação:</strong> {relatorio.criadoEm}</p>

            <div className="mt-4">
              <h3 className="font-semibold">Objeto da Perícia</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.objetoPericia}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Análise Técnica</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.analiseTecnica}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Método Utilizado</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.metodoUtilizado}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Destinatário</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.destinatario}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Materiais Utilizados</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.materiaisUtilizados}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Exames Realizados</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.examesRealizados}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Considerações Técnico-Periciais</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.consideracoesTecnicoPericias}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Conclusão Técnica</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.conclusaoTecnica}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Evidências</h3>
              <p className="text-justify whitespace-pre-line text-sm">{relatorio.evidencias}</p>
            </div>

            <div className="mt-6 text-sm text-gray-700">
              {relatorio.assinadoDigitalmente ? (
                <p>Documento assinado digitalmente por perito responsável.</p>
              ) : (
                <p><em>Documento ainda não assinado digitalmente.</em></p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
