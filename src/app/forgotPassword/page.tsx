"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleGoBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100 flex items-center justify-center p-6 sm:p-12">
      <div className="flex flex-col lg:flex-row w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Lado esquerdo (desktop) */}
        <div className="hidden lg:flex flex-col justify-center items-start bg-teal-600 text-white p-10 w-1/2">
          <h1 className="text-4xl font-bold">Recuperar Senha</h1>
          <p className="text-lg mt-2">Enviaremos um link para redefinir sua senha</p>
        </div>

        {/* Lado direito com conteúdo */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10">
          {/* Cabeçalho (mobile) */}
          <div className="lg:hidden mb-6">
            <button
              onClick={handleGoBack}
              className="text-gray-700 hover:text-gray-500 transition"
            >
              <FaArrowLeft className="text-2xl" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">Recuperar Senha</h1>
            <p className="text-md text-gray-600 mt-1">
              Enviaremos um link para redefinir sua senha
            </p>
          </div>

          {/* Etapas */}
          <div className="flex justify-center mb-4 space-x-2">
            {[1, 2].map((s) => (
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
            {step === 1 ? "Digite seu e-mail" : "Verifique seu e-mail"}
          </p>

          {/* Conteúdo das etapas */}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    E-mail cadastrado
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-blue-300 placeholder-gray-500"
                    placeholder="Digite seu e-mail"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => email.trim() !== "" && setStep(2)}
                  className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
                  disabled={email.trim() === ""}
                >
                  Enviar
                </button>
              </form>
            )}

            {/* Etapa 2 */}
            {step === 2 && (
              <div className="text-center space-y-4">
                <p className="text-gray-700 text-lg">
                  Pronto! Verifique o link enviado para seu e-mail.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
                >
                  Voltar para o login
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
