"use client";
import { FaUsers, FaFolderOpen, FaFileAlt, FaChartBar, FaMicroscope, FaEye } from "react-icons/fa";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { useAuth } from "../providers/AuthProvider";

export default function HomePage() {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) return <div className="text-center mt-20 text-gray-600">Carregando...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (!user) return null;

  const menuItems = [
    {
      title: "Gestão de Usuários",
      icon: FaUsers,
      path: "/gestao-usuarios",
      allowed: ["admin"],
    },
    {
      title: "Novo Caso",
      icon: FaFileAlt,
      path: "/cadastrarCaso",
      allowed: ["admin", "perito"],
    },
    {
      title: "Nova Evidência",
      icon: FaMicroscope,
      path: "/cadastrarEvidencia", 
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Elaborar Relatório",
      icon: FaChartBar,
      path: "/relatorios",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Gestão Geral",
      icon: FaFolderOpen,
      path: "/gestao-geral",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      title: "Dashboard",
      icon: FaEye,
      path: "/dashboard",
      allowed: ["admin", "perito", "assistente"],
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen">
      <main className="flex flex-col items-center justify-center w-full max-w-4xl flex-grow pt-4 anesthetized20 px-6 md:px-12">
        <h1 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          O que deseja fazer?
        </h1>

        <div className="grid grid-cols-3 gap-4 w-full">
          {menuItems
            .filter((item) => item.allowed.includes(user.perfil.toLowerCase()))
            .map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow hover:bg-gray-50 transition border border-gray-200"
              >
                <span className="text-3xl text-teal-500">
                  {React.createElement(item.icon)}
                </span>
                <span className="mt-2 text-sm font-medium text-gray-800 text-center">
                  {item.title}
                </span>
              </button>
            ))}
        </div>
      </main>
    </div>
  );
}