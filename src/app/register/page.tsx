"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";

//importando especificamente um icone de seta
import { FaArrowLeft } from "react-icons/fa";

//definindo os tipos
export default function RegisterPage() {
  const [step, setStep] = useState<number>(1); // Tipo para o estado de etapa
  const [password, setPassword] = useState<string>(""); // Tipo para a senha
  const [confirmPassword, setConfirmPassword] = useState<string>(""); // Tipo para a confirmação da senha
  const [name, setName] = useState<string>(""); // Tipo para o nome
  const [dob, setDob] = useState<string>(""); // Tipo  para a data de nascimento
  const [cro, setCro] = useState<string>(""); // Tipo  para o CRO
  const [rg, setRg] = useState<string>(""); // Tipo para o RG
  const [email, setEmail] = useState<string>(""); // Tipo  para o email
  const [phone, setPhone] = useState<string>(""); // Tipo  para o telefone
  const [error, setError] = useState<string>(""); // Tipo  para a mensagem de erro

  const handleGoBack = () => {
    // botão de voltar
    window.history.back();
  };

  const validatePassword = (password: string): boolean => {
    // dizendo que a senha precisa de pelo menos 1 letra, 1 número e 1 caractere especial
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Verificação de campos obrigatórios
    if (
      !name ||
      !dob ||
      !cro ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    // Verificação de senhas
    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    // Verificação da complexidade da senha
    if (!validatePassword(password)) {
      setError(
        "A senha deve ter pelo menos 6 caracteres, com pelo menos uma letra, um número e um caractere especial."
      );
      return;
    }

    setError(""); // Limpa qualquer erro anterior
    alert("Cadastro finalizado!");
  };

  const isStep1Valid = name && dob && cro; // Verificação de campos obrigatórios da etapa 1
  const isStep2Valid =
    email && phone && password && confirmPassword && validatePassword(password); // Verificação de campos obrigatórios e senha válida na etapa 2

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Cabeçalho com indicador de progresso */}
      <header className="w-full max-w-md mt-10 mb-6">
        <div className="flex items-center justify-start mb-4">
          {/* Botão de Voltar */}
          <button
            onClick={handleGoBack}
            className="text-gray-800 hover:text-gray-600 transition"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 text-left">Cadastro</h1>
        <div className="flex justify-center mt-14">
          <span
            className={`text-lg font-semibold px-4 py-2 rounded-full ${
              step === 1
                ? "bg-teal-500 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            1
          </span>
          <span className="mx-2 text-gray-500">—</span>
          <span
            className={`text-lg font-semibold px-4 py-2 rounded-full ${
              step === 2
                ? "bg-teal-500 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            2
          </span>
        </div>
        <p className="text-lg text-gray-600 mt-2">
          {step === 1 ? "Dados pessoais" : "Dados de contato"}
        </p>
      </header>

      {/* Container centralizado com animação */}
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 1 ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: step === 1 ? 50 : -50 }}
          transition={{ duration: 0.4 }}
        >
          {/* Etapa 1 - Dados Pessoais */}
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
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
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
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CRO
                </label>
                <input
                  type="number"
                  value={cro}
                  onChange={(e) => handleChange(e, setCro)}
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite seu CRO"
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
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite seu RG"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid} // Desabilita o botão se os campos obrigatórios não forem preenchidos
                className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                Próximo
              </button>
            </form>
          )}

          {/* Etapa 2 - Dados de Contato */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange(e, setEmail)}
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
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
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
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
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
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
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Confirme sua senha"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!isStep2Valid} // Desabilita o botão de finalizar se a etapa 2 não for válida
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
