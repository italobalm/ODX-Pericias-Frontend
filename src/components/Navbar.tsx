"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { FaBars } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";  // Corrigido o caminho do import

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    { label: "Início", path: "/initialScreen", allowed: ["Admin", "Perito", "Assistente"] },
    { label: "Novo caso", path: "/cadastrarCaso", allowed: ["Admin", "Perito"] },
    { label: "Gestão de Usuários", path: "/gestao-usuarios", allowed: ["Admin"] },
    { label: "Gestão de Casos", path: "/gestao-casos", allowed: ["Admin", "Perito", "Assistente"] },
    { label: "Cadastrar Evidência", path: "/cadastrarEvidencia", allowed: ["Admin"] },
    { label: "Elaborar Relatório", path: "/gestao-relatorios", allowed: ["Admin", "Perito", "Assistente"] },
    { label: "Dashboard", path: "/dashboard", allowed: ["Admin", "Perito", "Assistente"] },
    { label: "Configurações", path: "/settings", allowed: ["Admin", "Perito", "Assistente"] },
    { label: "Sair", path: "/", allowed: ["Admin", "Perito", "Assistente"] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.allowed.includes(user.perfil)
  );

  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/forgotPassword"
  ) {
    return null;
  }

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-10 bg-teal-500 text-white px-6 py-4 shadow-md">
      <div className="relative max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo central (desktop) */}
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
          <span className="text-lg font-semibold">{user.nome}</span>
          {user.cro && (
            <span className="text-xs text-gray-200">{`CRO: ${user.cro}`}</span>
          )}
        </div>

        {/* Botão menu hambúrguer */}
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
