"use client";

import { useState, useMemo, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

type CaseStatus = "arquivado" | "em andamento" | "concluido";

interface Case {
  id: string;
  titulo: string;
  descricao: string;
  createdAt: string;
  status: CaseStatus;
  responsavel: string;
}

export default function CaseListPage() {
  // Estado para armazenar os casos obtidos do backend
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Estados para controle de edição
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");

  // Busca os casos do backend quando o componente é montado
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/cases")
      .then((response) => {
        setCases(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Erro ao carregar os casos. Tente novamente mais tarde.");
        setLoading(false);
      });
  }, []);

  // Filtra os casos por status utilizando useMemo para otimização
  const inProgressCases = useMemo(
    () => cases.filter((item) => item.status === "em andamento"),
    [cases]
  );
  const archivedCases = useMemo(
    () => cases.filter((item) => item.status === "arquivado"),
    [cases]
  );
  const completedCases = useMemo(
    () => cases.filter((item) => item.status === "concluido"),
    [cases]
  );

  // Função para excluir um caso
  const handleDelete = (id: string) => {
    const confirmDelete = confirm("Você tem certeza que deseja excluir este caso?");
    if (confirmDelete) {
      axios
        .delete(`/api/cases/${id}`)
        .then(() => {
          setCases((prev) => prev.filter((item) => item.id !== id));
        })
        .catch((err) => {
          console.error(err);
          alert("Erro ao excluir o caso. Tente novamente.");
        });
    }
  };

  // Inicia a edição do caso buscando os dados atualizados do backend pelo id
  const handleEdit = (id: string) => {
    axios
      .get(`/api/cases/${id}`)
      .then((response) => {
        const caseToEdit = response.data;
        setEditingCase(caseToEdit);
        setEditTitulo(caseToEdit.titulo);
        setEditDescricao(caseToEdit.descricao);
      })
      .catch((err) => {
        console.error(err);
        alert("Erro ao carregar os dados do caso para edição.");
      });
  };

  // Confirma a edição e envia a atualização para o backend
  const confirmEdit = () => {
    if (editingCase) {
      const updatedCase = { ...editingCase, titulo: editTitulo, descricao: editDescricao };
      axios
        .put(`/api/cases/${editingCase.id}`, updatedCase)
        .then((response) => {
          // Atualiza a lista local de casos com a resposta do backend
          setCases((prev) =>
            prev.map((item) =>
              item.id === editingCase.id ? response.data : item
            )
          );
          setEditingCase(null);
        })
        .catch((err) => {
          console.error(err);
          alert("Erro ao atualizar o caso. Tente novamente.");
        });
    }
  };

  // Cancela a edição e fecha o formulário
  const cancelEdit = () => {
    setEditingCase(null);
  };

  // Função auxiliar para renderizar um grupo de casos
  const renderCaseGroup = (title: string, caseList: Case[]) => (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
      {caseList.length === 0 ? (
        <p className="text-gray-500">Nenhum caso nesta categoria.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {caseList.map((caseItem) => (
            <li
              key={caseItem.id}
              className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50 transition p-2 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">{caseItem.titulo}</p>
                <p className="text-sm text-gray-500">
                  {caseItem.descricao}
                  <br />
                  Criado em: {new Date(caseItem.createdAt).toLocaleDateString()}
                  <br />
                  Responsável: {caseItem.responsavel}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleEdit(caseItem.id)}
                  className="text-blue-500 hover:text-blue-700 transition"
                  title="Editar Caso"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(caseItem.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Excluir Caso"
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

  return (
    <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8 relative">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center md:text-left">
        Lista de Casos
      </h1>

      {loading && <p className="text-gray-700">Carregando casos...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <>
          {renderCaseGroup("Casos em Andamento", inProgressCases)}
          {renderCaseGroup("Casos Arquivados", archivedCases)}
          {renderCaseGroup("Casos Concluídos", completedCases)}
        </>
      )}

      {/* Container de edição exibido na própria página */}
      {editingCase && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Fundo borrado com sobreposição */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
          <div className="bg-white rounded-xl p-6 w-full max-w-md z-10 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Editar Caso</h2>
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
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-teal-300"
              ></textarea>
            </div>
            <div className="flex justify-end gap-4">
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
