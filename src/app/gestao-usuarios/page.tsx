"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";

export type Perfil = "Admin" | "Perito" | "Assistente";

export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string; // Não será exibida na listagem
  perfil: Perfil;
  rg: string;
  cro?: string;
}

export default function UserManagementPage() {
  // Estados para listagem e para os campos do formulário
  const [users, setUsers] = useState<User[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [rg, setRg] = useState("");
  const [cro, setCro] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("Perito");
  const [error, setError] = useState<string>("");

  // Busca os usuários do backend ao montar o componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<User[]>("/api/users");
        setUsers(res.data);
      } catch (err: any) {
        console.error("Erro ao buscar usuários:", err);
        setError("Erro ao carregar os usuários.");
      }
    };

    fetchUsers();
  }, []);

  // Adiciona um novo usuário
  const handleAddUser = async () => {
    if (!nome || !email || !senha || !rg) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    // O backend define que o campo 'cro' é obrigatório somente para peritos
    if (perfil === "Perito" && !cro) {
      alert("Para o perfil 'Perito', informe o CRO.");
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      nome,
      email,
      senha,
      rg,
      cro: cro || undefined,
      perfil,
    };

    try {
      await axios.post("/api/users", newUser);
      setUsers((prev) => [...prev, newUser]);
      // Limpa os campos do formulário
      setNome("");
      setEmail("");
      setSenha("");
      setRg("");
      setCro("");
      setPerfil("Perito");
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      alert("Não foi possível adicionar o usuário.");
    }
  };

  // Remove um usuário
  const handleRemoveUser = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      alert("Não foi possível remover o usuário.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-28 p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Gestão de Usuários
      </h1>

      {/* Formulário para adicionar um novo usuário */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-10 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">
          Adicionar Novo Usuário
        </h2>
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
            placeholder="Senha *"
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
        <div className="flex justify-end">
          <button
            onClick={handleAddUser}
            className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700 transition"
          >
            Adicionar Usuário
          </button>
        </div>
      </div>

      {/* Exibição dos usuários cadastrados */}
      <div className="bg-white mt-4 rounded-xl shadow-md p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Usuários Cadastrados
        </h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
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
                    {user.cro && <> | CRO: {user.cro}</>} | Função:{" "}
                    {user.perfil}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-red-600 hover:text-red-800 self-start md:self-auto"
                  title="Remover Usuário"
                >
                  <FaTrashAlt />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
