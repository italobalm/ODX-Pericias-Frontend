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
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return regex.test(password);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data?.message || "Erro ao alterar a senha.");
      }
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Alterar Senha</h1>
            <p className="text-sm text-gray-600">
              Atualize sua senha de acesso
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <Field
            label="Senha atual"
            value={currentPassword}
            setValue={setCurrentPassword}
            type="password"
            placeholder="Digite sua senha atual"
          />
          <Field
            label="Nova senha"
            value={newPassword}
            setValue={setNewPassword}
            type="password"
            placeholder="Digite sua nova senha"
          />
          <Field
            label="Confirmar nova senha"
            value={confirmPassword}
            setValue={setConfirmPassword}
            type="password"
            placeholder="Confirme sua nova senha"
          />
        </div>

        {/* Mensagens e Botões */}
        <div className="grid grid-cols-1 gap-4 pt-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center">
              Senha alterada com sucesso!
            </p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className={`w-full sm:w-auto md:w-auto max-w-xs md:max-w-sm bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition text-sm font-medium mx-auto ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Salvando..." : "Confirmar Alteração"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente reutilizável de campo
function Field({
  label,
  value,
  setValue,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-500 block mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-300 transition">
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm bg-transparent outline-none"
        />
      </div>
    </div>
  );
}
