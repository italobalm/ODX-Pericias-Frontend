"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import api from "@/lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { Evidence, EvidenceListResponse } from "@/types/Evidence";
import { IVitima, VitimaListResponse } from "@/types/Vitima";
import { AxiosError } from "axios";
import Image from "next/image";

interface FilterOptions {
  coletadoPor: string[];
  casos: string[];
  cidades: string[];
  lesoes: string[];
  sexos: string[];
}

export default function NewEvidencePage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

  // Estados para a evidência
  const [casoReferencia, setCasoReferencia] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    coletadoPor: [],
    casos: [],
    cidades: [],
    lesoes: [],
    sexos: [],
  });
  const [tipo, setTipo] = useState<"imagem" | "texto">("texto");
  const [categoria, setCategoria] = useState("");
  const [coletadoPor, setColetadoPor] = useState("");
  const [texto, setTexto] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Estados para a vítima
  const [vitimas, setVitimas] = useState<IVitima[]>([]);
  const [selectedVitimaId, setSelectedVitimaId] = useState<string>("");
  const [createNewVitima, setCreateNewVitima] = useState(false);
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
  const [existingEvidences, setExistingEvidences] = useState<Evidence[]>([]);

  // Estados gerais
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validação do formulário
  const isFormValid =
    casoReferencia &&
    categoria &&
    coletadoPor &&
    (tipo === "texto" ? texto : file) &&
    (createNewVitima
      ? vitimaSexo && vitimaEstadoCorpo
      : selectedVitimaId);

  // Buscar vítimas, opções de filtro e evidências existentes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");

        // Buscar vítimas
        const vitimaResponse = await api.get<VitimaListResponse>("/api/vitima", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVitimas(vitimaResponse.data.data || []);

        // Buscar opções de filtro
        const filterResponse = await api.get<FilterOptions>("/api/evidence/filters", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Resposta de /api/evidence/filters:", filterResponse.data);
        setFilterOptions({
          coletadoPor: Array.isArray(filterResponse.data.coletadoPor) ? filterResponse.data.coletadoPor : [],
          casos: Array.isArray(filterResponse.data.casos) ? filterResponse.data.casos : [],
          cidades: Array.isArray(filterResponse.data.cidades) ? filterResponse.data.cidades : [],
          lesoes: Array.isArray(filterResponse.data.lesoes) ? filterResponse.data.lesoes : [],
          sexos: Array.isArray(filterResponse.data.sexos) ? filterResponse.data.sexos : [],
        });

        setError("");
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{ msg?: string }>;
        setError(axiosError.response?.data?.msg || "Erro ao buscar dados (vítimas ou filtros).");
        setVitimas([]);
        setFilterOptions({
          coletadoPor: [],
          casos: [],
          cidades: [],
          lesoes: [],
          sexos: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  // Buscar evidências existentes quando vítima é selecionada
  useEffect(() => {
    const fetchEvidences = async () => {
      if (selectedVitimaId && !createNewVitima) {
        setIsLoading(true);
        try {
          const response = await api.get<EvidenceListResponse>("/api/evidence", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            params: { vitima: selectedVitimaId },
          });
          setExistingEvidences(response.data.evidencias || []);
          setError("");
        } catch (err: unknown) {
          const axiosError = err as AxiosError<{ msg?: string }>;
          setError(axiosError.response?.data?.msg || "Erro ao buscar evidências existentes.");
          setExistingEvidences([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setExistingEvidences([]);
      }
    };
    fetchEvidences();
  }, [selectedVitimaId, createNewVitima]);

  // Limpar filePreview quando o componente for desmontado ou o formulário for resetado
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        setFile(null);
        setFilePreview(null);
        return;
      }
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setError("");
    } else {
      setFile(null);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("casoReferencia", casoReferencia);
      formData.append("tipo", tipo);
      formData.append("categoria", categoria);
      formData.append("coletadoPor", coletadoPor);
      if (tipo === "texto" && texto) formData.append("texto", texto);
      if (tipo === "imagem" && file) formData.append("file", file);

      if (createNewVitima) {
        if (vitimaNome) formData.append("nome", vitimaNome);
        if (vitimaDataNascimento) formData.append("dataNascimento", vitimaDataNascimento);
        if (vitimaIdadeAproximada) formData.append("idadeAproximada", vitimaIdadeAproximada);
        if (vitimaNacionalidade) formData.append("nacionalidade", vitimaNacionalidade);
        if (vitimaCidade) formData.append("cidade", vitimaCidade);
        formData.append("sexo", vitimaSexo);
        formData.append("estadoCorpo", vitimaEstadoCorpo);
        if (vitimaLesoes) formData.append("lesoes", vitimaLesoes);
        formData.append("identificada", vitimaIdentificada.toString());
      } else {
        formData.append("vitimaId", selectedVitimaId);
      }


    await api.post("/api/evidence", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "multipart/form-data",
      },
    });


      setSuccess("Evidência cadastrada com sucesso!");
      setError("");
      setCasoReferencia("");
      setTipo("texto");
      setCategoria("");
      setColetadoPor("");
      setTexto("");
      setFile(null);
      setFilePreview(null);
      setSelectedVitimaId("");
      setCreateNewVitima(false);
      setVitimaNome("");
      setVitimaDataNascimento("");
      setVitimaIdadeAproximada("");
      setVitimaNacionalidade("");
      setVitimaCidade("");
      setVitimaSexo("masculino");
      setVitimaEstadoCorpo("inteiro");
      setVitimaLesoes("");
      setVitimaIdentificada(false);
      setExistingEvidences([]);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao cadastrar evidência.");
      console.error("Erro ao processar evidência:", axiosError.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

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
        <h1 className="text-3xl font-bold text-gray-800">Nova Evidência</h1>
      </header>

      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Seção de Dados da Evidência */}
              <h2 className="text-lg font-semibold text-gray-700">Dados da Evidência</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Tipo de Evidência *"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as "imagem" | "texto")}
                  options={["texto", "imagem"]}
                  disabled={isLoading}
                />
                <Select
                  label="Caso (Referência) *"
                  value={casoReferencia}
                  onChange={(e) => handleChange(e, setCasoReferencia)}
                  options={filterOptions.casos}
                  disabled={isLoading || filterOptions.casos.length === 0}
                />
                <Input
                  label="Categoria *"
                  value={categoria}
                  placeholder="Ex: Radiografia Panorâmica"
                  onChange={(e) => handleChange(e, setCategoria)}
                  disabled={isLoading}
                />
                <Select
                  label="Coletado por (Nome) *"
                  value={coletadoPor}
                  onChange={(e) => handleChange(e, setColetadoPor)}
                  options={filterOptions.coletadoPor}
                  disabled={isLoading}
                />
                {tipo === "texto" && (
                  <Textarea
                    label="Texto *"
                    value={texto}
                    placeholder="Relatório textual sobre a arcada dentária"
                    onChange={(e) => handleChange(e, setTexto)}
                    disabled={isLoading}
                  />
                )}
                {tipo === "imagem" && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arquivo (Imagem) *
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
                          Prévia da Imagem
                        </label>
                        <Image
                          src={filePreview}
                          alt="Prévia da Imagem"
                          width={200}
                          height={200}
                          className="w-full max-w-xs h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Seção de Dados da Vítima */}
              <h2 className="text-lg font-semibold text-gray-700 mt-6">Dados da Vítima</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    checked={createNewVitima}
                    onChange={(e) => setCreateNewVitima(e.target.checked)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  Criar nova vítima
                </label>
              </div>

              {!createNewVitima && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecionar Vítima Existente *
                  </label>
                  <select
                    value={selectedVitimaId}
                    onChange={(e) => {
                      setSelectedVitimaId(e.target.value);
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
                        {vitima.nome || "Não identificada"} ({vitima.estadoCorpo || "Inteiro"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {createNewVitima && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nome da Vítima"
                    value={vitimaNome}
                    placeholder="Ex: João Silva"
                    onChange={(e) => handleChange(e, setVitimaNome)}
                    disabled={isLoading}
                  />
                  <Input
                    label="Data de Nascimento"
                    value={vitimaDataNascimento}
                    type="date"
                    onChange={(e) => handleChange(e, setVitimaDataNascimento)}
                    disabled={isLoading}
                  />
                  <Input
                    label="Idade Aproximada"
                    value={vitimaIdadeAproximada}
                    type="number"
                    placeholder="Ex: 30"
                    onChange={(e) => handleChange(e, setVitimaIdadeAproximada)}
                    disabled={isLoading}
                  />
                  <Input
                    label="Nacionalidade"
                    value={vitimaNacionalidade}
                    placeholder="Ex: Brasileira"
                    onChange={(e) => handleChange(e, setVitimaNacionalidade)}
                    disabled={isLoading}
                  />
                  <Input
                    label="Cidade"
                    value={vitimaCidade}
                    placeholder="Ex: São Paulo"
                    onChange={(e) => handleChange(e, setVitimaCidade)}
                    disabled={isLoading}
                  />
                  <Select
                    label="Sexo *"
                    value={vitimaSexo}
                    onChange={(e) =>
                      setVitimaSexo(e.target.value as "masculino" | "feminino" | "indeterminado")
                    }
                    options={["masculino", "feminino", "indeterminado"]}
                    disabled={isLoading}
                  />
                  <Select
                    label="Estado do Corpo *"
                    value={vitimaEstadoCorpo}
                    onChange={(e) =>
                      setVitimaEstadoCorpo(
                        e.target.value as "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto"
                      )
                    }
                    options={["inteiro", "fragmentado", "carbonizado", "putrefacto", "esqueleto"]}
                    disabled={isLoading}
                  />
                  <Input
                    label="Lesões"
                    value={vitimaLesoes}
                    placeholder="Ex: Fratura no osso maxilar"
                    onChange={(e) => handleChange(e, setVitimaLesoes)}
                    disabled={isLoading}
                  />
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
              )}

              {selectedVitimaId && existingEvidences.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700">Evidências Existentes</h3>
                  <ul className="list-disc pl-5 text-gray-600">
                    {existingEvidences.map((evidencia) => (
                      <li key={evidencia._id}>
                        {evidencia.categoria} ({evidencia.tipo}, {evidencia.texto || evidencia.imagem || "N/A"}) - 
                        Coletado por: {evidencia.coletadoPor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <PrimaryButton
                  text={isLoading ? "Carregando..." : "Cadastrar Evidência"}
                  disabled={isLoading || !isFormValid}
                  type="submit"
                />
                  <button
                    type="button"
                    onClick={() => router.push("/laudos")} // Redireciona para a página de gerar laudo
                    className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Gerar Laudo
                  </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
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
      />
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

function PrimaryButton({
  text,
  disabled,
  type = "button",
}: {
  text: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="bg-teal-500 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition disabled:opacity-50"
    >
      {text}
    </button>
  );
}