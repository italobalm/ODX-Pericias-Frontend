"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { useReports } from "../../hooks/report";
import { Case } from "../../types/Case";
import { ApiError } from "../../types/Error";

interface Report {
  _id: string;
  caseId: string;
  titulo?: string;
  descricao?: string;
  objetoPericia?: string;
  analiseTecnica?: string;
  metodoUtilizado?: string;
  destinatario?: string;
  materiaisUtilizados?: string;
  examesRealizados?: string;
  consideracoesTecnicoPericiais?: string;
  conclusaoTecnica?: string;
  evidencias?: string;
}

interface ReportData {
  caseId: string;
  titulo?: string;
  descricao?: string;
  objetoPericia?: string;
  analiseTecnica?: string;
  metodoUtilizado?: string;
  destinatario?: string;
  materiaisUtilizados?: string;
  examesRealizados?: string;
  consideracoesTecnicoPericiais?: string;
  conclusaoTecnica?: string;
  evidencias?: string;
}

export default function ReportManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading, fetchLoggedUser } = useAuth();
  const { fetchReports, fetchCases, createReport, updateReport, deleteReport, loading: reportLoading, error: reportError } = useReports();

  // Estados para dados
  const [reports, setReports] = useState<Report[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Estados para controle da edição (modal)
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editCaseId, setEditCaseId] = useState("");
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editObjetoPericia, setEditObjetoPericia] = useState("");
  const [editAnaliseTecnica, setEditAnaliseTecnica] = useState("");
  const [editMetodoUtilizado, setEditMetodoUtilizado] = useState("");
  const [editDestinatario, setEditDestinatario] = useState("");
  const [editMateriaisUtilizados, setEditMateriaisUtilizados] = useState("");
  const [editExamesRealizados, setEditExamesRealizados] = useState("");
  const [editConsideracoesTecnicoPericiais, setEditConsideracoesTecnicoPericiais] = useState("");
  const [editConclusaoTecnica, setEditConclusaoTecnica] = useState("");
  const [editEvidencias, setEditEvidencias] = useState("");

  // Verifica autenticação e busca relatórios e casos
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (authLoading) return;

      if (!user) {
        try {
          await fetchLoggedUser();
        } catch {
          router.push("/login");
          return;
        }
      }

      if (!user) {
        router.push("/login");
        return;
      }

      if (!["ADMIN", "PERITO"].includes(user.perfil)) {
        setError("Você não tem permissão para acessar esta página.");
        router.push("/");
        return;
      }

      try {
        const [reportsData, casesData] = await Promise.all([fetchReports(), fetchCases()]);
        setReports(reportsData);
        setCases(casesData);
      } catch {
        setError("Erro ao carregar os dados.");
      }
    };

    checkAuthAndFetchData();
  }, [user, authLoading, fetchLoggedUser, fetchReports, fetchCases, router]);

  // Preenche os campos de edição a partir do relatório selecionado
  const handleEdit = (reportId: string) => {
    const reportToEdit = reports.find((report) => report._id === reportId);
    if (reportToEdit) {
      setEditingReport(reportToEdit);
      setEditCaseId(reportToEdit.caseId);
      setEditTitulo(reportToEdit.titulo || "");
      setEditDescricao(reportToEdit.descricao || "");
      setEditObjetoPericia(reportToEdit.objetoPericia || "");
      setEditAnaliseTecnica(reportToEdit.analiseTecnica || "");
      setEditMetodoUtilizado(reportToEdit.metodoUtilizado || "");
      setEditDestinatario(reportToEdit.destinatario || "");
      setEditMateriaisUtilizados(reportToEdit.materiaisUtilizados || "");
      setEditExamesRealizados(reportToEdit.examesRealizados || "");
      setEditConsideracoesTecnicoPericiais(reportToEdit.consideracoesTecnicoPericiais || "");
      setEditConclusaoTecnica(reportToEdit.conclusaoTecnica || "");
      setEditEvidencias(reportToEdit.evidencias || "");
    }
  };

  // Atualiza o relatório editado
  const confirmEdit = async () => {
    if (editingReport) {
      const updatedReportData: ReportData = {
        caseId: editCaseId,
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
        const updatedReport = await updateReport(editingReport._id, updatedReportData);
        setReports((prev) =>
          prev.map((report) => (report._id === editingReport._id ? updatedReport : report))
        );
        setEditingReport(null);
      } catch (err) {
        const errorTyped = err as ApiError;
        setError(errorTyped.response?.data?.msg || "Erro ao atualizar o relatório.");
      }
    }
  };

  // Cancela a edição
  const cancelEdit = () => {
    setEditingReport(null);
  };

  // Exclui um relatório
  const handleDelete = async (reportId: string) => {
    if (confirm("Você tem certeza que deseja excluir este relatório?")) {
      try {
        await deleteReport(reportId);
        setReports((prev) => prev.filter((report) => report._id !== reportId));
      } catch (err) {
        const errorTyped = err as ApiError;
        setError(errorTyped.response?.data?.msg || "Erro ao excluir o relatório.");
      }
    }
  };

  // Gera e baixa o PDF do relatório
  const downloadReport = async (report: Report) => {
    try {
      const reportData: ReportData = {
        caseId: report.caseId,
        titulo: report.titulo,
        descricao: report.descricao,
        objetoPericia: report.objetoPericia,
        analiseTecnica: report.analiseTecnica,
        metodoUtilizado: report.metodoUtilizado,
        destinatario: report.destinatario,
        materiaisUtilizados: report.materiaisUtilizados,
        examesRealizados: report.examesRealizados,
        consideracoesTecnicoPericiais: report.consideracoesTecnicoPericiais,
        conclusaoTecnica: report.conclusaoTecnica,
        evidencias: report.evidencias,
      };
      const pdfBlob = await createReport(reportData);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${report.titulo || "relatorio"}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorTyped = err as ApiError;
      setError(errorTyped.response?.data?.msg || "Erro ao gerar o PDF do relatório.");
    }
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
              key={report._id}
              className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50 transition p-2 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">
                  Caso: {cases.find((c) => c._id === report.caseId)?.titulo || report.caseId}
                </p>
                <p className="text-sm text-gray-500">
                  Título: {report.titulo || "Sem título"}
                  <br />
                  Descrição: {report.descricao || "Sem descrição"}
                  <br />
                  Destinatário: {report.destinatario || "Não informado"}
                  <br />
                  Conclusão Técnica: {report.conclusaoTecnica || "Não informada"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleEdit(report._id)}
                  className="text-blue-500 hover:text-blue-700 transition"
                  title="Editar Relatório"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(report._id)}
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

  if (authLoading || reportLoading) {
    return (
      <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || reportError) {
    return (
      <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8">
        <p className="text-red-500">{error || reportError}</p>
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
              <select
                value={editCaseId}
                onChange={(e) => setEditCaseId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              >
                <option value="">Selecione um caso</option>
                {cases.map((caseItem) => (
                  <option key={caseItem._id} value={caseItem._id}>
                    {caseItem.titulo}
                  </option>
                ))}
              </select>
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
                onChange={(e) => setEditConsideracoesTecnicoPericiais(e.target.value)}
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