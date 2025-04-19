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
  const [status, setStatus] = useState("Aberto");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [editingCase, setEditingCase] = useState<Case | null>(null);

  useEffect(() => {
    // Apenas efetua o redirecionamento se o usuário não for "admin" e o carregamento foi concluído
    if (!loading && user && user.perfil.toLowerCase() !== "admin") {
      router.push("/initialScreen");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.perfil.toLowerCase() !== "admin") return;

    const fetchCases = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<Case[]>("/api/cases");
        setCases(res.data);
      } catch (err) {
        const apiError = err as ApiError;
        setErrorMessage(apiError?.response?.data?.msg || "Erro ao carregar os casos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [user]);

  const handleSaveCase = async () => {
    if (!title || !description) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    const caseData = {
      title,
      description,
      status,
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
      setStatus("open");
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
    setErrorMessage("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingCase(null);
    setTitle("");
    setDescription("");
    setStatus("open");
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

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  if (!user || user.perfil.toLowerCase() !== "admin") {
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
            <option value="open">Aberto</option>
            <option value="closed">Fechado</option>
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
                  <p className="font-medium text-gray-800">{caseItem.titulo}</p>
                  <p className="text-sm text-gray-500">{caseItem.descricao}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEditCase(caseItem)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar Caso"
                    disabled={isLoading}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleRemoveCase(caseItem._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Remover Caso"
                    disabled={isLoading}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}