"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FaTrashAlt, FaArrowLeft, FaEdit } from "react-icons/fa";
import api from "../../lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { ApiError } from "@/types/Error";

export type Perfil = "Admin" | "Perito" | "Assistente";

export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil;
  rg: string;
  cro?: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { user, loading } = useAuth(); 

  const [users, setUsers] = useState<User[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [rg, setRg] = useState("");
  const [cro, setCro] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("Perito");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.perfil !== "Admin")) {
      router.push("/initialScreen");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.perfil !== "Admin") return;

    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>("/api/users");
        setUsers(res.data);
      } catch (err) {
        const apiError = err as ApiError;
        const msg = apiError?.response?.data?.msg || "Erro ao carregar os usuários.";
        setError(msg);
      }
    };

    fetchUsers();
  }, [user]);

  const handleSaveUser = async () => {
    if (!nome || !email || !rg || (!senha && !editingUser)) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (perfil === "Perito" && !cro) {
      setError("Para o perfil 'Perito', informe o CRO.");
      return;
    }

    const userData = {
      nome,
      email,
      senha: senha || undefined,
      rg,
      cro: cro || undefined,
      perfil,
    };

    try {
      if (editingUser) {
        const res = await api.put<User>(`/api/users/${editingUser.id}`, userData);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? res.data : u))
        );
        setSuccess("Usuário atualizado com sucesso.");
      } else {
        const res = await api.post<User>("/api/users", userData);
        setUsers((prev) => [...prev, res.data]);
        setSuccess("Usuário adicionado com sucesso.");
      }

      setEditingUser(null);
      setNome("");
      setEmail("");
      setSenha("");
      setRg("");
      setCro("");
      setPerfil("Perito");
      setError("");
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.msg || "Erro ao salvar o usuário.";
      setError(msg);
    }
  };

  // Edit a user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNome(user.nome);
    setEmail(user.email);
    setRg(user.rg);
    setCro(user.cro || "");
    setPerfil(user.perfil);
    setSenha("");
    setError("");
    setSuccess("");
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setNome("");
    setEmail("");
    setSenha("");
    setRg("");
    setCro("");
    setPerfil("Perito");
    setError("");
    setSuccess("");
  };

  // Remove a user
  const handleRemoveUser = async (id: string) => {
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccess("Usuário removido com sucesso.");
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.msg || "Erro ao remover o usuário.";
      setError(msg);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  if (!user || user.perfil !== "Admin") {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="max-w-5xl mx-auto pt-28 p-4 md:p-8">
      {/* Header with back arrow and title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 transition p-2"
          title="Voltar"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Gestão de Usuários
        </h1>
      </div>

      {/* Form to add/edit a user */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-10 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">
          {editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Nome *"
            value={nome}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNome(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="email"
            placeholder="E-mail *"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            placeholder={editingUser ? "Nova Senha (opcional)" : "Senha *"}
            value={senha}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSenha(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="RG *"
            value={rg}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRg(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="CRO (somente para Perito)"
            value={cro}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCro(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <select
            value={perfil}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setPerfil(e.target.value as Perfil)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            <option value="Admin">Administrador</option>
            <option value="Perito">Perito</option>
            <option value="Assistente">Assistente</option>
          </select>
        </div>
        <div className="flex justify-end gap-4">
          {editingUser && (
            <button
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSaveUser}
            className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition"
          >
            {editingUser ? "Salvar Alterações" : "Adicionar Usuário"}
          </button>
        </div>
      </div>

      {/* Display registered users */}
      <div className="bg-white mt-4 rounded-xl shadow-md p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Usuários Cadastrados
        </h2>
        {users.length === 0 ? (
          <p className="text-gray-500">Nenhum usuário cadastrado.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li
                key={user.id}
                className="py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div>
                  <p className="font-medium text-gray-800">{user.nome}</p>
                  <p className="text-sm text-gray-500">
                    E-mail: {user.email} | RG: {user.rg}
                    {user.cro && <> | CRO: {user.cro}</>} | Função: {user.perfil}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar Usuário"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Remover Usuário"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
