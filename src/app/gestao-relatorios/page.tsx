"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jsPDF } from "jspdf";
import { FaArrowLeft, FaEdit, FaTrash, FaDownload } from "react-icons/fa";

interface Report {
  id: string;
  caso: string;
  titulo: string;
  descricao: string;
  objetoPericia: string;
  analiseTecnica: string;
  metodoUtilizado: string;
  destinatario: string;
  materiaisUtilizados: string;
  examesRealizados: string;
  consideracoesTecnicoPericiais: string;
  conclusaoTecnica: string;
  evidencias?: string;
}

export default function ReportManagementPage() {
  const router = useRouter();

  // Estados para dados, loading e erro
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para controle da edição (modal)
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editCaso, setEditCaso] = useState("");
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editObjetoPericia, setEditObjetoPericia] = useState("");
  const [editAnaliseTecnica, setEditAnaliseTecnica] = useState("");
  const [editMetodoUtilizado, setEditMetodoUtilizado] = useState("");
  const [editDestinatario, setEditDestinatario] = useState("");
  const [editMateriaisUtilizados, setEditMateriaisUtilizados] = useState("");
  const [editExamesRealizados, setEditExamesRealizados] = useState("");
  const [
    editConsideracoesTecnicoPericiais,
    setEditConsideracoesTecnicoPericiais,
  ] = useState("");
  const [editConclusaoTecnica, setEditConclusaoTecnica] = useState("");
  const [editEvidencias, setEditEvidencias] = useState("");

  // Busca os relatórios do backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get<Report[]>("/api/reports");
        setReports(response.data);
      } catch (err: any) {
        console.error("Erro ao buscar relatórios:", err);
        setError("Erro ao carregar os relatórios.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Função para excluir um relatório
  const handleDelete = async (id: string) => {
    if (confirm("Você tem certeza que deseja excluir este relatório?")) {
      try {
        await axios.delete(`/api/reports/${id}`);
        setReports((prev) => prev.filter((report) => report.id !== id));
      } catch (err: any) {
        console.error("Erro ao excluir relatório:", err);
        alert("Não foi possível excluir o relatório.");
      }
    }
  };

  // Preenche os campos de edição a partir do relatório selecionado
  const handleEdit = (id: string) => {
    const reportToEdit = reports.find((report) => report.id === id);
    if (reportToEdit) {
      setEditingReport(reportToEdit);
      setEditCaso(reportToEdit.caso);
      setEditTitulo(reportToEdit.titulo);
      setEditDescricao(reportToEdit.descricao);
      setEditObjetoPericia(reportToEdit.objetoPericia);
      setEditAnaliseTecnica(reportToEdit.analiseTecnica);
      setEditMetodoUtilizado(reportToEdit.metodoUtilizado);
      setEditDestinatario(reportToEdit.destinatario);
      setEditMateriaisUtilizados(reportToEdit.materiaisUtilizados);
      setEditExamesRealizados(reportToEdit.examesRealizados);
      setEditConsideracoesTecnicoPericiais(
        reportToEdit.consideracoesTecnicoPericiais
      );
      setEditConclusaoTecnica(reportToEdit.conclusaoTecnica);
      setEditEvidencias(reportToEdit.evidencias || "");
    }
  };

  // Atualiza o relatório editado e envia a alteração para o backend
  const confirmEdit = async () => {
    if (editingReport) {
      const updatedReport: Report = {
        ...editingReport,
        caso: editCaso,
        titulo: editTitulo,
        descricao: editDescricao,
        objetoPericia: editObjetoPericia,
        analiseTecnica: editAnaliseTecnica,
        metodoUtilizado: editMetodoUtilizado,
        destinatario: editDestinatario,
        materiaisUtilizados: editMateriaisUtilizados,
        examesRealizados: editExamesRealizados,
        consideracoesTecnicoPericiais: editConsideracoesTecnicoPericiais,
        conclusaoTecnica: editConclusaoTecnica,
        evidencias: editEvidencias,
      };

      try {
        await axios.put(`/api/reports/${editingReport.id}`, updatedReport);
        setReports((prev) =>
          prev.map((report) =>
            report.id === editingReport.id ? updatedReport : report
          )
        );
        setEditingReport(null);
      } catch (err: any) {
        console.error("Erro ao atualizar relatório:", err);
        alert("Não foi possível atualizar o relatório.");
      }
    }
  };

  // Cancela a edição
  const cancelEdit = () => {
    setEditingReport(null);
  };

  // Função para gerar e baixar o PDF do relatório utilizando jsPDF
  const downloadReport = (report: Report) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;

    // Cabeçalho do PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Relatório: ${report.titulo}`, pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += 10;

    // Dados básicos
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Caso: ${report.caso}`, margin, currentY);
    currentY += 8;
    doc.text(`Descrição: ${report.descricao}`, margin, currentY);
    currentY += 8;
    doc.text(`Destinatário: ${report.destinatario}`, margin, currentY);
    currentY += 8;
    doc.text(`Conclusão Técnica: ${report.conclusaoTecnica}`, margin, currentY);
    currentY += 8;

    // Outros dados relevantes
    doc.text(`Objeto da Perícia: ${report.objetoPericia}`, margin, currentY);
    currentY += 8;
    doc.text(`Análise Técnica: ${report.analiseTecnica}`, margin, currentY);
    currentY += 8;
    doc.text(`Método Utilizado: ${report.metodoUtilizado}`, margin, currentY);
    currentY += 8;
    doc.text(
      `Materiais Utilizados: ${report.materiaisUtilizados}`,
      margin,
      currentY
    );
    currentY += 8;
    doc.text(`Exames Realizados: ${report.examesRealizados}`, margin, currentY);
    currentY += 8;
    doc.text(
      `Considerações Técnico-Periciais: ${report.consideracoesTecnicoPericiais}`,
      margin,
      currentY
    );
    currentY += 8;
    if (report.evidencias) {
      doc.text(`Evidências: ${report.evidencias}`, margin, currentY);
      currentY += 8;
    }

    // Dispara o download do PDF
    doc.save(`relatorio_${report.titulo}.pdf`);
  };

  // Renderiza a lista de relatórios
  const renderReports = () => (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Relatórios</h2>
      {reports.length === 0 ? (
        <p className="text-gray-500">Nenhum relatório cadastrado.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {reports.map((report) => (
            <li
              key={report.id}
              className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50 transition p-2 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">Caso: {report.caso}</p>
                <p className="text-sm text-gray-500">
                  Título: {report.titulo}
                  <br />
                  Descrição: {report.descricao}
                  <br />
                  Destinatário: {report.destinatario}
                  <br />
                  Conclusão Técnica: {report.conclusaoTecnica}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleEdit(report.id)}
                  className="text-blue-500 hover:text-blue-700 transition"
                  title="Editar Relatório"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(report.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Excluir Relatório"
                >
                  <FaTrash size={18} />
                </button>
                <button
                  onClick={() => downloadReport(report)}
                  className="text-green-500 hover:text-green-700 transition"
                  title="Baixar Relatório"
                >
                  <FaDownload size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8">
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8 relative">
      {/* Cabeçalho com seta de voltar e título */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition p-2"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Gestão de Relatórios
        </h1>
      </div>

      {renderReports()}

      {/* Modal de edição */}
      {editingReport && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Fundo com efeito borrado */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 sm:mx-auto z-10 shadow-xl overflow-y-auto max-h-full">
            <h2 className="text-xl font-bold mb-4">Editar Relatório</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caso
              </label>
              <input
                type="text"
                value={editCaso}
                onChange={(e) => setEditCaso(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={editTitulo}
                onChange={(e) => setEditTitulo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objeto da Perícia
              </label>
              <input
                type="text"
                value={editObjetoPericia}
                onChange={(e) => setEditObjetoPericia(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Análise Técnica
              </label>
              <textarea
                value={editAnaliseTecnica}
                onChange={(e) => setEditAnaliseTecnica(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método Utilizado
              </label>
              <input
                type="text"
                value={editMetodoUtilizado}
                onChange={(e) => setEditMetodoUtilizado(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinatário
              </label>
              <input
                type="text"
                value={editDestinatario}
                onChange={(e) => setEditDestinatario(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materiais Utilizados
              </label>
              <textarea
                value={editMateriaisUtilizados}
                onChange={(e) => setEditMateriaisUtilizados(e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exames Realizados
              </label>
              <textarea
                value={editExamesRealizados}
                onChange={(e) => setEditExamesRealizados(e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Considerações Técnico-Periciais
              </label>
              <textarea
                value={editConsideracoesTecnicoPericiais}
                onChange={(e) =>
                  setEditConsideracoesTecnicoPericiais(e.target.value)
                }
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conclusão Técnica
              </label>
              <textarea
                value={editConclusaoTecnica}
                onChange={(e) => setEditConclusaoTecnica(e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evidências (opcional)
              </label>
              <input
                type="text"
                value={editEvidencias}
                onChange={(e) => setEditEvidencias(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={cancelEdit}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
