"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import api from "@/lib/axiosConfig";

export default function NewCasePage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [casoReferencia, setCasoReferencia] = useState("");  
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleGoBack = () => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep(step - 1);
    }
  };

  const isStep1Valid = titulo && descricao;
  const isStep2Valid = status && responsavel && cidade && estado;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newCase = {
      titulo,
      descricao,
      status,
      responsavel,
      dataCriacao: new Date().toISOString(),
      casoReferencia: `CR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      cidade,
      estado,
    };

    // Atualiza o estado do casoReferencia antes de enviar
    setCasoReferencia(newCase.casoReferencia);

    try {
      const token = localStorage.getItem('authToken'); 
  
      const response = await api.post("/api/cases", newCase, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status >= 200 && response.status < 300) {
        // Caso tenha sucesso, define como enviado e limpa os dados do formulário
        setSubmitted(true);
        setError("");
  
        // Limpa o formulário
        setTitulo("");
        setDescricao("");
        setStatus("");
        setResponsavel("");
        setCidade("");
        setEstado("");
        // Não limpar casoReferencia aqui, pois será usado no botão de redirecionamento
      } else {
        setError("Erro ao enviar os dados para o servidor.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar os dados para o servidor.");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  // Função para redirecionar para a página de cadastrar evidência
  const handleRedirectToNewEvidence = () => {
    router.push(`/cadastrarEvidencia?casoReferencia=${encodeURIComponent(casoReferencia)}`);
  };

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12">
      {/* Header: seta e título no topo, alinhados à esquerda */}
      <header className="w-full flex items-center justify-start mb-6">
        <button
          onClick={handleGoBack}
          className="text-gray-700 hover:text-gray-500 transition mr-3"
        >
          <FaArrowLeft className="text-2xl" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Novo Caso</h1>
      </header>

      {/* Corpo do formulário centralizado */}
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          {/* Indicador de etapas */}
          <div className="flex justify-center mb-6 mt-10 space-x-3">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 ${
                  step === s
                    ? "bg-teal-500 text-white border-teal-500"
                    : "text-gray-500 border-gray-300"
                }`}
              >
                {s}
              </span>
            ))}
          </div>

          <p className="text-md text-gray-700 text-center mb-4">
            {step === 1
              ? "Informações iniciais do caso"
              : step === 2
              ? "Atribuição e status"
              : "Revisão final"}
          </p>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 1 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 1 ? 50 : -50 }}
            transition={{ duration: 0.4 }}
          >
            {step === 1 && (
              <form className="space-y-4">
                <Input
                  label="Título"
                  value={titulo}
                  placeholder="Digite o título do caso"
                  onChange={(e) => handleChange(e, setTitulo)}
                />
                <Textarea
                  label="Descrição"
                  value={descricao}
                  placeholder="Descreva o caso"
                  onChange={(e) => handleChange(e, setDescricao)}
                />
                <PrimaryButton
                  text="Próximo"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                />
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4">
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => handleChange(e, setStatus)}
                  options={["Em andamento", "Finalizado", "Arquivado"]}
                />
                <Input
                  label="Responsável"
                  value={responsavel}
                  placeholder="Digite o nome ou ID do responsável"
                  onChange={(e) => handleChange(e, setResponsavel)}
                />
                <Input
                  label="Cidade"
                  value={cidade}
                  placeholder="Digite a cidade"
                  onChange={(e) => handleChange(e, setCidade)}
                />
                <Input
                  label="Estado"
                  value={estado}
                  placeholder="Digite o estado"
                  onChange={(e) => handleChange(e, setEstado)}
                />
                <div className="flex justify-between gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!isStep2Valid}
                    className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-2 text-gray-900">
                  <p>
                    <strong>Título:</strong> {titulo}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {descricao}
                  </p>
                  <p>
                    <strong>Status:</strong> {status}
                  </p>
                  <p>
                    <strong>Responsável:</strong> {responsavel}
                  </p>
                  <p>
                    <strong>Cidade:</strong> {cidade}
                  </p>
                  <p>
                    <strong>Estado:</strong> {estado}
                  </p>
                  <p>
                    <strong>Data de Criação:</strong> {new Date().toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Caso Referência:</strong> {casoReferencia}
                  </p>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {submitted && (
                  <div className="space-y-4">
                    <p className="text-green-600 text-sm">
                      Caso cadastrado com sucesso!
                    </p>
                    {/* Botão para redirecionar para a página de cadastrar evidência */}
                    <button
                      type="button"
                      onClick={handleRedirectToNewEvidence}
                      className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition"
                    >
                      Cadastrar Nova Evidência
                    </button>
                  </div>
                )}
                <div className="flex justify-between gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition"
                    disabled={submitted} // Desativa o botão após o envio bem-sucedido
                  >
                    Finalizar Cadastro
                  </button>
                </div>
              </form>
            )}
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
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-teal-300 placeholder-gray-500"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-teal-300 placeholder-gray-500"
        rows={4}
      ></textarea>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-teal-300"
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
  onClick,
  disabled,
}: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
    >
      {text}
    </button>
  );
}