"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import api from "@/lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { Evidence } from "@/types/Evidence";
import { AxiosError } from "axios";
import Image from "next/image"; // Adicionado para prévia da imagem

interface EvidenceResponse {
  msg: string;
  evidence: Evidence;
}

export default function NewEvidencePage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

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
  const [laudo, setLaudo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null); // Para prévia da imagem
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid =
    casoReferencia &&
    categoria &&
    coletadoPorNome &&
    (tipo === "texto" ? conteudo : file);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      // Validar tipo de arquivo
      if (!selectedFile.type.startsWith("image/")) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        setFile(null);
        setFilePreview(null);
        return;
      }
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile)); // Criar URL para prévia
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

    const formData = new FormData();
    formData.append("casoReferencia", casoReferencia);
    formData.append("tipo", tipo);
    formData.append("categoria", categoria);
    formData.append("vitima", vitima);
    formData.append("sexo", sexo);
    formData.append("estadoCorpo", estadoCorpo);
    if (lesoes) formData.append("lesoes", lesoes);
    formData.append("coletadoPor", coletadoPorNome);
    if (tipo === "texto" && conteudo) formData.append("conteudo", conteudo);
    if (laudo) formData.append("laudo", laudo);
    if (tipo === "imagem" && file) formData.append("file", file);

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.post<EvidenceResponse>("/api/evidence", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        setSubmitted(true);
        setError("");
        // Resetar todos os campos
        setCasoReferencia("");
        setTipo("texto");
        setCategoria("");
        setVitima("identificada");
        setSexo("masculino");
        setEstadoCorpo("inteiro");
        setLesoes("");
        setColetadoPorNome("");
        setLaudo("");
        setConteudo("");
        setFile(null);
        setFilePreview(null);
        setTimeout(() => router.push("/gestao-evidencias"), 1000);
      } else {
        setError("Erro ao enviar os dados para o servidor.");
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ msg?: string }>;
      setError(axiosError.response?.data?.msg || "Erro ao enviar os dados para o servidor.");
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
          >
            <form className="space-y-4" onSubmit={handleSubmit}>
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {submitted && (
                <p className="text-green-600 text-sm">Evidência cadastrada com sucesso!</p>
              )}
              <PrimaryButton
                text={isLoading ? "Carregando..." : "Cadastrar Evidência"}
                disabled={isLoading || !isFormValid}
                type="submit"
              />
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
      className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
    >
      {text}
    </button>
  );
}