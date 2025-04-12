"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";

type UserRole = "admin" | "perito" | "assistente";

interface User {
  id: string;
  name: string;
  email: string;
  birthdate: string;
  cro?: string;
  rg: string;
  role: UserRole;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [cro, setCro] = useState("");
  const [rg, setRg] = useState("");
  const [role, setRole] = useState<UserRole>("perito");

  useEffect(() => {
    axios.get("/api/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  const handleAddUser = async () => {
    if (!name || !email || !birthdate || !rg) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      birthdate,
      cro: cro || undefined,
      rg,
      role,
    };

    try {
      await axios.post("/api/users", newUser);
      setUsers((prev) => [...prev, newUser]);
      setName("");
      setEmail("");
      setBirthdate("");
      setCro("");
      setRg("");
      setRole("perito");
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  const handleRemoveUser = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-28 p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Gestão de Usuários
      </h1>

      <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-10 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700">
          Adicionar novo usuário
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Nome *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="email"
            placeholder="E-mail *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            placeholder="Data de nascimento *"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="RG *"
            value={rg}
            onChange={(e) => setRg(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="CRO (opcional)"
            value={cro}
            onChange={(e) => setCro(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            <option value="admin">Administrador</option>
            <option value="perito">Perito</option>
            <option value="assistente">Assistente</option>
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

      <div className="bg-white mt-4 rounded-xl shadow-md p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Usuários cadastrados
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
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    E-mail: {user.email} | Nasc: {user.birthdate} | RG:{" "}
                    {user.rg}
                    {user.cro && <> | CRO: {user.cro}</>} | Função: {user.role}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-red-600 hover:text-red-800 self-start md:self-auto"
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
