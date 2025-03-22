"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

export default function RegisterPage() {
  const [step, setStep] = useState<number>(1);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [cro, setCro] = useState<string>("");
  const [rg, setRg] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleGoBack = () => {
    if (step === 1) {
      window.history.back();
    } else {
      setStep(step - 1);
    }
  };

  const validatePassword = (password: string): boolean => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
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
        <h1 className="text-3xl font-bold text-gray-800 text-left">Cadastro</h1>
        <div className="flex justify-center mt-14 space-x-2">
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
        <p className="text-lg text-gray-600 mt-2">
          {step === 1
            ? "Dados pessoais"
            : step === 2
            ? "Dados de contato"
            : "Função"}
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
                  Nome completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleChange(e, setName)}
                  className="w-full p-3 border-2 border-gray-300 text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => handleChange(e, setDob)}
                  className="w-full p-3 border-2 border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  RG
                </label>
                <input
                  type="number"
                  value={rg}
                  onChange={(e) => handleChange(e, setRg)}
                  className="w-full p-3 border-2 border-gray-300 text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite seu RG"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                Próximo
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange(e, setEmail)}
                  className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite seu email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handleChange(e, setPhone)}
                  className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite seu telefone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleChange(e, setPassword)}
                  className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite sua senha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirme sua senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleChange(e, setConfirmPassword)}
                  className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Confirme sua senha"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!isStep2Valid}
                className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
              >
                Próximo
              </button>
            </form>
          )}

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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CRO
                  </label>
                  <input
                    type="number"
                    value={cro}
                    onChange={(e) => handleChange(e, setCro)}
                    className="w-full p-3 border text-gray-800 placeholder-gray-500 rounded-xl focus:ring focus:ring-blue-300"
                    placeholder="Digite seu CRO"
                  />
                </div>
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
  );
}
