"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { jsPDF } from "jspdf";

export default function ReportRegisterPage() {
  // Etapas: 1 – Informações Básicas; 2 – Dados Periciais; 3 – Detalhes e Revisão; 4 – Visualizar PDF
  const [step, setStep] = useState(1);

  // Estados dos campos (conforme backend)
  const [caso, setCaso] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [objetoPericia, setObjetoPericia] = useState("");
  const [analiseTecnica, setAnaliseTecnica] = useState("");
  const [metodoUtilizado, setMetodoUtilizado] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [materiaisUtilizados, setMateriaisUtilizados] = useState("");
  const [examesRealizados, setExamesRealizados] = useState("");
  const [consideracoesTecnicoPericiais, setConsideracoesTecnicoPericiais] =
    useState("");
  const [conclusaoTecnica, setConclusaoTecnica] = useState("");
  const [evidencias, setEvidencias] = useState("");

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Validações simples por etapa
  const isStep1Valid = caso && titulo && descricao;
  const isStep2Valid =
    objetoPericia && analiseTecnica && metodoUtilizado && destinatario;

  const handleGoBack = () => {
    if (step === 1) window.history.back();
    else setStep(step - 1);
  };

  // Função para atualizar os estados dos inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  // Função para gerar um PDF com um design profissional
  const gerarPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Cabeçalho: logo e título
    // Substitua logoData pela sua logo real em base64
    const logoData =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABTUlEQVR4Xu3YMQ6CMBAF0N/ULs26MVNOnSyJtCzB2QIwB1YHe7HcP+gS0AIN9LS+vd54+7Un6JycyIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiiKIIiuSP8I/L8AB9x1CJ5fZvtTPYLcF6I8RU3uAVM8hOkBTPITpAUzye6QFM8hOoBTPIe6QHM8hOkBTPIe6QHM8hOkBTPIe6QHM8hOkBTPIe6QHM8hOkBTPIe6QHM8hOkBTPIe6QHM8hOkBTPId6gX9yaH3gG4r9jgAAAABJRU5ErkJggg==";
    const logoWidth = 30;
    const logoHeight = 30;
    doc.addImage(
      logoData,
      "PNG",
      (pageWidth - logoWidth) / 2,
      currentY,
      logoWidth,
      logoHeight
    );
    currentY += logoHeight + 5;

    // Título do Documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(
      "Relatório de Perícia Odontológica Criminal",
      pageWidth / 2,
      currentY,
      { align: "center" }
    );
    currentY += 10;

    // Linha divisória do cabeçalho
    doc.setLineWidth(0.7);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Seção: Dados do Caso
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Dados do Caso", margin, currentY);
    currentY += 7;
    doc.setLineWidth(0.2);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`ID/Nome do Caso: ${caso}`, margin, currentY);
    currentY += 12;

    // Seção: Informações Básicas
    doc.setFont("helvetica", "bold");
    doc.text("Informações Básicas", margin, currentY);
    currentY += 7;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`Título: ${titulo}`, margin, currentY);
    currentY += 7;
    let lines = doc.splitTextToSize(
      `Descrição: ${descricao}`,
      pageWidth - margin * 2
    );
    doc.text(lines, margin, currentY);
    currentY += lines.length * 7 + 5;

    // Seção: Dados Periciais
    doc.setFont("helvetica", "bold");
    doc.text("Dados Periciais", margin, currentY);
    currentY += 7;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`Objeto da Perícia: ${objetoPericia}`, margin, currentY);
    currentY += 7;
    doc.text(`Análise Técnica: ${analiseTecnica}`, margin, currentY);
    currentY += 7;
    doc.text(`Método Utilizado: ${metodoUtilizado}`, margin, currentY);
    currentY += 7;
    doc.text(`Destinatário: ${destinatario}`, margin, currentY);
    currentY += 12;

    // Seção: Detalhes e Conclusões
    doc.setFont("helvetica", "bold");
    doc.text("Detalhes e Conclusões", margin, currentY);
    currentY += 7;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;
    doc.setFont("helvetica", "normal");
    lines = doc.splitTextToSize(
      `Materiais Utilizados: ${materiaisUtilizados}`,
      pageWidth - margin * 2
    );
    doc.text(lines, margin, currentY);
    currentY += lines.length * 7 + 5;
    lines = doc.splitTextToSize(
      `Exames Realizados: ${examesRealizados}`,
      pageWidth - margin * 2
    );
    doc.text(lines, margin, currentY);
    currentY += lines.length * 7 + 5;
    lines = doc.splitTextToSize(
      `Considerações Técnico-Periciais: ${consideracoesTecnicoPericiais}`,
      pageWidth - margin * 2
    );
    doc.text(lines, margin, currentY);
    currentY += lines.length * 7 + 5;
    lines = doc.splitTextToSize(
      `Conclusão Técnica: ${conclusaoTecnica}`,
      pageWidth - margin * 2
    );
    doc.text(lines, margin, currentY);
    currentY += lines.length * 7 + 5;

    // Seção: Evidências (caso haja)
    if (evidencias) {
      doc.setFont("helvetica", "bold");
      doc.text("Evidências Associadas", margin, currentY);
      currentY += 7;
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`IDs: ${evidencias}`, margin, currentY);
      currentY += 12;
    }

    // Espaço para assinatura
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura:", margin, pageHeight - margin - 20);
    doc.setLineWidth(0.3);
    doc.line(
      margin,
      pageHeight - margin - 15,
      pageWidth - margin,
      pageHeight - margin - 15
    );

    // Rodapé: observação
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Documento gerado automaticamente pelo sistema.",
      margin,
      pageHeight - margin
    );

    // Converte para blob e cria URL para visualização/download
    const pdfBlob = doc.output("blob");
    const url = window.URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  // Envia o formulário (etapa 3) e chama a função de finalização; não há envio para backend
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setSubmitted(true);
      // Ao clicar em "Finalizar", o PDF é gerado e a etapa 4 é exibida
      gerarPDF();
      setStep(4);
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar o PDF.");
    }
  };

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
                <Input
                  label="Caso (ID)"
                  value={caso}
                  placeholder="Digite o ID ou nome do caso"
                  onChange={(e) => handleChange(e, setCaso)}
                />
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
                  onChange={(e) =>
                    handleChange(e, setConsideracoesTecnicoPericiais)
                  }
                />
                <Textarea
                  label="Conclusão Técnica"
                  value={conclusaoTecnica}
                  placeholder="Digite a conclusão técnica"
                  onChange={(e) => handleChange(e, setConclusaoTecnica)}
                />
                <Input
                  label="Evidências (opcional)"
                  value={evidencias}
                  placeholder="Digite os IDs das evidências, separados por vírgula"
                  onChange={(e) => handleChange(e, setEvidencias)}
                />

                <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-2">
                  <p>
                    <strong>Caso:</strong> {caso}
                  </p>
                  <p>
                    <strong>Título:</strong> {titulo}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {descricao}
                  </p>
                  <p>
                    <strong>Objeto da Perícia:</strong> {objetoPericia}
                  </p>
                  <p>
                    <strong>Análise Técnica:</strong> {analiseTecnica}
                  </p>
                  <p>
                    <strong>Método Utilizado:</strong> {metodoUtilizado}
                  </p>
                  <p>
                    <strong>Destinatário:</strong> {destinatario}
                  </p>
                  <p>
                    <strong>Materiais Utilizados:</strong> {materiaisUtilizados}
                  </p>
                  <p>
                    <strong>Exames Realizados:</strong> {examesRealizados}
                  </p>
                  <p>
                    <strong>Considerações Técnico-Periciais:</strong>{" "}
                    {consideracoesTecnicoPericiais}
                  </p>
                  <p>
                    <strong>Conclusão Técnica:</strong> {conclusaoTecnica}
                  </p>
                  {evidencias && (
                    <p>
                      <strong>Evidências:</strong> {evidencias}
                    </p>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {submitted && (
                  <p className="text-green-600 text-sm">
                    Relatório cadastrado com sucesso!
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
                    Finalizar
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
                    ></iframe>
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
      ></textarea>
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
