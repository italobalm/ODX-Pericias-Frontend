"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password-simple`,
        { email, newPassword }
      );
      setSuccess(response.data.msg);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.msg || "Erro ao redefinir a senha. Tente novamente."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-teal-100 to-teal-300 flex items-center justify-center overflow-hidden">
      {/* Bolinhas no fundo */}
      <div className="absolute inset-0 z-0 animate-[pulseDots_2s_ease-in-out_infinite] opacity-30 bg-[radial-gradient(circle,_white_2px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Botão de voltar */}
      <button
        onClick={handleGoBack}
        className="absolute top-6 left-6 z-10 text-gray-800 hover:text-teal-100 transition"
      >
        <FaArrowLeft className="text-3xl" />
      </button>

      {/* Container principal da página */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white mx-4 lg:mx-0">
        {/* Lado esquerdo (desktop) */}
        <div className="hidden lg:flex flex-col justify-center items-start bg-teal-600 text-white p-10 w-1/2">
          <h1 className="text-4xl font-bold">Recuperar Senha</h1>
          <p className="text-lg mt-2">
            Insira seu e-mail e a nova senha
          </p>
        </div>

        {/* Lado direito com conteúdo */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10">
          {/* Cabeçalho (mobile) */}
          <div className="lg:hidden mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mt-4">
              Recuperar Senha
            </h1>
            <p className="text-md text-gray-600 mt-1">
              Insira seu e-mail e a nova senha
            </p>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-4">{success}</p>
          )}

          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <form className="space-y-4" onSubmit={handleSubmit}>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 text-gray-800 rounded-xl focus:ring focus:ring-blue-300 placeholder-gray-500"
                  placeholder="Digite sua nova senha"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
                disabled={email.trim() === "" || newPassword.trim() === ""}
              >
                Redefinir Senha
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}