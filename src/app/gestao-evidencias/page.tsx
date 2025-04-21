"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import api from "@/lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { Evidence, EvidenceListResponse } from "@/types/Evidence";
import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";

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
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvidences = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      console.log("Buscando evidências com params:", {
        page: pagination.paginaAtual,
        limit: pagination.porPagina,
        casoReferencia: searchCasoReferencia || undefined,
      });
      const response = await api.get<EvidenceListResponse>("/api/evidence", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.paginaAtual,
          limit: pagination.porPagina,
          casoReferencia: searchCasoReferencia || undefined,
        },
      });

      console.log("Resposta do GET /api/evidence:", response.data);
      setEvidences(response.data.evidencias);
      console.log("Evidências após setEvidences:", response.data.evidencias);
      setPagination(response.data.paginacao);
      setError("");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(
        axiosError.response?.data?.msg || `Erro ao buscar evidências do servidor: ${axiosError.message}`
      );
      console.error("Erro ao buscar evidências:", axiosError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchEvidences();
    }
  }, [user, authLoading, pagination.paginaAtual, pagination.porPagina, searchCasoReferencia]);

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
      setError(
        axiosError.response?.data?.msg || "Erro ao excluir a evidência."
      );
    }
  };

  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      paginaAtual: page,
    }));
  };

  const textEvidences = useMemo(
    () => evidences.filter((item) => item.tipoEvidencia === "texto"),
    [evidences]
  );
  const imageEvidences = useMemo(
    () => evidences.filter((item) => item.tipoEvidencia === "imagem"),
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
          onClick={() => router.push("/cadastrarEvidencia")}
          className="bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition"
        >
          Nova Evidência
        </button>
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
          <button
            onClick={() => {
              setSearchCasoReferencia("");
              setPagination((prev) => ({ ...prev, paginaAtual: 1 }));
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpar
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {isLoading ? (
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
                        : `${item.coletadoPor.nome} (${item.coletadoPor.email})`}
                    </p>
                    <p className="text-gray-700">
                      <strong>Data de Upload:</strong>{" "}
                      {new Date(item.dataUpload).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="mt-4 flex space-x-3">
                      <Link
                        href={`/editar-evidencia/${item._id}`}
                        className="text-teal-500 hover:text-teal-700"
                      >
                        <FaEdit className="text-xl" />
                      </Link>
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
                      <Image
                        src={item.imagemURL}
                        alt="Evidência"
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
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
                        : `${item.coletadoPor.nome} (${item.coletadoPor.email})`}
                    </p>
                    <p className="text-gray-700">
                      <strong>Data de Upload:</strong>{" "}
                      {new Date(item.dataUpload).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="mt-4 flex space-x-3">
                      <Link
                        href={`/editar-evidencia/${item._id}`}
                        className="text-teal-500 hover:text-teal-700"
                      >
                        <FaEdit className="text-xl" />
                      </Link>
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