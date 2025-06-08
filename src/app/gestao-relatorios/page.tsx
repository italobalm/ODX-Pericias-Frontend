"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jsPDF } from "jspdf";
import { FaArrowLeft, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";

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
      } catch (err: unknown) {
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
      } catch (err: unknown) {
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
      } catch (err: unknown) {
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
  // const renderReports = () => (
  //   <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
  //     <h2 className="text-lg font-semibold text-gray-700 mb-4">Relatórios</h2>
  //     {reports.length === 0 ? (
  //       <p className="text-gray-500">Nenhum relatório cadastrado.</p>
  //     ) : (
  //       <ul className="divide-y divide-gray-200">
  //         {reports.map((report) => (
  //           <li
  //             key={report.id}
  //             className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50 transition p-2 rounded-lg"
  //           >
  //             <div>
  //               <p className="font-medium text-gray-800">Caso: {report.caso}</p>
  //               <p className="text-sm text-gray-500">
  //                 Título: {report.titulo}
  //                 <br />
  //                 Descrição: {report.descricao}
  //                 <br />
  //                 Destinatário: {report.destinatario}
  //                 <br />
  //                 Conclusão Técnica: {report.conclusaoTecnica}
  //               </p>
  //             </div>
  //             <div className="flex items-center gap-4">
  //               <button
  //                 onClick={() => handleEdit(report.id)}
  //                 className="text-blue-500 hover:text-blue-700 transition"
  //                 title="Editar Relatório"
  //               >
  //                 <FaEdit size={18} />
  //               </button>
  //               <button
  //                 onClick={() => handleDelete(report.id)}
  //                 className="text-red-500 hover:text-red-700 transition"
  //                 title="Excluir Relatório"
  //               >
  //                 <FaTrash size={18} />
  //               </button>
  //               <button
  //                 onClick={() => downloadReport(report)}
  //                 className="text-green-500 hover:text-green-700 transition"
  //                 title="Baixar Relatório"
  //               >
  //                 <FaDownload size={18} />
  //               </button>
  //             </div>
  //           </li>
  //         ))}
  //       </ul>
  //     )}
  //   </div>
  // );

  // if (loading) {
  //   return (
  //     <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8">
  //       <p>Carregando relatórios...</p>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8">
  //       <p className="text-red-500">{error}</p>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8 relative">
  <div className="flex items-center gap-4 mb-8">
    <button
      onClick={() => router.back()}
      className="text-gray-600 hover:text-gray-800 transition p-2"
    >
      <FaArrowLeft size={20} />
    </button>
    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestão de Relatórios</h1>
  </div>

  <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">Relatórios</h2>
    {loading ? (
      <p className="text-gray-600">Carregando relatórios...</p>
    ) : error ? (
      <p className="text-red-500">{error}</p>
    ) : reports.length === 0 ? (
      <p className="text-gray-600">Nenhum relatório cadastrado.</p>
    ) : (
      <ul className="divide-y divide-gray-200">
        {reports.map((report) => (
          <motion.li
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50 transition p-2 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-800">Caso: {report.caso}</p>
              <p className="text-sm text-gray-600">
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
                className="text-teal-500 hover:text-teal-700 transition"
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
          </motion.li>
        ))}
      </ul>
    )}
  </div>

  {editingReport && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Editar Relatório</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Caso</label>
          <input
            type="text"
            value={editCaso}
            onChange={(e) => setEditCaso(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300"
          />
        </div>
        {/* Outros campos semelhantes */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={cancelEdit}
            className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          <button
            onClick={confirmEdit}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition"
          >
            Salvar
          </button>
        </div>
      </div>
    </motion.div>
  )}
</div>
  );
}
