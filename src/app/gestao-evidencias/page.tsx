"use client";

import { useState, useEffect, useMemo, ChangeEvent, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "@/lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { Evidence, EvidenceListResponse } from "@/types/Evidence";
import { IVitima, VitimaListResponse } from "@/types/Vitima";
import { ILaudo, LaudoListResponse } from "@/types/Laudo";
import { AxiosError } from "axios";
import Image from "next/image";

// Define the type for the query parameters
interface EvidenceQueryParams {
  page: number;
  limit: number;
  populate: string;
  dataInicio?: string;
  dataFim?: string;
  vitima?: "identificada" | "não identificada" | "";
  coletadoPor?: string;
  caso?: string;
  cidade?: string;
  estadoCorpo?: "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto" | "";
  lesoes?: string;
  sexo?: "masculino" | "feminino" | "indeterminado" | "";
}

// Define the type for filter options
interface FilterOptions {
  coletadoPor: string[];
  casos: string[];
  cidades: string[];
  lesoes: string[];
  sexos: string[];
}

export default function EvidenceManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

  const [evidences, setEvidences] = useState<(Evidence & { vitima?: IVitima })[]>([]);
  const [vitimas, setVitimas] = useState<IVitima[]>([]);
  const [laudoDetails, setLaudoDetails] = useState<ILaudo | null>(null);
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
  const [submittedEvidenceId, setSubmittedEvidenceId] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    coletadoPor: [],
    casos: [],
    cidades: [],
    lesoes: [],
    sexos: [],
  });

  // Filter states
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [statusFilter, setStatusFilter] = useState<"identificada" | "não identificada" | "">("");
  const [coletadoPorFilter, setColetadoPorFilter] = useState("");
  const [casoFilter, setCasoFilter] = useState("");
  const [cidadeFilter, setCidadeFilter] = useState("");
  const [estadoCorpoFilter, setEstadoCorpoFilter] = useState<
    "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto" | ""
  >("");
  const [lesoesFilter, setLesoesFilter] = useState("");
  const [sexoFilter, setSexoFilter] = useState<"masculino" | "feminino" | "indeterminado" | "">("");

  // Form states
  const [formData, setFormData] = useState({
    casoReferencia: "",
    tipo: "texto" as "imagem" | "texto",
    categoria: "",
    coletadoPorNome: "",
    conteudo: "",
    file: null as File | null,
    filePreview: null as string | null,
  });

  // Victim states
  const [selectedVitimaId, setSelectedVitimaId] = useState<string>("");
  const [vitimaNome, setVitimaNome] = useState("");
  const [vitimaDataNascimento, setVitimaDataNascimento] = useState("");
  const [vitimaIdadeAproximada, setVitimaIdadeAproximada] = useState("");
  const [vitimaNacionalidade, setVitimaNacionalidade] = useState("");
  const [vitimaCidade, setVitimaCidade] = useState("");
  const [vitimaSexo, setVitimaSexo] = useState<"masculino" | "feminino" | "indeterminado">("masculino");
  const [vitimaEstadoCorpo, setVitimaEstadoCorpo] = useState<
    "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto"
  >("inteiro");
  const [vitimaLesoes, setVitimaLesoes] = useState("");
  const [vitimaIdentificada, setVitimaIdentificada] = useState(false);
  const [editingVitimaId, setEditingVitimaId] = useState<string | null>(null);

  const isFormValid = useMemo(
    () =>
      formData.casoReferencia &&
      formData.categoria &&
      formData.coletadoPorNome &&
      selectedVitimaId &&
      (formData.tipo === "texto" ? formData.conteudo : true),
    [formData, selectedVitimaId]
  );

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await api.get<FilterOptions>("/api/evidence/filters", {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setFilterOptions(response.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao buscar opções de filtro.");
    }
  }, []);

  const fetchEvidences = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: EvidenceQueryParams = {
        page: pagination.paginaAtual,
        limit: pagination.porPagina,
        populate: "vitima",
      };

      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;
      if (statusFilter) params.vitima = statusFilter;
      if (coletadoPorFilter) params.coletadoPor = coletadoPorFilter;
      if (casoFilter) params.caso = casoFilter;
      if (cidadeFilter) params.cidade = cidadeFilter;
      if (estadoCorpoFilter) params.estadoCorpo = estadoCorpoFilter;
      if (lesoesFilter) params.lesoes = lesoesFilter;
      if (sexoFilter) params.sexo = sexoFilter;

      const response = await api.get<EvidenceListResponse>("/api/evidence", {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        params,
      });

      console.log("Fetched evidences:", response.data.evidencias); // Debug log
      setEvidences(response.data.evidencias);
      setPagination(response.data.paginacao);
      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao buscar evidências.");
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.paginaAtual,
    pagination.porPagina,
    dataInicio,
    dataFim,
    statusFilter,
    coletadoPorFilter,
    casoFilter,
    cidadeFilter,
    estadoCorpoFilter,
    lesoesFilter,
    sexoFilter,
  ]);

  const fetchVitimas = useCallback(async () => {
    try {
      const response = await api.get<VitimaListResponse>("/api/vitima", {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setVitimas(response.data.vitimas);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao buscar vítimas.");
    }
  }, []);

  const fetchLaudo = useCallback(async (evidenceId: string) => {
    try {
      const response = await api.get<LaudoListResponse>(`/api/laudo?evidencias=${evidenceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (response.data.laudos && response.data.laudos.length > 0) {
        setLaudoDetails(response.data.laudos[0]);
      } else {
        setLaudoDetails(null);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao buscar dados do laudo.");
    }
  }, []);

  const fetchEvidenceById = useCallback(async (evidenceId: string) => {
    try {
      const response = await api.get<Evidence & { vitima?: IVitima }>(`/api/evidence/${evidenceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      console.log("Fetched evidence by ID:", response.data); // Debug log
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao buscar evidência por ID.");
      return null;
    }
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      fetchEvidences();
      fetchVitimas();
      fetchFilterOptions();
    }
  }, [user, authLoading, fetchEvidences, fetchVitimas, fetchFilterOptions]);

  const handleEditEvidence = async (evidence: Evidence & { vitima?: IVitima }) => {
    console.log("Attempting to edit evidence with ID:", evidence._id); // Debug log
    const freshEvidence = await fetchEvidenceById(evidence._id);
    if (!freshEvidence) {
      setError("Evidência não encontrada ao tentar editar.");
      return;
    }

    setEditingEvidence(freshEvidence);
    try {
      const vitima = freshEvidence.vitima;

      if (!vitima) {
        setError("Não foi possível carregar os dados da vítima associada.");
        return;
      }

      setFormData({
        casoReferencia: freshEvidence.caso || "",
        tipo: freshEvidence.tipo,
        categoria: freshEvidence.categoria,
        coletadoPorNome: freshEvidence.coletadoPor,
        conteudo: freshEvidence.conteudo || "",
        file: null,
        filePreview: null,
      });

      setSelectedVitimaId(vitima._id);
      setEditingVitimaId(vitima._id);
      setVitimaNome(vitima.nome || "");
      setVitimaDataNascimento(vitima.dataNascimento || "");
      setVitimaIdadeAproximada(vitima.idadeAproximada ? vitima.idadeAproximada.toString() : "");
      setVitimaNacionalidade(vitima.nacionalidade || "");
      setVitimaCidade(vitima.cidade || "");
      setVitimaSexo(vitima.sexo || "masculino");
      setVitimaEstadoCorpo(vitima.estadoCorpo || "inteiro");
      setVitimaLesoes(vitima.lesoes || "");
      setVitimaIdentificada(vitima.identificada || false);

      await fetchLaudo(freshEvidence._id);

      setError("");
      setSuccess("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao buscar dados da vítima ou laudo.");
    }
  };

  const handleCancelEdit = () => {
    setEditingEvidence(null);
    setFormData({
      casoReferencia: "",
      tipo: "texto",
      categoria: "",
      coletadoPorNome: "",
      conteudo: "",
      file: null,
      filePreview: null,
    });
    setSelectedVitimaId("");
    setVitimaNome("");
    setVitimaDataNascimento("");
    setVitimaIdadeAproximada("");
    setVitimaNacionalidade("");
    setVitimaCidade("");
    setVitimaSexo("masculino");
    setVitimaEstadoCorpo("inteiro");
    setVitimaLesoes("");
    setVitimaIdentificada(false);
    setEditingVitimaId(null);
    setLaudoDetails(null);
    setError("");
    setSuccess("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        setFormData({ ...formData, file: null, filePreview: null });
        return;
      }
      const previewURL = URL.createObjectURL(selectedFile);
      setFormData({ ...formData, file: selectedFile, filePreview: previewURL });
      setError("");
    } else {
      setFormData({ ...formData, file: null, filePreview: null });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const data = new FormData();
      data.append("casoReferencia", formData.casoReferencia);
      data.append("tipo", formData.tipo);
      data.append("categoria", formData.categoria);
      data.append("coletadoPor", formData.coletadoPorNome);
      if (formData.tipo === "texto" && formData.conteudo) data.append("conteudo", formData.conteudo);

      if (editingVitimaId) {
        data.append("vitimaId", editingVitimaId);
        data.append("nome", vitimaNome || "");
        data.append("dataNascimento", vitimaDataNascimento || "");
        data.append("idadeAproximada", vitimaIdadeAproximada || "");
        data.append("nacionalidade", vitimaNacionalidade || "");
        data.append("cidade", vitimaCidade || "");
        data.append("sexo", vitimaSexo);
        data.append("estadoCorpo", vitimaEstadoCorpo);
        data.append("lesoes", vitimaLesoes || "");
        data.append("identificada", vitimaIdentificada.toString());
        if (formData.tipo === "imagem" && formData.file) data.append("file", formData.file);
      } else {
        data.append("vitima", selectedVitimaId);
      }

      let response;
      if (editingEvidence) {
        response = await api.put<Evidence>(`/api/evidence/${editingEvidence._id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        response = await api.post<Evidence>("/api/evidence", data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      console.log("Submit response:", response.data); // Debug log
      setSuccess(editingEvidence ? "Evidência atualizada com sucesso." : "Evidência adicionada com sucesso.");
      setSubmittedEvidenceId(editingEvidence ? editingEvidence._id : response.data._id);
      await fetchEvidences();
      await fetchVitimas();
      handleCancelEdit();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      console.error("Submit error:", axiosError.response?.data); // Debug log
      setError(axiosError.response?.data?.msg || `Erro ao ${editingEvidence ? "atualizar" : "adicionar"} a evidência.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta evidência?")) return;

    try {
      await api.delete(`/api/evidence/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      await fetchEvidences();
      setSuccess("Evidência deletada com sucesso.");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao excluir a evidência.");
    }
  };

  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({ ...prev, paginaAtual: page }));
  };

  const filteredEvidences = useMemo(() => evidences, [evidences]);

  const textEvidences = useMemo(
    () => filteredEvidences.filter((item) => item.tipo?.toLowerCase().trim() === "texto"),
    [filteredEvidences]
  );

  const imageEvidences = useMemo(
    () => filteredEvidences.filter((item) => item.tipo?.toLowerCase().trim() === "imagem"),
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

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            {editingEvidence ? "Editar Evidência" : "Adicionar Evidência"}
          </h2>
          <button
            onClick={() => router.push("/cadastrarEvidencia")}
            className="flex items-center gap-2 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition"
          >
            <FaPlus />
            Nova Evidência
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && submittedEvidenceId && (
          <div className="space-y-4">
            <p className="text-green-500">{success}</p>
            <button
              onClick={() => router.push(`/gerar-laudo/${submittedEvidenceId}`)}
              className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition"
            >
              Gerar Laudo
            </button>
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-gray-700">Dados da Evidência</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evidência *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 disabled:opacity-50"
                disabled={isLoading || !!editingEvidence}
              >
                <option value="texto">Texto</option>
                <option value="imagem">Imagem</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caso (Referência) *</label>
              <select
                name="casoReferencia"
                value={formData.casoReferencia}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Selecione um caso</option>
                {filterOptions.casos.map((caso) => (
                  <option key={caso} value={caso}>
                    {caso}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <input
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Ex: Radiografia Panorâmica"
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coletado por (Nome) *</label>
              <input
                type="text"
                name="coletadoPorNome"
                value={formData.coletadoPorNome}
                onChange={handleChange}
                placeholder="Ex: Dra. Helena Costa"
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
            {formData.tipo === "texto" && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
                <textarea
                  name="conteudo"
                  value={formData.conteudo}
                  onChange={handleChange}
                  placeholder="Relatório textual sobre a arcada dentária"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mt-6">Dados da Vítima</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Vítima Existente *</label>
              <select
                value={selectedVitimaId}
                onChange={(e) => {
                  setSelectedVitimaId(e.target.value);
                  setEditingVitimaId(e.target.value);
                  const vitima = vitimas.find((v) => v._id === e.target.value);
                  if (vitima) {
                    setVitimaNome(vitima.nome || "");
                    setVitimaDataNascimento(vitima.dataNascimento || "");
                    setVitimaIdadeAproximada(vitima.idadeAproximada ? vitima.idadeAproximada.toString() : "");
                    setVitimaNacionalidade(vitima.nacionalidade || "");
                    setVitimaCidade(vitima.cidade || "");
                    setVitimaSexo(vitima.sexo || "masculino");
                    setVitimaEstadoCorpo(vitima.estadoCorpo || "inteiro");
                    setVitimaLesoes(vitima.lesoes || "");
                    setVitimaIdentificada(vitima.identificada || false);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring focus:ring-teal-300 disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Selecione uma vítima</option>
                {vitimas.map((vitima) => (
                  <option key={vitima._id} value={vitima._id}>
                    {vitima.nome || "Não identificada"} ({vitima.estadoCorpo})
                  </option>
                ))}
              </select>
            </div>

            {editingVitimaId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Vítima</label>
                  <input
                    type="text"
                    value={vitimaNome}
                    onChange={(e) => setVitimaNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={vitimaDataNascimento}
                    onChange={(e) => setVitimaDataNascimento(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade Aproximada</label>
                  <input
                    type="number"
                    value={vitimaIdadeAproximada}
                    onChange={(e) => setVitimaIdadeAproximada(e.target.value)}
                    placeholder="Ex: 30"
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidade</label>
                  <input
                    type="text"
                    value={vitimaNacionalidade}
                    onChange={(e) => setVitimaNacionalidade(e.target.value)}
                    placeholder="Ex: Brasileira"
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={vitimaCidade}
                    onChange={(e) => setVitimaCidade(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
                  <select
                    value={vitimaSexo}
                    onChange={(e) => setVitimaSexo(e.target.value as "masculino" | "feminino" | "indeterminado")}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="indeterminado">Indeterminado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado do Corpo *</label>
                  <select
                    value={vitimaEstadoCorpo}
                    onChange={(e) =>
                      setVitimaEstadoCorpo(
                        e.target.value as "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto"
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <option value="inteiro">Inteiro</option>
                    <option value="fragmentado">Fragmentado</option>
                    <option value="carbonizado">Carbonizado</option>
                    <option value="putrefacto">Putrefacto</option>
                    <option value="esqueleto">Esqueleto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesões</label>
                  <input
                    type="text"
                    value={vitimaLesoes}
                    onChange={(e) => setVitimaLesoes(e.target.value)}
                    placeholder="Ex: Fratura no osso maxilar"
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identificada</label>
                  <input
                    type="checkbox"
                    checked={vitimaIdentificada}
                    onChange={(e) => setVitimaIdentificada(e.target.checked)}
                    className="p-3 border border-gray-300 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
                {editingVitimaId && formData.tipo === "imagem" && (
                  <div className="col-span-1 md:col-span-2">
                    {editingVitimaId &&
                      editingEvidence?.vitima?.imagens &&
                      editingEvidence.vitima.imagens.length > 0 &&
                      !failedImages.has(editingEvidence._id) && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Atual</label>
                          <Image
                            src={editingEvidence.vitima.imagens[0]}
                            alt="Imagem Atual"
                            width={200}
                            height={200}
                            className="w-full h-48 object-cover rounded-md"
                            onError={() => setFailedImages((prev) => new Set(prev).add(editingEvidence._id))}
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
              </>
            )}
          </div>

          {editingEvidence && laudoDetails && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700">Dados do Laudo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação</label>
                  <input
                    type="text"
                    value={new Date(laudoDetails.dataCriacao).toLocaleDateString("pt-BR")}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            {editingEvidence && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition"
                disabled={isLoading}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Carregando..." : editingEvidence ? "Salvar Alterações" : "Adicionar Evidência"}
            </button>
          </div>
        </form>
      </div>

      <div className="mb-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Filtrar Evidências</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status da Vítima</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "identificada" | "não identificada" | "")}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              <option value="identificada">Identificada</option>
              <option value="não identificada">Não Identificada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coletado Por</label>
            <select
              value={coletadoPorFilter}
              onChange={(e) => setColetadoPorFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              {filterOptions.coletadoPor.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caso de Referência</label>
            <select
              value={casoFilter}
              onChange={(e) => setCasoFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              {filterOptions.casos.map((caso) => (
                <option key={caso} value={caso}>
                  {caso}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <select
              value={cidadeFilter}
              onChange={(e) => setCidadeFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              {filterOptions.cidades.map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado do Corpo</label>
            <select
              value={estadoCorpoFilter}
              onChange={(e) =>
                setEstadoCorpoFilter(
                  e.target.value as "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto" | ""
                )
              }
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              <option value="inteiro">Inteiro</option>
              <option value="fragmentado">Fragmentado</option>
              <option value="carbonizado">Carbonizado</option>
              <option value="putrefacto">Putrefacto</option>
              <option value="esqueleto">Esqueleto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lesões</label>
            <select
              value={lesoesFilter}
              onChange={(e) => setLesoesFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              {filterOptions.lesoes.map((lesao) => (
                <option key={lesao} value={lesao}>
                  {lesao}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <select
              value={sexoFilter}
              onChange={(e) =>
                setSexoFilter(e.target.value as "masculino" | "feminino" | "indeterminado" | "")
              }
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              {filterOptions.sexos.map((sexo) => (
                <option key={sexo} value={sexo}>
                  {sexo}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setDataInicio("");
            setDataFim("");
            setStatusFilter("");
            setColetadoPorFilter("");
            setCasoFilter("");
            setCidadeFilter("");
            setEstadoCorpoFilter("");
            setLesoesFilter("");
            setSexoFilter("");
          }}
          className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition"
        >
          Limpar Filtros
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-600">Carregando evidências...</p>
      ) : (
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
                    className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-gray-700">
                      <strong>Caso:</strong> {item.caso}
                    </p>
                    <p className="text-gray-700">
                      <strong>Categoria:</strong> {item.categoria}
                    </p>
                    <p className="text-gray-700">
                      <strong>Conteúdo:</strong>{" "}
                      {item.conteudo ? item.conteudo.substring(0, 100) + "..." : "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Coletado por:</strong> {item.coletadoPor || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Data de Upload:</strong>{" "}
                      {new Date(item.dataUpload).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-gray-700">
                      <strong>Vítima:</strong> {item.vitima?.nome || "Não identificada"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Sexo:</strong> {item.vitima?.sexo || "Indeterminado"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Estado do Corpo:</strong> {item.vitima?.estadoCorpo || "Inteiro"}
                    </p>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleEditEvidence(item)}
                        className="text-teal-500 hover:text-teal-700"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
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
                    className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
                  >
                    {item.vitima?.imagens && item.vitima.imagens.length > 0 && !failedImages.has(item._id) ? (
                      <Image
                        src={item.vitima.imagens[0]}
                        alt="Evidência"
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        onError={() => {
                          setFailedImages((prev) => new Set(prev).add(item._id));
                        }}
                      />
                    ) : (
                      <p className="text-gray-600 mb-4">Imagem não disponível</p>
                    )}
                    <p className="text-gray-700">
                      <strong>Caso:</strong> {item.caso}
                    </p>
                    <p className="text-gray-700">
                      <strong>Categoria:</strong> {item.categoria}
                    </p>
                    <p className="text-gray-700">
                      <strong>Coletado por:</strong> {item.coletadoPor || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Data de Upload:</strong>{" "}
                      {new Date(item.dataUpload).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-gray-700">
                      <strong>Vítima:</strong> {item.vitima?.nome || "Não identificada"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Sexo:</strong> {item.vitima?.sexo || "Indeterminado"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Estado do Corpo:</strong> {item.vitima?.estadoCorpo || "Inteiro"}
                    </p>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleEditEvidence(item)}
                        className="text-teal-500 hover:text-teal-700"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {pagination.totalPaginas > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePaginationChange(pagination.paginaAtual - 1)}
            disabled={pagination.paginaAtual === 1}
            className="text-gray-500 disabled:text-gray-300 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Anterior
          </button>
          <span className="text-gray-700">
            Página {pagination.paginaAtual} de {pagination.totalPaginas}
          </span>
          <button
            onClick={() => handlePaginationChange(pagination.paginaAtual + 1)}
            disabled={pagination.paginaAtual === pagination.totalPaginas}
            className="text-gray-500 disabled:text-gray-300 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}