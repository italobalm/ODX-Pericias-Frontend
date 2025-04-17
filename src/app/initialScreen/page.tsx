"use client";

import useAuth from "../../hooks/useAuth";
import {
  FaUsers,
  FaFolderOpen,
  FaFileAlt,
  FaChartBar,
  FaMicroscope,
  FaEye,
} from "react-icons/fa";
import React from "react";
import { useRouter } from "next/navigation"; // Adicionado explicitamente

export default function HomePage() {
  const { user, loading, error } = useAuth();
  const router = useRouter(); // Necessário para navegação do menu

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  }

  if (!user) {
    return null; // Redirect handled by useAuth
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600">{error}</div>;
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
      title: "Elaborar Relatório",
      icon: FaChartBar,
      path: "/relatorios",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Cadastrar Evidências",
      icon: FaMicroscope,
      path: "/gestao-evidencias",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Dashboard",
      icon: FaEye,
      path: "/dashboard",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Novo Caso",
      icon: FaFileAlt,
      path: "/cadastrarCaso",
      allowed: ["admin", "perito"],
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      <main className="flex flex-col items-center justify-center w-full max-w-4xl flex-grow pt-20 pb-20 px-6 md:px-12">
        <h1 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          O que deseja fazer?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {menuItems
            .filter((item) => item.allowed.includes(user.perfil.toLowerCase()))
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