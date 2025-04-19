"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FaTrashAlt, FaArrowLeft, FaEdit } from "react-icons/fa";
import api from "../../lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { ApiError } from "@/types/Error";
import { Case } from "@/types/Case";

export default function CaseManagementPage() {
  const router = useRouter();
  const { user, loading, error } = useAuth();

  const [cases, setCases] = useState<Case[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [editingCase, setEditingCase] = useState<Case | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    paginaAtual: 1,
    porPagina: 10,
    totalPaginas: 0
  });

  useEffect(() => {
    // Apenas efetua o redirecionamento se o usuário não for "admin" ou "perito" e o carregamento foi concluído
    if (!loading && user && !["admin", "perito"].includes(user.perfil.toLowerCase())) {
      router.push("/initialScreen");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !["admin", "perito"].includes(user.perfil.toLowerCase())) return;

    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/api/cases", {
          params: {
            page: pagination.paginaAtual,
            limit: pagination.porPagina,
          },
        });
        
        // Aqui você pega tanto os casos quanto a informação de paginação
        setCases(res.data.casos); // Array de casos
        setPagination(res.data.paginacao); // Informações de paginação
        
      } catch (err) {
        const apiError = err as ApiError;
        setErrorMessage(apiError?.response?.data?.msg || "Erro ao carregar os casos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [user, pagination.paginaAtual, pagination.porPagina]);

  const handleSaveCase = async () => {
    if (!title || !description) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    const caseData = {
      title,
      description,
      status,
      cidade,
      estado,
    };

    setIsLoading(true);
    try {
      if (editingCase) {
        const res = await api.put<Case>(`/api/cases/${editingCase._id}`, caseData);
        setCases((prev) =>
          prev.map((c) => (c._id === editingCase._id ? res.data : c))
        );
        setSuccess("Caso atualizado com sucesso.");
      } else {
        const res = await api.post<Case>("/api/cases", caseData);
        setCases((prev) => [...prev, res.data]);
        setSuccess("Caso adicionado com sucesso.");
      }

      setEditingCase(null);
      setTitle("");
      setDescription("");
      setStatus("");
      setCidade("");
      setEstado("");
      setErrorMessage("");
    } catch (err) {
      const apiError = err as ApiError;
      setErrorMessage(apiError?.response?.data?.msg || "Erro ao salvar o caso.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setTitle(caseItem.titulo);
    setDescription(caseItem.descricao);
    setStatus(caseItem.status);
    setCidade(caseItem.cidade);
    setEstado(caseItem.estado);
    setErrorMessage("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingCase(null);
    setTitle("");
    setDescription("");
    setStatus("");
    setErrorMessage("");
    setSuccess("");
  };

  const handleRemoveCase = async (caseId: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/api/cases/${caseId}`);
      setCases((prev) => prev.filter((c) => c._id !== caseId));
      setSuccess("Caso removido com sucesso.");
    } catch (err) {
      const apiError = err as ApiError;
      setErrorMessage(apiError?.response?.data?.msg || "Erro ao remover o caso.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      paginaAtual: page,
    }));
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  if (!user || !["admin", "perito"].includes(user.perfil.toLowerCase())) {
    return null;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pt-28 p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition p-2"
          title="Voltar"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestão de Casos</h1>
      </div>

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-10 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">
          {editingCase ? "Editar Caso" : "Adicionar Novo Caso"}
        </h2>
        {(errorMessage || error) && (
          <p className="text-red-500">{errorMessage || error}</p>
        )}
        {success && <p className="text-green-500">{success}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Título *"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
           <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          <textarea
            placeholder="Descrição *"
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
          <select
            value={status}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
          >
            <option value="open">Em Andamento</option>
            <option value="closed">Finalizado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <div className="flex justify-end gap-4">
          {editingCase && (
            <button
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition"
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSaveCase}
            className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition"
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : editingCase ? "Salvar Alterações" : "Adicionar Caso"}
          </button>
        </div>
      </div>

      <div className="bg-white mt-4 rounded-xl shadow-md p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Casos Cadastrados</h2>
        {isLoading ? (
          <p className="text-gray-500">Carregando casos...</p>
        ) : cases.length === 0 ? (
          <p className="text-gray-500">
            Nenhum caso cadastrado.{" "}
            {errorMessage && <span className="text-red-500">({errorMessage})</span>}
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {cases.map((caseItem) => (
              <li
                key={caseItem._id}
                className="py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div>
                <p className="font-semibold text-gray-800">Título: {caseItem.titulo}</p>
                <p className="text-gray-600">Descrição: {caseItem.descricao}</p>
                <p className="text-gray-600">Status: {caseItem.status}</p>
                <p className="text-gray-600">Responsável: {caseItem.responsavel}</p>
                <p className="text-gray-600">Data de Criação: {new Date(caseItem.dataCriacao).toLocaleDateString()}</p>
                <p className="text-gray-600">Cidade: {caseItem.cidade}</p>
                <p className="text-gray-600">Estado: {caseItem.estado}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEditCase(caseItem)}
                    className="text-teal-600 hover:text-teal-800 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleRemoveCase(caseItem._id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => handlePaginationChange(pagination.paginaAtual - 1)}
            disabled={pagination.paginaAtual === 1}
            className="text-gray-500 disabled:text-gray-300"
          >
            Anterior
          </button>
          <span>
            Página {pagination.paginaAtual} de {pagination.totalPaginas}
          </span>
          <button
            onClick={() => handlePaginationChange(pagination.paginaAtual + 1)}
            disabled={pagination.paginaAtual === pagination.totalPaginas}
            className="text-gray-500 disabled:text-gray-300"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}