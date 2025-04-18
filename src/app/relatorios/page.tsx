"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { useReports } from "../../hooks/report";
import { Case } from "../../types/Case";

export default function ReportRegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, fetchLoggedUser } = useAuth();
  const { fetchCases, createReport, loading: reportLoading, error: reportError } = useReports();

  // Etapas: 1 – Informações Básicas; 2 – Dados Periciais; 3 – Detalhes e Revisão; 4 – Visualizar PDF
  const [step, setStep] = useState(1);

  // Estados dos campos
  const [caso, setCaso] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [objetoPericia, setObjetoPericia] = useState("");
  const [analiseTecnica, setAnaliseTecnica] = useState("");
  const [metodoUtilizado, setMetodoUtilizado] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [materiaisUtilizados, setMateriaisUtilizados] = useState("");
  const [examesRealizados, setExamesRealizados] = useState("");
  const [consideracoesTecnicoPericiais, setConsideracoesTecnicoPericiais] = useState("");
  const [conclusaoTecnica, setConclusaoTecnica] = useState("");

  const [cases, setCases] = useState<Case[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Validações simples por etapa
  const isStep1Valid = caso && titulo && descricao;
  const isStep2Valid = objetoPericia && analiseTecnica && metodoUtilizado && destinatario;

  // Verifica autenticação e busca os casos
  useEffect(() => {
    const checkAuthAndFetchCases = async () => {
      if (authLoading) return; // Aguarda até que o authLoading seja resolvido
  
      if (!user) {
        try {
          await fetchLoggedUser();
        } catch  {
          router.push("/login");
          return;
        }
      }
  
      // Após fetchLoggedUser, user pode ainda ser null se houver falha
      if (!user) {
        router.push("/login");
        return;
      }
  
      if (!["ADMIN", "PERITO"].includes(user.perfil)) {
        setError("Você não tem permissão para acessar esta página.");
        router.push("/");
        return;
      }
  
      try {
        const casesData = await fetchCases();
        setCases(casesData);
      } catch  {
        setError("Erro ao carregar os casos.");
      }
    };
  
    checkAuthAndFetchCases();
  }, [user, authLoading, fetchLoggedUser, fetchCases, router]);

  const handleGoBack = () => {
    if (step === 1) window.history.back();
    else setStep(step - 1);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const reportData = {
        caseId: caso,
        titulo,
        descricao,
        objetoPericia,
        analiseTecnica,
        metodoUtilizado,
        destinatario,
        materiaisUtilizados,
        examesRealizados,
        consideracoesTecnicoPericiais,
        conclusaoTecnica,
      };

      const pdfBlob = await createReport(reportData);
      const url = window.URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setSubmitted(true);
      setStep(4);
    } catch (err) {
      const errorTyped = err as Error;
    const errorMessage = errorTyped.message || "Erro ao cadastrar o relatório.";
    setError(errorMessage);
    }
  };

  if (authLoading || reportLoading) {
    return <div className="text-center mt-20">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6 sm:p-12">
      <header className="w-full flex items-center justify-start mb-6">
        <button
          onClick={handleGoBack}
          className="text-gray-700 hover:text-gray-500 transition mr-3"
        >
          <FaArrowLeft className="text-2xl" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          Cadastrar Relatório
        </h1>
      </header>

      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          {/* Indicador de Etapas */}
          <div className="flex justify-center mb-6 mt-10 space-x-3">
            {[1, 2, 3, 4].map((s) => (
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
              ? "Dados Periciais"
              : step === 3
              ? "Detalhes e Revisão"
              : "Visualizar PDF"}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caso
                  </label>
                  <select
                    value={caso}
                    onChange={(e) => handleChange(e, setCaso)}
                    className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-teal-300"
                  >
                    <option value="">Selecione um caso</option>
                    {cases.map((caseItem) => (
                      <option key={caseItem._id} value={caseItem._id}>
                        {caseItem.titulo}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Título"
                  value={titulo}
                  placeholder="Digite o título do relatório"
                  onChange={(e) => handleChange(e, setTitulo)}
                />
                <Textarea
                  label="Descrição"
                  value={descricao}
                  placeholder="Digite a descrição do relatório"
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
                <Input
                  label="Objeto da Perícia"
                  value={objetoPericia}
                  placeholder="Descreva o objeto da perícia"
                  onChange={(e) => handleChange(e, setObjetoPericia)}
                />
                <Textarea
                  label="Análise Técnica"
                  value={analiseTecnica}
                  placeholder="Descreva a análise técnica"
                  onChange={(e) => handleChange(e, setAnaliseTecnica)}
                />
                <Input
                  label="Método Utilizado"
                  value={metodoUtilizado}
                  placeholder="Informe o método utilizado"
                  onChange={(e) => handleChange(e, setMetodoUtilizado)}
                />
                <Input
                  label="Destinatário"
                  value={destinatario}
                  placeholder="Informe o destinatário do relatório"
                  onChange={(e) => handleChange(e, setDestinatario)}
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
                <Textarea
                  label="Materiais Utilizados"
                  value={materiaisUtilizados}
                  placeholder="Liste os materiais utilizados"
                  onChange={(e) => handleChange(e, setMateriaisUtilizados)}
                />
                <Textarea
                  label="Exames Realizados"
                  value={examesRealizados}
                  placeholder="Descreva os exames realizados"
                  onChange={(e) => handleChange(e, setExamesRealizados)}
                />
                <Textarea
                  label="Considerações Técnico-Periciais"
                  value={consideracoesTecnicoPericiais}
                  placeholder="Digite as considerações técnico-periciais"
                  onChange={(e) => handleChange(e, setConsideracoesTecnicoPericiais)}
                />
                <Textarea
                  label="Conclusão Técnica"
                  value={conclusaoTecnica}
                  placeholder="Digite a conclusão técnica"
                  onChange={(e) => handleChange(e, setConclusaoTecnica)}
                />

                <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-2">
                  <p><strong>Caso:</strong> {cases.find(c => c._id === caso)?.titulo || caso}</p>
                  <p><strong>Título:</strong> {titulo}</p>
                  <p><strong>Descrição:</strong> {descricao}</p>
                  <p><strong>Objeto da Perícia:</strong> {objetoPericia}</p>
                  <p><strong>Análise Técnica:</strong> {analiseTecnica}</p>
                  <p><strong>Método Utilizado:</strong> {metodoUtilizado}</p>
                  <p><strong>Destinatário:</strong> {destinatario}</p>
                  <p><strong>Materiais Utilizados:</strong> {materiaisUtilizados}</p>
                  <p><strong>Exames Realizados:</strong> {examesRealizados}</p>
                  <p><strong>Considerações Técnico-Periciais:</strong> {consideracoesTecnicoPericiais}</p>
                  <p><strong>Conclusão Técnica:</strong> {conclusaoTecnica}</p>
                </div>

                {(error || reportError) && (
                  <p className="text-red-500 text-sm">{error || reportError}</p>
                )}
                {submitted && (
                  <p className="text-green-600 text-sm">Relatório cadastrado com sucesso!</p>
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
                    disabled={reportLoading}
                  >
                    {reportLoading ? "Enviando..." : "Finalizar"}
                  </button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Visualização do PDF
                </h2>
                <div className="w-full h-[600px] border border-gray-300 rounded-xl overflow-hidden">
                  {pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      title="Visualização do PDF"
                      className="w-full h-full"
                    />
                  ) : (
                    <p className="text-gray-500 text-center mt-20">
                      PDF não disponível.
                    </p>
                  )}
                </div>
                <a
                  href={pdfUrl}
                  download={`relatorio_${titulo}.pdf`}
                  className="block bg-teal-500 text-white text-center p-3 rounded-xl hover:bg-teal-700 transition"
                >
                  Baixar PDF
                </a>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                >
                  Voltar
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Componentes reutilizáveis
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
      />
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