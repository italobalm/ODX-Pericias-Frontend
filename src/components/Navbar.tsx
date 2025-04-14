"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../app/layout"; // Importa o hook criado no layout

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Se os dados do usuário ainda não foram carregados, não renderiza a navbar
  if (!user) return null;

  const { userFullName, croNumber, userId } = user;

  // Não exibe a Navbar em rotas específicas (ex.: login, esqueci senha, etc.)
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/forgotPassword"
  ) {
    return null;
  }

  const menuItems = [
    { label: "Início", path: "/initialScreen", allowed: ["admin", "perito", "assistente"] },
    { label: "Novo caso", path: "/novo-caso", allowed: ["admin", "perito"] },
    { label: "Gestão de Usuários", path: "/gestao-usuarios", allowed: ["admin"] },
    { label: "Gestão de Casos", path: "/gestao-casos", allowed: ["admin", "perito", "assistente"] },
    { label: "Solicitações", path: "/solicitacoes", allowed: ["admin"] },
    { label: "Relatórios", path: "/relatorios", allowed: ["admin", "perito", "assistente"] },
    { label: "Gestão de Evidências", path: "/gestao-evidencias", allowed: ["admin", "perito", "assistente"] },
    { label: "Visão Geral", path: "/visao-geral", allowed: ["admin", "perito", "assistente"] },
    { label: "Configurações", path: "/settings", allowed: ["admin", "perito", "assistente"] },
    { label: "Sair", path: "/", allowed: ["admin", "perito", "assistente"] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.allowed.includes(userId)
  );

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-10 bg-teal-500 text-white px-6 py-4 shadow-md">
      <div className="relative max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo central (apenas no desktop) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Saudação */}
        <div className="flex flex-col leading-tight">
          <span className="text-sm text-gray-200">Olá,</span>
          <span className="text-lg font-semibold">{userFullName}</span>
          <span className="text-xs text-gray-200">{`CRO: ${croNumber}`}</span>
        </div>

        {/* Botão do menu hambúrguer */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
          >
            <FaBars className="text-white text-xl" />
          </button>

          {isOpen && (
            <ul className="absolute right-0 mt-2 bg-white text-gray-800 rounded-md shadow-lg w-48 overflow-hidden z-20">
              {filteredItems.map((item) => (
                <li
                  key={item.path}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(item.path);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
