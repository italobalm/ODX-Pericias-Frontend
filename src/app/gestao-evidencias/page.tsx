"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

export default function EvidenceRegisterPage() {
  // Etapa atual do formulário
  const [step, setStep] = useState(1);

  // Campos conforme o modelo IEvidence (com os mesmos nomes, exceto "imagemURL" que agora é "imagem")
  const [caso, setCaso] = useState("");
  const [tipo, setTipo] = useState(""); // "imagem" ou "texto"
  const [categoria, setCategoria] = useState("");
  const [vitima, setVitima] = useState("");
  const [sexo, setSexo] = useState("");
  const [estadoCorpo, setEstadoCorpo] = useState("");
  const [lesoes, setLesoes] = useState("");
  const [coletadoPor, setColetadoPor] = useState("");
  // Campos dependentes de "tipo"
  const [conteudo, setConteudo] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [laudo, setLaudo] = useState("");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Validações simples para as etapas
  const isStep1Valid = caso && tipo && categoria;
  const isStep2Valid = vitima && sexo && estadoCorpo && coletadoPor;

  const handleGoBack = () => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep(step - 1);
    }
  };

  // Lidar com seleção do arquivo (para imagens)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagem(e.target.files[0]);
    }
  };

  // Envio dos dados para o back end via Axios
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (tipo === "imagem") {
        const formData = new FormData();
        formData.append("caso", caso);
        formData.append("tipo", tipo);
        formData.append("categoria", categoria);
        formData.append("vitima", vitima);
        formData.append("sexo", sexo);
        formData.append("estadoCorpo", estadoCorpo);
        if (lesoes) formData.append("lesoes", lesoes);
        formData.append("coletadoPor", coletadoPor);
        if (imagem) formData.append("imagem", imagem);
        if (laudo) formData.append("laudo", laudo);

        await axios.post("/api/evidences", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const newEvidence = {
          caso,
          tipo,
          categoria,
          vitima,
          sexo,
          estadoCorpo,
          lesoes: lesoes || undefined,
          coletadoPor,
          conteudo: tipo === "texto" ? conteudo : undefined,
          laudo: laudo || undefined,
        };
        await axios.post("/api/evidences", newEvidence);
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar os dados para o servidor.");
    }
  };

  // Função genérica para lidar com inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12">
      {/* Header: seta de voltar e título alinhados à esquerda */}
      <header className="w-full flex items-center justify-start mb-6">
        <button
          onClick={handleGoBack}
          className="text-gray-700 hover:text-gray-500 transition mr-3"
        >
          <FaArrowLeft className="text-2xl" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          Cadastrar Evidência
        </h1>
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
              ? "Informações Básicas"
              : step === 2
              ? "Dados da Vítima"
              : "Conteúdo e Revisão"}
          </p>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 1 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 1 ? 50 : -50 }}
            transition={{ duration: 0.4 }}
          >
            {/* Etapa 1: Informações Básicas */}
            {step === 1 && (
              <form className="space-y-4">
                <Input
                  label="Caso"
                  value={caso}
                  placeholder="Digite o ID ou nome do caso"
                  onChange={(e) => handleChange(e, setCaso)}
                />
                <Select
                  label="Tipo"
                  value={tipo}
                  onChange={(e) => handleChange(e, setTipo)}
                  options={["imagem", "texto"]}
                />
                <Input
                  label="Categoria"
                  value={categoria}
                  placeholder="Digite a categoria da evidência"
                  onChange={(e) => handleChange(e, setCategoria)}
                />
                <PrimaryButton
                  text="Próximo"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                />
              </form>
            )}

            {/* Etapa 2: Dados da Vítima */}
            {step === 2 && (
              <form className="space-y-4">
                <Select
                  label="Vítima"
                  value={vitima}
                  onChange={(e) => handleChange(e, setVitima)}
                  options={["identificada", "não identificada"]}
                />
                <Select
                  label="Sexo"
                  value={sexo}
                  onChange={(e) => handleChange(e, setSexo)}
                  options={["masculino", "feminino", "indeterminado"]}
                />
                <Select
                  label="Estado do Corpo"
                  value={estadoCorpo}
                  onChange={(e) => handleChange(e, setEstadoCorpo)}
                  options={[
                    "inteiro",
                    "fragmentado",
                    "carbonizado",
                    "putrefacto",
                    "esqueleto",
                  ]}
                />
                <Textarea
                  label="Lesões (opcional)"
                  value={lesoes}
                  placeholder="Descreva as lesões, se houver"
                  onChange={(e) => handleChange(e, setLesoes)}
                />
                <Input
                  label="Coletado por (ID)"
                  value={coletadoPor}
                  placeholder="Digite o ID do usuário que coletou"
                  onChange={(e) => handleChange(e, setColetadoPor)}
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

            {/* Etapa 3: Conteúdo e Revisão */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {tipo === "texto" ? (
                  <Textarea
                    label="Conteúdo"
                    value={conteudo}
                    placeholder="Digite o texto da evidência"
                    onChange={(e) => handleChange(e, setConteudo)}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagem
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-teal-300"
                    />
                  </div>
                )}
                <Textarea
                  label="Laudo (opcional)"
                  value={laudo}
                  placeholder="Digite o laudo, se houver"
                  onChange={(e) => handleChange(e, setLaudo)}
                />
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-2">
                  <p>
                    <strong>Caso:</strong> {caso}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {tipo}
                  </p>
                  <p>
                    <strong>Categoria:</strong> {categoria}
                  </p>
                  <p>
                    <strong>Vítima:</strong> {vitima}
                  </p>
                  <p>
                    <strong>Sexo:</strong> {sexo}
                  </p>
                  <p>
                    <strong>Estado do Corpo:</strong> {estadoCorpo}
                  </p>
                  {lesoes && (
                    <p>
                      <strong>Lesões:</strong> {lesoes}
                    </p>
                  )}
                  <p>
                    <strong>Coletado por:</strong> {coletadoPor}
                  </p>
                  {tipo === "texto" ? (
                    <p>
                      <strong>Conteúdo:</strong> {conteudo}
                    </p>
                  ) : (
                    <p>
                      <strong>Imagem:</strong> {imagem ? imagem.name : ""}
                    </p>
                  )}
                  {laudo && (
                    <p>
                      <strong>Laudo:</strong> {laudo}
                    </p>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {submitted && (
                  <p className="text-green-600 text-sm">
                    Evidência cadastrada com sucesso!
                  </p>
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
