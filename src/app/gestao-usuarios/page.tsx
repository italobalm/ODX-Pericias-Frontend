"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FaTrashAlt, FaArrowLeft, FaEdit } from "react-icons/fa";
import api from "../../lib/axiosConfig";
import { useAuth } from "../providers/AuthProvider";
import { ApiError } from "@/types/Error";

export type Perfil = "Admin" | "Perito" | "Assistente";

export interface User {
  _id: string; 
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil;
  rg: string;
  cro?: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { user, loading, error } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [rg, setRg] = useState("");
  const [cro, setCro] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("Perito");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.perfil.toLowerCase() !== "admin")) {
      console.log("Redirecting to /initialScreen - user.perfil:", user?.perfil);
      router.push("/initialScreen");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.perfil.toLowerCase() !== "admin") return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<User[]>("/api/user");
        console.log("Fetched users:", res.data);
        setUsers(res.data);
        // Validate that each user has an _id
        if (res.data.some((u) => !u._id)) {
          console.error("Some users are missing an _id:", res.data);
          setErrorMessage("Erro: Alguns usuários não possuem ID.");
        }
      } catch (err) {
        const apiError = err as ApiError;
        const msg = apiError?.response?.data?.msg || "Erro ao carregar os usuários.";
        console.error("Error fetching users:", apiError?.response?.data || apiError);
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleSaveUser = async () => {
    if (!nome || !email || !rg || (!senha && !editingUser)) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }
    if (perfil === "Perito" && !cro) {
      setErrorMessage("Para o perfil 'Perito', informe o CRO.");
      return;
    }

    const userData = {
      nome,
      email,
      senha: senha || undefined,
      rg,
      cro: cro || undefined,
      perfil: perfil,
    };

    setIsLoading(true);
    try {
      if (editingUser) {
        if (!editingUser._id) {
          setErrorMessage("ID do usuário não encontrado para edição.");
          console.error("Editing user _id is undefined:", editingUser);
          setIsLoading(false);
          return;
        }
        const res = await api.put<User>(`/api/user/${editingUser._id}`, userData);
        setUsers((prev) =>
          prev.map((u) => (u._id === editingUser._id ? res.data : u))
        );
        setSuccess("Usuário atualizado com sucesso.");
      } else {
        const res = await api.post<User>("/api/user", userData);
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
      setErrorMessage("");
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.msg || "Erro ao salvar o usuário.";
      console.error("Error saving user:", apiError?.response?.data || apiError);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    if (!user._id) {
      setErrorMessage("Não é possível editar: ID do usuário não encontrado.");
      console.error("User _id is missing for editing:", user);
      return;
    }
    console.log("Editing user:", user);
    setEditingUser(user);
    setNome(user.nome);
    setEmail(user.email);
    setRg(user.rg);
    setCro(user.cro || "");
    setPerfil(user.perfil);
    setSenha("");
    setErrorMessage("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNome("");
    setEmail("");
    setSenha("");
    setRg("");
    setCro("");
    setPerfil("Perito");
    setErrorMessage("");
    setSuccess("");
  };

  const handleRemoveUser = async (id: string) => {
    if (!id) {
      setErrorMessage("ID do usuário não encontrado para remoção.");
      console.error("User _id is undefined for deletion");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await api.delete(`/api/user/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setSuccess("Usuário removido com sucesso.");
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.msg || "Erro ao remover o usuário.";
      console.error("Error deleting user:", apiError?.response?.data || apiError);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  if (!user || user.perfil.toLowerCase() !== "admin") {
    return null; 
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pt-28 p-4 md:p-8">
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

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-10 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">
          {editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}
        </h2>
        {(errorMessage || error) && (
          <p className="text-red-500">{errorMessage || error}</p>
        )}
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
            disabled={isLoading}
          />
          <input
            type="email"
            placeholder="E-mail *"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder={editingUser ? "Nova Senha (opcional)" : "Senha *"}
            value={senha}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSenha(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="RG *"
            value={rg}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRg(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="CRO (somente para Perito)"
            value={cro}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCro(e.target.value)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
          <select
            value={perfil}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setPerfil(e.target.value as Perfil)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={isLoading}
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
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSaveUser}
            className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition"
            disabled={isLoading}
          >
            {isLoading
              ? "Carregando..."
              : editingUser
              ? "Salvar Alterações"
              : "Adicionar Usuário"}
          </button>
        </div>
      </div>

      <div className="bg-white mt-4 rounded-xl shadow-md p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Usuários Cadastrados
        </h2>
        {isLoading ? (
          <p className="text-gray-500">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">
            Nenhum usuário cadastrado.{" "}
            {errorMessage && <span className="text-red-500">({errorMessage})</span>}
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li
                key={user._id}
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
                    disabled={isLoading}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleRemoveUser(user._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Remover Usuário"
                    disabled={isLoading}
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