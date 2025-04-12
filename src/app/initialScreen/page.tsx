"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaUsers,
  FaFolderOpen,
  FaClipboardList,
  FaFileAlt,
  FaChartBar,
  FaMicroscope,
  FaEye,
} from "react-icons/fa";
import React from "react";

export default function HomePage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{
    id: string;
    nome: string;
    cro: string;
  } | null>(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch("/api/usuario-logado");
        const data = await response.json();
        setUsuario(data);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    fetchUsuario();
  }, []);

  if (!usuario) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  const menuItems = [
    {
      title: "Gestão de Usuários",
      icon: FaUsers,
      path: "/gestao-usuarios",
      allowed: ["admin"],
    },
    {
      title: "Gestão de Casos",
      icon: FaFolderOpen,
      path: "/gestao-casos",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Solicitações",
      icon: FaClipboardList,
      path: "/solicitacoes",
      allowed: ["admin"],
    },
    {
      title: "Relatórios",
      icon: FaChartBar,
      path: "/relatorios",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Gestão de Evidências",
      icon: FaMicroscope,
      path: "/gestao-evidencias",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Visão Geral",
      icon: FaEye,
      path: "/visao-geral",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Novo Caso",
      icon: FaFileAlt,
      path: "/novo-caso",
      allowed: ["admin", "perito"],
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      <header className="w-full max-w-4xl px-6 md:px-12 pt-6 flex flex-col items-start">
        <h2 className="text-xl font-semibold text-gray-800">
          Bem-vindo, {usuario.nome}
        </h2>
        <p className="text-sm text-gray-600">CRO: {usuario.cro}</p>
      </header>

      <main className="flex flex-col items-center justify-center w-full max-w-4xl flex-grow pt-20 pb-20 px-6 md:px-12">
        <h1 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          O que deseja fazer?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {menuItems
            .filter((item) => item.allowed.includes(usuario.id))
            .map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow hover:bg-gray-50 transition border border-gray-200"
              >
                <span className="text-4xl text-teal-500">
                  {React.createElement(item.icon)}
                </span>
                <span className="mt-2 text-base font-medium text-gray-800 text-center">
                  {item.title}
                </span>
              </button>
            ))}
        </div>
      </main>
    </div>
  );
}
