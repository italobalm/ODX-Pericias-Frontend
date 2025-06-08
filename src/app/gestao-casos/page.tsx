"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FaTrashAlt, FaArrowLeft, FaEdit } from "react-icons/fa";
import api from "../../lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { ApiError } from "@/types/Error";
import { Case } from "@/types/Case";
import { motion } from "framer-motion";

export default function CaseManagementPage() {
  const router = useRouter();
  const { user, loading, error } = useAuth();

  const [cases, setCases] = useState<Case[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    status: "open",
    cidade: "",
    estado: ""
  });
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

        setCases(res.data.casos);
        setPagination(res.data.paginacao);
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
    if (!formData.titulo || !formData.descricao) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }
  
    setIsLoading(true);
    try {
      if (editingCase) {
        const updatedCase = await api.put(`/api/cases/${editingCase._id}`, formData).then(res => res.data.caso);
        
        setCases(prev => prev.map(c => 
          c._id === editingCase._id ? { ...c, ...updatedCase } : c
        ));
        
        setSuccess("Caso atualizado com sucesso.");
        setEditingCase(null);
        resetForm();
      } else {
        setErrorMessage("Não é permitido editar casos no momento.");
      }
    } catch (err) {
      const apiError = err as ApiError;
      setErrorMessage(apiError?.response?.data?.msg || "Erro ao salvar o caso.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      status: "open",
      cidade: "",
      estado: ""
    });
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setFormData({
      titulo: caseItem.titulo,
      descricao: caseItem.descricao,
      status: caseItem.status,
      cidade: caseItem.cidade,
      estado: caseItem.estado
    });
    setErrorMessage("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingCase(null);
    resetForm();
    setErrorMessage("");
    setSuccess("");
  };

  const handleRemoveCase = async (caseId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este caso?")) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/api/cases/${caseId}`);
      setCases(prev => prev.filter(c => c._id !== caseId));
      setSuccess("Caso removido com sucesso.");
    } catch (err) {
      const apiError = err as ApiError;
      setErrorMessage(apiError?.response?.data?.msg || "Erro ao remover o caso.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaginationChange = (page: number) => {
    setPagination(prev => ({
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

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-10 space-y-6"
  >
    <h2 className="text-lg font-semibold text-gray-700">{editingCase ? "Editar Caso" : "Editar Caso"}</h2>
    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    {success && <p className="text-green-500">{success}</p>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <input
        type="text"
        name="titulo"
        placeholder="Título *"
        value={formData.titulo}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
        disabled={isLoading}
      />
      <textarea
        name="descricao"
        placeholder="Descrição *"
        value={formData.descricao}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
        disabled={isLoading}
      />
      {/* Outros inputs */}
    </div>
    <div className="flex justify-end gap-4">
      {editingCase && (
        <button
          onClick={handleCancelEdit}
          className="bg-gray-500 text-white py-2 px-6 rounded-xl hover:bg-gray-600 transition"
          disabled={isLoading}
        >
          Cancelar
        </button>
      )}
      <button
        onClick={handleSaveCase}
        className="bg-teal-600 text-white py-2 px-6 rounded-xl hover:bg-teal-700 transition"
        disabled={isLoading || !formData.titulo || !formData.descricao}
      >
        {isLoading ? "Carregando..." : editingCase ? "Salvar Alterações" : "Salvar Alterações"}
      </button>
    </div>
  </motion.div>

  <div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
    <h2 className="text-lg font-semibold text-gray-700 mb-6">Casos Cadastrados</h2>
    {isLoading ? (
      <p className="text-gray-600">Carregando casos...</p>
    ) : cases.length === 0 ? (
      <p className="text-gray-600">Nenhum caso cadastrado.</p>
    ) : (
      <ul className="divide-y divide-gray-200">
        {cases.map((caseItem) => (
          <motion.li
            key={caseItem._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50 transition p-2 rounded-lg"
          >
            <div>
              <p className="font-semibold text-gray-800">Título: {caseItem.titulo}</p>
              <p className="text-gray-600">Descrição: {caseItem.descricao}</p>
              {/* Outros campos */}
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <button
                onClick={() => handleEditCase(caseItem)}
                className="text-teal-500 hover:text-teal-700 transition"
              >
                <FaEdit size={18} />
              </button>
              <button
                onClick={() => handleRemoveCase(caseItem._id)}
                className="text-red-500 hover:text-red-700 transition"
              >
                <FaTrashAlt size={18} />
              </button>
            </div>
          </motion.li>
        ))}
      </ul>
    )}
  </div>

  {pagination.totalPaginas > 1 && (
    <div className="mt-6 flex justify-center items-center gap-4">
      <button
        onClick={() => handlePaginationChange(pagination.paginaAtual - 1)}
        className="text-gray-500 disabled:text-gray-300 px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-600 transition"
      >
        Anterior
      </button>
      <span className="text-gray-600">
        Página {pagination.paginaAtual} de {pagination.totalPaginas}
      </span>
      <button
        onClick={() => handlePaginationChange(pagination.paginaAtual + 1)}
        disabled={pagination.paginaAtual === pagination.totalPaginas}
        className="text-gray-500 disabled:text-gray-300 px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
      >
        Próximo
      </button>
    </div>
  )}
</div>
  );
}