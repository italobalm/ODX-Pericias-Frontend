"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  const handleGoBack = () => {
    window.history.back();
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
        <h1 className="text-3xl font-bold text-gray-800 text-left">
          Recuperação de Senha
        </h1>
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
          {step === 1 ? "Digite seu e-mail" : "Verifique seu e-mail"}
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
                  E-mail cadastrado
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-xl focus:ring focus:ring-blue-300"
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => email.trim() !== "" && setStep(2)}
                className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={email.trim() === ""}
              >
                Enviar
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="text-center">
              <p className="text-gray-700 text-lg">
                Pronto! Verifique o link recebido no seu e-mail.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-4 bg-gray-400 text-white p-3 rounded-xl hover:bg-gray-500 transition"
              >
                Voltar
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
