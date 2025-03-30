"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

const BACKEND_URL = "https://seu-backend.com/api/endpoint"; // Substitua pela URL real do seu servidor

export default function RegisterPage() {
  const [step, setStep] = useState<number>(1);
  const [responsavel, setResponsavel] = useState<string>("");
  const [dataCriacao, setDataCriacao] = useState<string>("");
  const [titulo, setTitulo] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [vitima, setVitima] = useState<string>("identificada");
  const [sexo, setSexo] = useState<string>("masculino");
  const [estadoCorpo, setEstadoCorpo] = useState<string>("inteiro");
  const [lesoes, setLesoes] = useState<string>("");
  const [evidencias, setEvidencias] = useState<File | null>(null);
  const [tipo, setTipo] = useState<string>("");
  const [dataUpload, setDataUpload] = useState<string>("");
  const [status, setStatus] = useState<string>("Em andamento");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true); // Adiciona o carregamento

    // Verificar se todos os campos obrigatórios foram preenchidos
    if (
      !responsavel ||
      !dataCriacao ||
      !titulo ||
      !descricao ||
      !lesoes ||
      !evidencias ||
      !dataUpload ||
      !tipo
    ) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      setLoading(false); // Finaliza o carregamento em caso de erro
      return;
    }

    setError("");

    // Criando um objeto FormData para enviar os dados do formulário
    const formData = new FormData();
    formData.append("responsavel", responsavel);
    formData.append("dataCriacao", dataCriacao);
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("vitima", vitima);
    formData.append("sexo", sexo);
    formData.append("estadoCorpo", estadoCorpo);
    formData.append("lesoes", lesoes);
    formData.append("evidencias", evidencias!); // Campo de upload de arquivo
    formData.append("tipo", tipo);
    formData.append("dataUpload", dataUpload);
    formData.append("status", status);

    try {
      // Enviando os dados para o backend
      const response = await fetch(BACKEND_URL, {
        method: "POST", // Método POST para enviar dados
        body: formData, // Corpo da requisição com os dados do formulário
      });

      // Verificando se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error("Erro ao registrar a perícia.");
      }

      // Caso o envio tenha sido bem-sucedido
      alert("Perícia registrada com sucesso!");
      // Aqui você pode limpar os campos ou redirecionar para outra página, se necessário
    } catch (error) {
      setError("Erro ao registrar a perícia. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false); // Finaliza o carregamento após a requisição
    }
  };

  const isStep1Valid = responsavel && dataCriacao;
  const isStep2Valid = titulo && descricao;
  const isStep5Valid = status;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full max-w-md mt-10 mb-6">
        <div className="flex items-center justify-start mb-4">
          <button
            onClick={handleGoBack}
            className="text-gray-800 hover:text-gray-600 transition"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 text-left">
          Nova Perícia
        </h1>
        <div className="flex justify-center mt-14 space-x-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`text-lg font-semibold px-4 py-2 rounded-full ${
                step === s
                  ? "bg-teal-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
        <p className="text-lg text-gray-600 mt-2">
          {step === 1
            ? "Perito e Data"
            : step === 2
            ? "Detalhes do Caso"
            : step === 3
            ? "Lesões"
            : step === 4
            ? "Evidências"
            : "Status"}
        </p>
      </header>

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
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
                <label className="block text-sm font-medium text-gray-700">
                  Perito Responsável
                </label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite o nome do perito"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Criação
                </label>
                <input
                  type="date"
                  value={dataCriacao}
                  onChange={(e) => setDataCriacao(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
              >
                Próximo
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Título do caso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Descrição do caso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vítima
                </label>
                <select
                  value={vitima}
                  onChange={(e) => setVitima(e.target.value)}
                  className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-blue-300"
                >
                  <option value="identificada">Identificada</option>
                  <option value="nao_identificada">Não Identificada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sexo
                </label>
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-blue-300"
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado do Corpo
                </label>
                <select
                  value={estadoCorpo}
                  onChange={(e) => setEstadoCorpo(e.target.value)}
                  className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-blue-300"
                >
                  <option value="inteiro">Inteiro</option>
                  <option value="carbonizado">Carbonizado</option>
                  <option value="putrefacto">Putrefacto</option>
                  <option value="fragmentado">Fragmentado</option>
                </select>
              </div>
              <div className="flex justify-between">
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
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lesões Encontradas
                </label>
                <textarea
                  value={lesoes}
                  onChange={(e) => setLesoes(e.target.value)}
                  className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Descreva as lesões encontradas"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Evidência
                </label>
                <input
                  type="text"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite o tipo de evidência"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Anexar Evidências
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setEvidencias(e.target.files ? e.target.files[0] : null)
                  }
                  className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Upload
                </label>
                <input
                  type="date"
                  value={dataUpload}
                  onChange={(e) => setDataUpload(e.target.value)}
                  className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-blue-300"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={!evidencias || !dataUpload}
                  className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
            </form>
          )}

          {step === 5 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {" "}
              {/* Aqui, 'handleSubmit' é chamado */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status do Caso
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-blue-300"
                >
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Arquivado">Arquivado</option>
                </select>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading || !isStep5Valid} // Desativa o botão enquanto está carregando
                  className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition"
                >
                  {loading ? "Criando perícia..." : "Finalizar"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
