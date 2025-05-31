"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useAuth } from "../providers/AuthProvider";
import Image from "next/image";

export default function EvidenceManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEvidenceId, setSubmittedEvidenceId] = useState<string | null>(null);

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

  // Estados para a vítima
  const [vitimaNome, setVitimaNome] = useState("");
  const [vitimaDataNascimento, setVitimaDataNascimento] = useState("");
  const [vitimaIdadeAproximada, setVitimaIdadeAproximada] = useState("");
  const [vitimaNacionalidade, setVitimaNacionalidade] = useState("");
  const [vitimaCidade, setVitimaCidade] = useState("");
  const [vitimaSexo, setVitimaSexo] = useState<"masculino" | "feminino" | "indeterminado">("masculino");
  const [vitimaEstadoCorpo, setVitimaEstadoCorpo] = useState<"inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto">("inteiro");
  const [vitimaLesoes, setVitimaLesoes] = useState("");
  const [vitimaIdentificada, setVitimaIdentificada] = useState(false);

  const isFormValid =
    formData.casoReferencia &&
    formData.categoria &&
    formData.coletadoPorNome &&
    vitimaSexo &&
    vitimaEstadoCorpo &&
    (formData.tipo === "texto" ? formData.conteudo : formData.file);

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
      const simulatedEvidenceId = "simulated-" + Math.random().toString(36).substring(2, 15);
      setSuccess("Evidência adicionada com sucesso (simulado).");
      setSubmittedEvidenceId(simulatedEvidenceId);
      setFormData({
        casoReferencia: "",
        tipo: "texto",
        categoria: "",
        coletadoPorNome: "",
        conteudo: "",
        file: null,
        filePreview: null,
      });
      setVitimaNome("");
      setVitimaDataNascimento("");
      setVitimaIdadeAproximada("");
      setVitimaNacionalidade("");
      setVitimaCidade("");
      setVitimaSexo("masculino");
      setVitimaEstadoCorpo("inteiro");
      setVitimaLesoes("");
      setVitimaIdentificada(false);
      setError("");
    } catch (err) {
      setError("Erro simulado ao adicionar a evidência.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-lg font-semibold text-gray-700">Adicionar Evidência</h2>
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
          {/* Seção de Dados da Evidência */}
          <h2 className="text-lg font-semibold text-gray-700">Dados da Evidência</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evidência *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 disabled:opacity-50"
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
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 placeholder-gray-500 disabled:opacity-50"
                disabled={isLoading}
              />
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
                ></textarea>
              </div>
            )}
            {formData.tipo === "imagem" && (
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem *</label>
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

          {/* Seção de Dados da Vítima */}
          <h2 className="text-lg font-semibold text-gray-700 mt-6">Dados da Vítima</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring focus:ring-teal-300 disabled:opacity-50"
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
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Carregando..." : "Adicionar Evidência"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}