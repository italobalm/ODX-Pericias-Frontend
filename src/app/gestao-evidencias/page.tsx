"use client";

import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
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
  const [searchCasoReferencia, setSearchCasoReferencia] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);

  // Estados para os campos do formulário de edição
  const [casoReferencia, setCasoReferencia] = useState("");
  const [tipo, setTipo] = useState<"imagem" | "texto">("texto");
  const [categoria, setCategoria] = useState("");
  const [vitima, setVitima] = useState<"identificada" | "não identificada">("identificada");
  const [sexo, setSexo] = useState<"masculino" | "feminino" | "indeterminado">("masculino");
  const [estadoCorpo, setEstadoCorpo] = useState<
    "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto"
  >("inteiro");
  const [lesoes, setLesoes] = useState("");
  const [coletadoPorNome, setColetadoPorNome] = useState("");
  const [coletadoPorEmail, setColetadoPorEmail] = useState("");
  const [laudo, setLaudo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null); // Para prévia da nova imagem

  const isFormValid =
    casoReferencia &&
    categoria &&
    coletadoPorNome &&
    coletadoPorEmail &&
    (tipo === "texto" ? conteudo : true);

  const fetchEvidences = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get<EvidenceListResponse>("/api/evidence", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.paginaAtual,
          limit: pagination.porPagina,
          casoReferencia: searchCasoReferencia || undefined,
        },
      });

      setEvidences(response.data.evidencias);
      setPagination(response.data.paginacao);
      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(
        axiosError.response?.data?.msg || "Erro ao buscar evidências do servidor."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchEvidences();
    }
  }, [user, authLoading, pagination.paginaAtual, pagination.porPagina, searchCasoReferencia]);

  const handleEditEvidence = (evidence: Evidence) => {
    setEditingEvidence(evidence);
    setCasoReferencia(evidence.casoReferencia);
    setTipo(evidence.tipo);
    setCategoria(evidence.categoria);
    setVitima(evidence.vitima);
    setSexo(evidence.sexo);
    setEstadoCorpo(evidence.estadoCorpo);
    setLesoes(evidence.lesoes || "");
    setColetadoPorNome(
      typeof evidence.coletadoPor === "string"
        ? evidence.coletadoPor
        : evidence.coletadoPor?.nome || ""
    );
    setColetadoPorEmail(
      typeof evidence.coletadoPor === "string"
        ? ""
        : evidence.coletadoPor?.email || ""
    );
    setLaudo(evidence.laudo || "");
    setConteudo(evidence.conteudo || "");
    setFile(null);
    setFilePreview(null);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingEvidence(null);
    setCasoReferencia("");
    setTipo("texto");
    setCategoria("");
    setVitima("identificada");
    setSexo("masculino");
    setEstadoCorpo("inteiro");
    setLesoes("");
    setColetadoPorNome("");
    setColetadoPorEmail("");
    setLaudo("");
    setConteudo("");
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview); // Limpar a URL temporária para evitar vazamento de memória
      setFilePreview(null);
    }
    setError("");
    setSuccess("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      // Validar tipo de arquivo
      if (!selectedFile.type.startsWith("image/")) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        setFile(null);
        if (filePreview) {
          URL.revokeObjectURL(filePreview);
        }
        setFilePreview(null);
        return;
      }
      setFile(selectedFile);
      const previewURL = URL.createObjectURL(selectedFile);
      setFilePreview(previewURL);
      setError("");
    } else {
      setFile(null);
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      setFilePreview(null);
    }
  };

  const handleUpdateEvidence = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !editingEvidence) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    const formData = new FormData();
    formData.append("casoReferencia", casoReferencia);
    formData.append("tipo", tipo);
    formData.append("categoria", categoria);
    formData.append("vitima", vitima);
    formData.append("sexo", sexo);
    formData.append("estadoCorpo", estadoCorpo);
    if (lesoes) formData.append("lesoes", lesoes);
    formData.append("coletadoPor", JSON.stringify({ nome: coletadoPorNome, email: coletadoPorEmail }));
    if (tipo === "texto" && conteudo) formData.append("conteudo", conteudo);
    if (laudo) formData.append("laudo", laudo);
    if (tipo === "imagem" && file) formData.append("file", file);

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.put<Evidence>(`/api/evidence/${editingEvidence._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setEvidences((prev) =>
        prev.map((e) => (e._id === editingEvidence._id ? response.data : e))
      );
      setSuccess("Evidência atualizada com sucesso.");
      handleCancelEdit();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao atualizar a evidência.");
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
    setPagination((prev) => ({
      ...prev,
      paginaAtual: page,
    }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  const textEvidences = useMemo(
    () => evidences.filter((item) => item.tipo?.toLowerCase().trim() === "texto"),
    [evidences]
  );
  const imageEvidences = useMemo(
    () => evidences.filter((item) => item.tipo?.toLowerCase().trim() === "imagem"),
    [evidences]
  );

  if (authLoading) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  if (authError) {
    return (
      <div className="text-center mt-20 text-red-500">
        Erro de autenticação: {authError}. Por favor, tente fazer login novamente.
      </div>
    );
  }

  if (!user || !["admin", "perito", "assistente"].includes(user.perfil.toLowerCase())) {
    router.push("/initialScreen");
    return null;
  }

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12">
      <header className="w-full flex items-center justify-start mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-500 transition mr-3"
        >
          <FaArrowLeft className="text-2xl" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Evidências</h1>
      </header>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => router.push("/cadastrar-evidencia")}
          className="bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition"
        >
          Nova Evidência
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-10 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">
          {editingEvidence ? "Editar Evidência" : "Adicionar Nova Evidência"}
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        {editingEvidence && (
          <form className="space-y-4" onSubmit={handleUpdateEvidence}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Tipo de Evidência *"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "imagem" | "texto")}
                options={["texto", "imagem"]}
                disabled={isLoading}
              />
              <Input
                label="Caso (Referência) *"
                value={casoReferencia}
                placeholder="Ex: CR-2025-001"
                onChange={(e) => handleChange(e, setCasoReferencia)}
                disabled={isLoading}
              />
              <Input
                label="Categoria *"
                value={categoria}
                placeholder="Ex: Radiografia Panorâmica"
                onChange={(e) => handleChange(e, setCategoria)}
                disabled={isLoading}
              />
              <Select
                label="Vítima *"
                value={vitima}
                onChange={(e) =>
                  setVitima(e.target.value as "identificada" | "não identificada")
                }
                options={["identificada", "não identificada"]}
                disabled={isLoading}
              />
              <Select
                label="Sexo *"
                value={sexo}
                onChange={(e) =>
                  setSexo(e.target.value as "masculino" | "feminino" | "indeterminado")
                }
                options={["masculino", "feminino", "indeterminado"]}
                disabled={isLoading}
              />
              <Select
                label="Estado do Corpo *"
                value={estadoCorpo}
                onChange={(e) =>
                  setEstadoCorpo(
                    e.target.value as
                      | "inteiro"
                      | "fragmentado"
                      | "carbonizado"
                      | "putrefacto"
                      | "esqueleto"
                  )
                }
                options={["inteiro", "fragmentado", "carbonizado", "putrefacto", "esqueleto"]}
                disabled={isLoading}
              />
              <Input
                label="Lesões"
                value={lesoes}
                placeholder="Ex: Fratura no osso maxilar"
                onChange={(e) => handleChange(e, setLesoes)}
                disabled={isLoading}
              />
              <Input
                label="Coletado por (Nome) *"
                value={coletadoPorNome}
                placeholder="Ex: Dra. Helena Costa"
                onChange={(e) => handleChange(e, setColetadoPorNome)}
                disabled={isLoading}
              />
              <Input
                label="Coletado por (Email) *"
                value={coletadoPorEmail}
                placeholder="Ex: helena.costa@example.com"
                onChange={(e) => handleChange(e, setColetadoPorEmail)}
                type="email"
                disabled={isLoading}
              />
              {tipo === "texto" && (
                <Textarea
                  label="Conteúdo *"
                  value={conteudo}
                  placeholder="Relatório textual sobre a arcada dentária"
                  onChange={(e) => handleChange(e, setConteudo)}
                  disabled={isLoading}
                />
              )}
              {tipo === "imagem" && (
                <div className="col-span-1 md:col-span-2">
                  {/* Mostrar a imagem atual, se existir */}
                  {editingEvidence.imagemURL && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagem Atual
                      </label>
                      <Image
                        src={editingEvidence.imagemURL}
                        alt="Imagem Atual"
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          console.error("Erro ao carregar imagem atual:", editingEvidence.imagemURL);
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "block";
                        }}
                      />
                      <p
                        className="text-gray-600 mt-2"
                        style={{ display: "none" }}
                      >
                        Imagem atual não disponível
                      </p>
                    </div>
                  )}
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Imagem (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    disabled={isLoading}
                  />
                  {filePreview && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prévia da Nova Imagem
                      </label>
                      <Image
                        src={filePreview}
                        alt="Prévia da Nova Imagem"
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}
              <Input
                label="Laudo"
                value={laudo}
                placeholder="Texto do laudo pericial"
                onChange={(e) => handleChange(e, setLaudo)}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? "Carregando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mb-8">
        <div className="relative max-w-md mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por Caso (Referência)"
            value={searchCasoReferencia}
            onChange={(e) => {
              setSearchCasoReferencia(e.target.value);
              setPagination((prev) => ({ ...prev, paginaAtual: 1 }));
            }}
            className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-teal-300 placeholder-gray-500"
          />
          <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {isLoading && !editingEvidence ? (
        <p className="text-center text-gray-600">Carregando evidências...</p>
      ) : (
        <div className="space-y-12">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Evidências de Texto
            </h2>
            {textEvidences.length === 0 ? (
              <p className="text-gray-600">Nenhuma evidência neste grupo.</p>
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
                      <strong>Caso (Referência):</strong> {item.casoReferencia}
                    </p>
                    <p className="text-gray-700">
                      <strong>Categoria:</strong> {item.categoria}
                    </p>
                    <p className="text-gray-700">
                      <strong>Conteúdo:</strong>{" "}
                      {item.conteudo ? item.conteudo.substring(0, 100) + "..." : "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Coletado por:</strong>{" "}
                      {typeof item.coletadoPor === "string"
                        ? item.coletadoPor
                        : item.coletadoPor?.nome || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Data de Upload:</strong>{" "}
                      {new Date(item.dataUpload).toLocaleDateString("pt-BR")}
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Evidências de Imagem
            </h2>
            {imageEvidences.length === 0 ? (
              <p className="text-gray-600">Nenhuma evidência neste grupo.</p>
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
                    {item.imagemURL ? (
                      <>
                        <Image
                          src={item.imagemURL}
                          alt="Evidência"
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover rounded-md mb-4"
                          onError={(e) => {
                            console.error("Erro ao carregar imagem:", item.imagemURL);
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "block";
                          }}
                        />
                        <p
                          className="text-gray-600 mb-4"
                          style={{ display: "none" }}
                        >
                          Não foi possível carregar a imagem. Verifique o URL ou tente novamente.
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-600 mb-4">Imagem não disponível</p>
                    )}
                    <p className="text-gray-700">
                      <strong>Caso (Referência):</strong> {item.casoReferencia}
                    </p>
                    <p className="text-gray-700">
                      <strong>Categoria:</strong> {item.categoria}
                    </p>
                    <p className="text-gray-700">
                      <strong>Coletado por:</strong>{" "}
                      {typeof item.coletadoPor === "string"
                        ? item.coletadoPor
                        : item.coletadoPor?.nome || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Data de Upload:</strong>{" "}
                      {new Date(item.dataUpload).toLocaleDateString("pt-BR")}
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
            className="text-gray-500 disabled:text-gray-300 px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            Anterior
          </button>
          <span className="text-gray-700">
            Página {pagination.paginaAtual} de {pagination.totalPaginas}
          </span>
          <button
            onClick={() => handlePaginationChange(pagination.paginaAtual + 1)}
            disabled={pagination.paginaAtual === pagination.totalPaginas}
            className="text-gray-500 disabled:text-gray-300 px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
        disabled={disabled}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  placeholder,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="col-span-1 md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
        rows={4}
        disabled={disabled}
      ></textarea>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-teal-300 disabled:opacity-50"
        disabled={disabled}
      >
        <option value="">Selecione uma opção</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}