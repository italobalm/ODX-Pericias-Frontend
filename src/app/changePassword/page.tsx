"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function AlterarSenhaPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): boolean => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return regex.test(password);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "A nova senha deve ter pelo menos 6 caracteres, incluindo letra, número e caractere especial."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    // Aqui você faria uma requisição para o back-end

    setError("");
    setSuccess(true);

    // Limpa os campos após 3 segundos
    setTimeout(() => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Cabeçalho com botão de voltar */}
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <button
          onClick={handleGoBack}
          className="text-gray-800 hover:text-gray-600"
        >
          <FaArrowLeft className="text-2xl" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Alterar Senha</h1>
        <div style={{ width: 32 }}></div>
      </header>

      <div className="bg-white p-6 mt-4 w-full max-w-md rounded-2xl shadow-md space-y-4">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">
              Senha atual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:ring focus:ring-blue-300"
              placeholder="Digite sua senha atual"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">
              Nova senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:ring focus:ring-blue-300"
              placeholder="Digite sua nova senha"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:ring focus:ring-blue-300"
              placeholder="Confirme sua nova senha"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center">
              Senha alterada com sucesso!
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition"
          >
            Confirmar Alteração
          </button>
        </form>
      </div>
    </div>
  );
}
