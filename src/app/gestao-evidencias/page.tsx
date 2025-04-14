"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";

type EvidenceType = "imagem" | "texto";

interface Evidence {
  id: string;
  caso: string;
  tipo: EvidenceType;
  categoria: string;
  vitima: string;
  sexo: string;
  estadoCorpo: string;
  lesoes?: string;
  coletadoPor: string;
  conteudo?: string; // utilizado se o tipo for "texto"
  imagem?: string; // nome do arquivo, utilizado se o tipo for "imagem"
  laudo?: string;
}

export default function EvidenceManagementPage() {
  const router = useRouter();

  // Estados de evidências e carregamento
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para controle do modal de edição
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [editCaso, setEditCaso] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [editVitima, setEditVitima] = useState("");
  const [editSexo, setEditSexo] = useState("");
  const [editEstadoCorpo, setEditEstadoCorpo] = useState("");
  const [editLesoes, setEditLesoes] = useState("");
  const [editColetadoPor, setEditColetadoPor] = useState("");
  const [editLaudo, setEditLaudo] = useState("");
  const [editConteudo, setEditConteudo] = useState("");

  // Busca as evidências reais do backend na inicialização do componente
  useEffect(() => {
    const fetchEvidences = async () => {
      try {
        const response = await axios.get<Evidence[]>("/api/evidences");
        setEvidences(response.data);
      } catch (err: unknown) {
        console.error("Erro ao buscar evidências:", err);
        setError("Erro ao carregar as evidências.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvidences();
  }, []);

  // Filtrar evidências por tipo
  const textEvidences = useMemo(
    () => evidences.filter((item) => item.tipo === "texto"),
    [evidences]
  );
  const imageEvidences = useMemo(
    () => evidences.filter((item) => item.tipo === "imagem"),
    [evidences]
  );

  // Função para excluir uma evidência
  const handleDelete = async (id: string) => {
    if (confirm("Você tem certeza que deseja excluir esta evidência?")) {
      try {
        await axios.delete(`/api/evidences/${id}`);
        setEvidences((prev) => prev.filter((item) => item.id !== id));
      } catch (err: unknown) {
        console.error("Erro ao excluir evidência:", err);
        alert("Não foi possível excluir a evidência.");
      }
    }
  };

  // Inicia a edição preenchendo os estados com os dados da evidência
  const handleEdit = (id: string) => {
    const evidenceToEdit = evidences.find((item) => item.id === id);
    if (evidenceToEdit) {
      setEditingEvidence(evidenceToEdit);
      setEditCaso(evidenceToEdit.caso);
      setEditCategoria(evidenceToEdit.categoria);
      setEditVitima(evidenceToEdit.vitima);
      setEditSexo(evidenceToEdit.sexo);
      setEditEstadoCorpo(evidenceToEdit.estadoCorpo);
      setEditLesoes(evidenceToEdit.lesoes || "");
      setEditColetadoPor(evidenceToEdit.coletadoPor);
      setEditLaudo(evidenceToEdit.laudo || "");
      setEditConteudo(evidenceToEdit.conteudo || "");
    }
  };

  // Confirma a edição e atualiza a lista de evidências no backend e na interface
  const confirmEdit = async () => {
    if (editingEvidence) {
      const updatedEvidence: Evidence = {
        ...editingEvidence,
        caso: editCaso,
        categoria: editCategoria,
        vitima: editVitima,
        sexo: editSexo,
        estadoCorpo: editEstadoCorpo,
        lesoes: editLesoes,
        coletadoPor: editColetadoPor,
        laudo: editLaudo,
        conteudo: editingEvidence.tipo === "texto" ? editConteudo : undefined,
      };

      try {
        await axios.put(
          `/api/evidences/${editingEvidence.id}`,
          updatedEvidence
        );
        setEvidences((prev) =>
          prev.map((item) =>
            item.id === editingEvidence.id ? updatedEvidence : item
          )
        );
        setEditingEvidence(null);
      } catch (err: unknown) {
        console.error("Erro ao atualizar evidência:", err);
        alert("Não foi possível atualizar a evidência.");
      }
    }
  };

  // Cancela a edição
  const cancelEdit = () => {
    setEditingEvidence(null);
  };

  // Função auxiliar para renderizar cada grupo de evidências
  const renderEvidenceGroup = (title: string, evidenceList: Evidence[]) => (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
      {evidenceList.length === 0 ? (
        <p className="text-gray-500">Nenhuma evidência neste grupo.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {evidenceList.map((item) => (
            <li
              key={item.id}
              className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50 transition p-2 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">Caso: {item.caso}</p>
                <p className="text-sm text-gray-500">
                  Categoria: {item.categoria}
                  <br />
                  Vítima: {item.vitima} | Sexo: {item.sexo} | Estado do Corpo:{" "}
                  {item.estadoCorpo}
                  {item.lesoes && (
                    <>
                      <br />
                      Lesões: {item.lesoes}
                    </>
                  )}
                  <br />
                  Coletado por: {item.coletadoPor}
                  {item.tipo === "texto" && item.conteudo && (
                    <>
                      <br />
                      Conteúdo: {item.conteudo}
                    </>
                  )}
                  {item.tipo === "imagem" && item.imagem && (
                    <>
                      <br />
                      Imagem: {item.imagem}
                    </>
                  )}
                  {item.laudo && (
                    <>
                      <br />
                      Laudo: {item.laudo}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="text-blue-500 hover:text-blue-700 transition"
                  title="Editar Evidência"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Excluir Evidência"
                >
                  <FaTrash size={18} />
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
        <p>Carregando evidências...</p>
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
      {/* Cabeçalho com seta de voltar e título alinhado à esquerda */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition p-2"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Gestão de Evidências
        </h1>
      </div>

      {renderEvidenceGroup("Evidências de Texto", textEvidences)}
      {renderEvidenceGroup("Evidências de Imagem", imageEvidences)}

      {/* Modal de edição */}
      {editingEvidence && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 sm:mx-auto z-10 shadow-xl overflow-y-auto max-h-full">
            <h2 className="text-xl font-bold mb-4">Editar Evidência</h2>
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
                Categoria
              </label>
              <input
                type="text"
                value={editCategoria}
                onChange={(e) => setEditCategoria(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vítima
                </label>
                <input
                  type="text"
                  value={editVitima}
                  onChange={(e) => setEditVitima(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo
                </label>
                <input
                  type="text"
                  value={editSexo}
                  onChange={(e) => setEditSexo(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado do Corpo
              </label>
              <input
                type="text"
                value={editEstadoCorpo}
                onChange={(e) => setEditEstadoCorpo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesões (opcional)
              </label>
              <input
                type="text"
                value={editLesoes}
                onChange={(e) => setEditLesoes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coletado por
              </label>
              <input
                type="text"
                value={editColetadoPor}
                onChange={(e) => setEditColetadoPor(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              />
            </div>
            {editingEvidence.tipo === "texto" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo
                </label>
                <textarea
                  value={editConteudo}
                  onChange={(e) => setEditConteudo(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
                ></textarea>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Laudo (opcional)
              </label>
              <input
                type="text"
                value={editLaudo}
                onChange={(e) => setEditLaudo(e.target.value)}
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
