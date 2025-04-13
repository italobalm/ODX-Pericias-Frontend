"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Caso {
  id: string;
  titulo: string;
  informacoes: string[]; // informações que podem ser incluídas
}

interface Relatorio {
  id: string;
  caso: string;
  criadoEm: string;
}

export default function RelatoriosPage() {
  const [aba, setAba] = useState<"registrados" | "novo">("registrados");
  const [casos, setCasos] = useState<Caso[]>([]);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [casoSelecionado, setCasoSelecionado] = useState<string>("");
  const [formulario, setFormulario] = useState({
    objeto: "",
    analise: "",
    metodo: "",
    destinatario: "",
    materiais: "",
    exames: "",
    consideracoes: "",
    conclusao: "",
    evidencias: "",
  });
  const [infoSelecionadas, setInfoSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    const buscarCasos = async () => {
      const mockCasos = [
        {
          id: "1",
          titulo: "Caso João da Silva",
          informacoes: [
            "Nome da vítima",
            "Data do ocorrido",
            "Descrição dos fatos",
            "Local do ocorrido",
          ],
        },
        {
          id: "2",
          titulo: "Caso Maria Oliveira",
          informacoes: [
            "Nome da vítima",
            "Laudos anteriores",
            "Outras evidências",
          ],
        },
      ];
      setCasos(mockCasos);
    };

    const buscarRelatorios = async () => {
      const mockRelatorios = [
        { id: "r1", caso: "Caso João da Silva", criadoEm: "2024-03-01" },
      ];
      setRelatorios(mockRelatorios);
    };

    buscarCasos();
    buscarRelatorios();
  }, []);

  const handleCheckbox = (item: string) => {
    setInfoSelecionadas((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormulario((prev) => ({ ...prev, [id]: value }));
  };

  const gerarPDF = async () => {
    const input = document.getElementById("relatorioFinal");
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("relatorio.pdf");
  };

  const caso = casos.find((c) => c.id === casoSelecionado);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Relatórios</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAba("registrados")}
          className={`px-4 py-2 rounded ${
            aba === "registrados" ? "bg-teal-500 text-white" : "bg-gray-100"
          }`}
        >
          Relatórios Registrados
        </button>
        <button
          onClick={() => setAba("novo")}
          className={`px-4 py-2 rounded ${
            aba === "novo" ? "bg-teal-500 text-white" : "bg-gray-100"
          }`}
        >
          Elaborar Relatório
        </button>
      </div>

      {aba === "registrados" && (
        <div className="text-gray-700 space-y-4">
          {relatorios.map((r) => (
            <div
              key={r.id}
              className="border p-4 rounded bg-white shadow flex justify-between"
            >
              <div>
                <p className="font-medium">{r.caso}</p>
                <p className="text-sm text-gray-500">Criado em: {r.criadoEm}</p>
              </div>
              <button className="text-teal-600 hover:underline">
                Visualizar
              </button>
            </div>
          ))}
        </div>
      )}

      {aba === "novo" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione um caso
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={casoSelecionado}
              onChange={(e) => setCasoSelecionado(e.target.value)}
            >
              <option value="">-- Selecione --</option>
              {casos.map((caso) => (
                <option key={caso.id} value={caso.id}>
                  {caso.titulo}
                </option>
              ))}
            </select>
          </div>

          {Object.entries(formulario).map(([key, value]) => (
            <div key={key}>
              <label
                htmlFor={key}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {key
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </label>
              <textarea
                id={key}
                value={value}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={3}
              />
            </div>
          ))}

          {caso && (
            <div>
              <h2 className="text-md font-semibold mb-2">
                Incluir informações do caso:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {caso.informacoes.map((info) => (
                  <label key={info} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={infoSelecionadas.includes(info)}
                      onChange={() => handleCheckbox(info)}
                    />
                    <span>{info}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={gerarPDF}
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Baixar Relatório
            </button>
          </div>

          {/* conteúdo invisível para PDF */}
          <div
            id="relatorioFinal"
            className="p-6 bg-white text-black w-[800px]"
          >
            <h2 className="text-2xl font-bold mb-4">
              Relatório de Perícia Odontológica Forense
            </h2>
            <p>
              <strong>Caso:</strong> {caso?.titulo}
            </p>
            {Object.entries(formulario).map(([key, val]) => (
              <p key={key} className="mt-2">
                <strong>
                  {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  :
                </strong>{" "}
                {val}
              </p>
            ))}
            <div className="mt-4">
              <strong>Informações do Caso:</strong>
              <ul className="list-disc list-inside">
                {infoSelecionadas.map((info) => (
                  <li key={info}>{info}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
