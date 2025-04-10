"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [cro, setCro] = useState("");
  const [rg, setRg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleGoBack = () => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep(step - 1);
    }
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !dob ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !role ||
      (role === "perito" && !cro)
    ) {
      setError("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "A senha deve ter pelo menos 6 caracteres, com pelo menos uma letra, um número e um caractere especial."
      );
      return;
    }

    setError("");
    alert("Cadastro finalizado!");
  };

  const isStep1Valid = name && dob && rg;
  const isStep2Valid =
    email &&
    phone &&
    password &&
    confirmPassword &&
    validatePassword(password);
  const isStep3Valid = role && (role !== "perito" || cro);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100 flex items-center justify-center p-6 sm:p-12">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Lado esquerdo com texto (desktop) */}
        <div className="hidden lg:flex flex-col justify-center items-start bg-teal-600 text-white p-10 w-1/2">
          <h1 className="text-4xl font-bold">Cadastro</h1>
          <p className="text-lg mt-2">Crie sua conta para começar</p>
        </div>

        {/* Lado direito com formulário */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10">
          {/* Cabeçalho (mobile e desktop) */}
          <div className="flex items-center justify-start mb-4 lg:hidden">
            <button
              onClick={handleGoBack}
              className="text-gray-700 hover:text-gray-500 transition"
            >
              <FaArrowLeft className="text-2xl" />
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 lg:hidden">Cadastro</h1>
          <p className="text-md text-gray-600 mb-6 lg:hidden">Crie sua conta para começar</p>

          {/* Etapas */}
          <div className="flex justify-center mb-4 space-x-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`text-lg font-semibold px-4 py-2 rounded-full ${
                  step === s ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center mb-6">
            {step === 1
              ? "Dados pessoais"
              : step === 2
              ? "Dados de contato"
              : "Função"}
          </p>

          {/* Formulário com animação */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 1 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 1 ? 50 : -50 }}
            transition={{ duration: 0.4 }}
          >
            {/* Etapa 1 */}
            {step === 1 && (
              <form className="space-y-4">
                <Input
                  label="Nome completo"
                  value={name}
                  placeholder="Digite seu nome"
                  onChange={(e) => handleChange(e, setName)}
                />
                <Input
                  label="Data de nascimento"
                  value={dob}
                  type="date"
                  onChange={(e) => handleChange(e, setDob)}
                />
                <Input
                  label="RG"
                  value={rg}
                  type="number"
                  placeholder="Digite seu RG"
                  onChange={(e) => handleChange(e, setRg)}
                />
                <PrimaryButton
                  text="Próximo"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                />
              </form>
            )}

            {/* Etapa 2 */}
            {step === 2 && (
              <form className="space-y-4">
                <Input
                  label="E-mail"
                  value={email}
                  type="email"
                  placeholder="Digite seu email"
                  onChange={(e) => handleChange(e, setEmail)}
                />
                <Input
                  label="Telefone"
                  value={phone}
                  type="tel"
                  placeholder="Digite seu telefone"
                  onChange={(e) => handleChange(e, setPhone)}
                />
                <Input
                  label="Senha"
                  value={password}
                  type="password"
                  placeholder="Digite sua senha"
                  onChange={(e) => handleChange(e, setPassword)}
                />
                <Input
                  label="Confirme sua senha"
                  value={confirmPassword}
                  type="password"
                  placeholder="Confirme sua senha"
                  onChange={(e) => handleChange(e, setConfirmPassword)}
                />
                <PrimaryButton
                  text="Próximo"
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                />
              </form>
            )}

            {/* Etapa 3 */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Função
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-3 border text-gray-800 rounded-xl focus:ring focus:ring-blue-300"
                  >
                    <option value="">Selecione uma função</option>
                    <option value="administrador">Administrador</option>
                    <option value="perito">Perito</option>
                    <option value="assistente">Assistente</option>
                  </select>
                </div>

                {role === "perito" && (
                  <Input
                    label="CRO"
                    value={cro}
                    type="number"
                    placeholder="Digite seu CRO"
                    onChange={(e) => handleChange(e, setCro)}
                  />
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!isStep3Valid}
                    className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
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

// Componentes auxiliares
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
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-blue-300 placeholder-gray-500"
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
