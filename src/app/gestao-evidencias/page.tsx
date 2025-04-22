"use client";

import { useState, useEffect, useMemo, ChangeEvent, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import api from "@/lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { Evidence, EvidenceListResponse } from "@/types/Evidence";
import { AxiosError } from "axios";
import Image from "next/image";

export default function EvidenceManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    paginaAtual: 1,
    porPagina: 10,
    totalPaginas: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    casoReferencia: "",
    tipo: "texto" as "imagem" | "texto",
    categoria: "",
    vitima: "identificada" as "identificada" | "não identificada",
    sexo: "masculino" as "masculino" | "feminino" | "indeterminado",
    estadoCorpo: "inteiro" as "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto",
    lesoes: "",
    coletadoPorNome: "",
    laudo: "",
    conteudo: "",
    file: null as File | null,
    filePreview: null as string | null
  });

  const isFormValid = useMemo(() => (
    formData.casoReferencia &&
    formData.categoria &&
    formData.coletadoPorNome &&
    (formData.tipo === "texto" ? formData.conteudo : (editingEvidence ? true : formData.file))
  ), [formData, editingEvidence]);

  const fetchEvidences = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get<EvidenceListResponse>("/api/evidence", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.paginaAtual,
          limit: pagination.porPagina,
          search: searchTerm
        },
      });

      setEvidences(response.data.evidencias);
      setPagination(response.data.paginacao);
      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao buscar evidências.");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.paginaAtual, pagination.porPagina, searchTerm]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchEvidences();
    }
  }, [user, authLoading, fetchEvidences]);

  const handleEditEvidence = (evidence: Evidence) => {
    setEditingEvidence(evidence);
    setFormData({
      ...formData,
      casoReferencia: evidence.casoReferencia,
      tipo: evidence.tipo,
      categoria: evidence.categoria,
      vitima: evidence.vitima,
      sexo: evidence.sexo,
      estadoCorpo: evidence.estadoCorpo,
      lesoes: evidence.lesoes || "",
      coletadoPorNome: typeof evidence.coletadoPor === "string" ? evidence.coletadoPor : evidence.coletadoPor?.nome || "",
      laudo: evidence.laudo || "",
      conteudo: evidence.conteudo || "",
      file: null,
      filePreview: null
    });
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingEvidence(null);
    setFormData({
      ...formData,
      casoReferencia: "",
      tipo: "texto",
      categoria: "",
      vitima: "identificada",
      sexo: "masculino",
      estadoCorpo: "inteiro",
      lesoes: "",
      coletadoPorNome: "",
      laudo: "",
      conteudo: "",
      file: null,
      filePreview: null
    });
    setError("");
    setSuccess("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        setFormData({...formData, file: null, filePreview: null});
        return;
      }
      const previewURL = URL.createObjectURL(selectedFile);
      setFormData({...formData, file: selectedFile, filePreview: previewURL});
      setError("");
    } else {
      setFormData({...formData, file: null, filePreview: null});
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    const data = new FormData();
    data.append("casoReferencia", formData.casoReferencia);
    data.append("tipo", formData.tipo);
    data.append("categoria", formData.categoria);
    data.append("vitima", formData.vitima);
    data.append("sexo", formData.sexo);
    data.append("estadoCorpo", formData.estadoCorpo);
    if (formData.lesoes) data.append("lesoes", formData.lesoes);
    data.append("coletadoPor", JSON.stringify({ nome: formData.coletadoPorNome}));
    if (formData.tipo === "texto" && formData.conteudo) data.append("conteudo", formData.conteudo);
    if (formData.laudo) data.append("laudo", formData.laudo);
    if (formData.tipo === "imagem" && formData.file) data.append("file", formData.file);

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const endpoint = editingEvidence ? `/api/evidence/${editingEvidence._id}` : "/api/evidence";
      const method = editingEvidence ? "put" : "post";
      
      await api[method]<Evidence>(endpoint, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(editingEvidence ? "Evidência atualizada com sucesso." : "Evidência adicionada com sucesso.");
      fetchEvidences();
      handleCancelEdit();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || `Erro ao ${editingEvidence ? 'atualizar' : 'adicionar'} a evidência.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta evidência?")) return;

    try {
      const token = localStorage.getItem("authToken");
      await api.delete(`/api/evidence/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEvidences();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao excluir a evidência.");
    }
  };

  const handlePaginationChange = (page: number) => {
    setPagination(prev => ({ ...prev, paginaAtual: page }));
  };

  const filteredEvidences = useMemo(() => {
    return evidences.filter(evidence => 
      evidence.casoReferencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evidence.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof evidence.coletadoPor === 'object' && 
       evidence.coletadoPor?.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [evidences, searchTerm]);

  const textEvidences = useMemo(() => 
    filteredEvidences.filter(item => item.tipo?.toLowerCase().trim() === "texto"),
    [filteredEvidences]
  );

  const imageEvidences = useMemo(() => 
    filteredEvidences.filter(item => item.tipo?.toLowerCase().trim() === "imagem"),
    [filteredEvidences]
  );

  if (authLoading) return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  if (authError) return <div className="text-center mt-20 text-red-500">Erro de autenticação: {authError}</div>;
  if (!user || !["admin", "perito", "assistente"].includes(user.perfil.toLowerCase())) {
    router.push("/initialScreen");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-28 p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800 transition p-2" title="Voltar">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestão de Evidências</h1>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">
          {editingEvidence ? "Editar Evidência" : "Adicionar Nova Evidência"}
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evidência *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800"
                disabled={isLoading}
              >
                <option value="texto">Texto</option>
                <option value="imagem">Imagem</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caso (Referência) *</label>
              <input
                type="text"
                name="casoReferencia"
                value={formData.casoReferencia}
                onChange={handleChange}
                placeholder="Ex: CR-2025-001"
                className="w-full p-3 border border-gray-300 rounded-md"
                disabled={isLoading}
              />
            </div>
            {formData.tipo === "imagem" && (
              <div className="col-span-1 md:col-span-2">
                {editingEvidence?.imagemURL && !failedImages.has(editingEvidence._id) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Atual</label>
                    <Image
                      src={editingEvidence.imagemURL}
                      alt="Imagem Atual"
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded-md"
                      onError={() => setFailedImages(prev => new Set(prev).add(editingEvidence._id))}
                    />
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingEvidence ? "Nova Imagem (opcional)" : "Imagem *"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  disabled={isLoading}
                />
                {formData.filePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prévia da Nova Imagem</label>
                    <Image
                      src={formData.filePreview}
                      alt="Prévia da Nova Imagem"
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4">
            {editingEvidence && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                disabled={isLoading}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Carregando..." : editingEvidence ? "Salvar Alterações" : "Adicionar Evidência"}
            </button>
          </div>
        </form>
      </div>

      {/* Campo de pesquisa */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar evidências..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
      </div>

      {/* Listagem */}
      <div className="space-y-12">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Evidências de Texto</h2>
          {textEvidences.length === 0 ? (
            <p className="text-gray-600">Nenhuma evidência de texto encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {textEvidences.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md"
                >
                  {/* Conteúdo */}
                  <div className="mt-4 flex space-x-3">
                    <button onClick={() => handleEditEvidence(item)} className="text-teal-500 hover:text-teal-700">
                      <FaEdit className="text-xl" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700">
                      <FaTrash className="text-xl" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Evidências de Imagem</h2>
          {imageEvidences.length === 0 ? (
            <p className="text-gray-600">Nenhuma evidência de imagem encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imageEvidences.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md"
                >
                  {/* Conteúdo */}
                  <div className="mt-4 flex space-x-3">
                    <button onClick={() => handleEditEvidence(item)} className="text-teal-500 hover:text-teal-700">
                      <FaEdit className="text-xl" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700">
                      <FaTrash className="text-xl" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Paginação */}
      {pagination.totalPaginas > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePaginationChange(pagination.paginaAtual - 1)}
            disabled={pagination.paginaAtual === 1}
            className="text-gray-500 disabled:text-gray-300 px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
          >
            Anterior
          </button>
          <span className="text-gray-700">
            Página {pagination.paginaAtual} de {pagination.totalPaginas}
          </span>
          <button
            onClick={() => handlePaginationChange(pagination.paginaAtual + 1)}
            disabled={pagination.paginaAtual === pagination.totalPaginas}
            className="text-gray-500 disabled:text-gray-300 px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}