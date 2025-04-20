"use client";

import { useState, useMemo, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import api from "@/lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { Evidence, EvidenceListResponse } from "@/types/Evidence";
import { User } from "@/types/User";
import Link from "next/link";

export default function EvidenceManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, t] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [searchCasoReferencia, setSearchCasoReferencia] = useState<string>("");

  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [editCasoReferencia, setEditCasoReferencia] = useState("");
  const [editCategoria, setEditCategoria] = useState("");
  const [editVitima, setEditVitima] = useState<"identificada" | "não identificada">("identificada");
  const [editSexo, setEditSexo] = useState<"masculino" | "feminino" | "indeterminado">("masculino");
  const [editEstadoCorpo, setEditEstadoCorpo] = useState<
    "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto"
  >("inteiro");
  const [editLesoes, setEditLesoes] = useState("");
  const [editColetadoPor, setEditColetadoPor] = useState("");
  const [editLaudo, setEditLaudo] = useState("");
  const [editConteudo, setEditConteudo] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      const perfilLower = user.perfil.toLowerCase() as Lowercase<User["perfil"]>;
      if (!["admin", "perito", "assistente"].includes(perfilLower)) {
        router.push("/initialScreen");
      }
    }
  }, [user, authLoading, router]);

  const fetchEvidences = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get<EvidenceListResponse>("/api/evidence", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          casoReferencia: searchCasoReferencia || undefined,
        },
      });
      setEvidences(response.data.evidencias);
      setTotalPages(response.data.paginacao.totalPaginas);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.msg || "Erro ao carregar as evidências.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || authLoading) return;
    fetchEvidences();
  }, [user, authLoading, currentPage, itemsPerPage, searchCasoReferencia]);

  const textEvidences = useMemo(
    () => evidences.filter((item) => item.tipoEvidencia === "texto"),
    [evidences]
  );
  const imageEvidences = useMemo(
    () => evidences.filter((item) => item.tipoEvidencia === "imagem"),
    [evidences]
  );

  const handleDelete = async (id: string) => {
    if (confirm("Você tem certeza que deseja excluir esta evidência?")) {
      try {
        const token = localStorage.getItem("authToken");
        const res = await api.delete(`/api/evidence/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchEvidences();
        setSuccessMessage(res.data.msg || "Evidência excluída com sucesso.");
      } catch (err: any) {
        setErrorMessage(err.response?.data?.msg || "Erro ao excluir a evidência.");
      }
    }
  };

  const handleEdit = (id: string) => {
    const evidenceToEdit = evidences.find((item) => item._id === id);
    if (evidenceToEdit) {
      setEditingEvidence(evidenceToEdit);
      setEditCasoReferencia(evidenceToEdit.casoReferencia);
      setEditCategoria(evidenceToEdit.categoria);
      setEditVitima(evidenceToEdit.vitima);
      setEditSexo(evidenceToEdit.sexo);
      setEditEstadoCorpo(evidenceToEdit.estadoCorpo);
      setEditLesoes(evidenceToEdit.lesoes || "");
      setEditColetadoPor(evidenceToEdit.coletadoPor.nome);
      setEditLaudo(evidenceToEdit.laudo || "");
      setEditConteudo(evidenceToEdit.conteudo || "");
    }
  };

  const confirmEdit = async () => {
    if (editingEvidence) {
      const updatedEvidence = {
        casoReferencia: editCasoReferencia,
        tipoEvidencia: editingEvidence.tipoEvidencia,
        categoria: editCategoria,
        vitima: editVitima,
        sexo: editSexo,
        estadoCorpo: editEstadoCorpo,
        lesoes: editLesoes || undefined,
        coletadoPor: editColetadoPor,
        laudo: editLaudo || undefined,
        conteudo: editingEvidence.tipoEvidencia === "texto" ? editConteudo : undefined,
      };

      try {
        const token = localStorage.getItem("authToken");
        const res = await api.put(`/api/evidence/${editingEvidence._id}`, updatedEvidence, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchEvidences();
        setEditingEvidence(null);
        setSuccessMessage(res.data.msg || "Evidência atualizada com sucesso.");
      } catch (err: any) {
        setErrorMessage(err.response?.data?.msg || "Erro ao atualizar a evidência.");
      }
    }
  };

  const cancelEdit = () => {
    setEditingEvidence(null);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const renderEvidenceGroup = (title: string, evidenceList: Evidence[]) => (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
      {evidenceList.length === 0 ? (
        <p className="text-gray-500">Nenhuma evidência neste grupo.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {evidenceList.map((item) => (
            <li
              key={item._id}
              className="py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50 transition p-2 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">Caso: {item.casoReferencia}</p>
                <p className="text-sm text-gray-500">
                  Categoria: {item.categoria}
                  <br />
                  Data de Upload: {new Date(item.dataUpload).toLocaleDateString()}
                  <br />
                  Vítima: {item.vitima} | Sexo: {item.sexo} | Estado do Corpo: {item.estadoCorpo}
                  {item.lesoes && (
                    <>
                      <br />
                      Lesões: {item.lesoes}
                    </>
                  )}
                  <br />
                  Coletado por: {item.coletadoPor.nome} ({item.coletadoPor.email})
                  {item.tipoEvidencia === "texto" && item.conteudo && (
                    <>
                      <br />
                      Conteúdo: {item.conteudo}
                    </>
                  )}
                  {item.tipoEvidencia === "imagem" && item.imagemURL && (
                    <>
                      <br />
                      Imagem:{" "}
                      <a
                        href={item.imagemURL}
                        target="_blank"
                        className="text-teal-500 hover:underline"
                      >
                        {item.imagemURL}
                      </a>
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
                  onClick={() => handleEdit(item._id)}
                  className="text-teal-500 hover:text-teal-700 transition"
                  title="Editar Evidência"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
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

  if (authLoading || isLoading) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  if (!user || !["admin", "perito", "assistente"].includes(user.perfil.toLowerCase())) {
    return null;
  }

  if (authError || errorMessage) {
    return <div className="text-center mt-20 text-red-600">{authError || errorMessage}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pt-28 p-4 md:p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 transition p-2"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestão de Evidências</h1>
        </div>
        <Link
          href="/cadastrar-evidencia"
          className="flex items-center gap-2 bg-teal-500 text-white py-2 px-4 rounded-xl hover:bg-teal-700 transition"
        >
          <FaPlus size={16} />
          Nova Evidência
        </Link>
      </div>

      <div className="mb-6">
        <Input
          label="Filtrar por Caso (Referência)"
          value={searchCasoReferencia}
          placeholder="Ex: CR-2025-001"
          onChange={(e) => setSearchCasoReferencia(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {successMessage && <p className="text-green-500 mb-6">{successMessage}</p>}
      {renderEvidenceGroup("Evidências de Texto", textEvidences)}
      {renderEvidenceGroup("Evidências de Imagem", imageEvidences)}

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <FaChevronLeft size={20} />
        </button>
        <span className="text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      {editingEvidence && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 sm:mx-auto z-10 shadow-xl overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">Editar Evidência</h2>
            <form className="space-y-4">
              <Input
                label="Caso (Referência)"
                value={editCasoReferencia}
                onChange={(e) => setEditCasoReferencia(e.target.value)}
              />
              <Input
                label="Categoria"
                value={editCategoria}
                onChange={(e) => setEditCategoria(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Vítima"
                  value={editVitima}
                  onChange={(e) =>
                    setEditVitima(e.target.value as "identificada" | "não identificada")
                  }
                  options={["identificada", "não identificada"]}
                />
                <Select
                  label="Sexo"
                  value={editSexo}
                  onChange={(e) =>
                    setEditSexo(e.target.value as "masculino" | "feminino" | "indeterminado")
                  }
                  options={["masculino", "feminino", "indeterminado"]}
                />
              </div>
              <Select
                label="Estado do Corpo"
                value={editEstadoCorpo}
                onChange={(e) =>
                  setEditEstadoCorpo(
                    e.target.value as
                      | "inteiro"
                      | "fragmentado"
                      | "carbonizado"
                      | "putrefacto"
                      | "esqueleto"
                  )
                }
                options={["inteiro", "fragmentado", "carbonizado", "putrefacto", "esqueleto"]}
              />
              <Input
                label="Lesões (opcional)"
                value={editLesoes}
                onChange={(e) => setEditLesoes(e.target.value)}
              />
              <Input
                label="Coletado por"
                value={editColetadoPor}
                onChange={(e) => setEditColetadoPor(e.target.value)}
              />
              {editingEvidence.tipoEvidencia === "texto" && (
                <Textarea
                  label="Conteúdo"
                  value={editConteudo}
                  onChange={(e) => setEditConteudo(e.target.value)}
                />
              )}
              <Input
                label="Laudo (opcional)"
                value={editLaudo}
                onChange={(e) => setEditLaudo(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmEdit}
                  className="bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
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
  disabled = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
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
    <div>
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