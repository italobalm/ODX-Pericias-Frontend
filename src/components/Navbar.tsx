"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { FaBars } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../app/providers/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    {
      label: "Gestão de Usuários",
      path: "/gestao-usuarios",
      allowed: ["admin"],
    },
    {
      label: "Novo Caso",
      path: "/cadastrarCaso",
      allowed: ["admin", "perito"],
    },
    {
      label: "Cadastrar Evidências",
      path: "/gestao-evidencias",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      label: "Elaborar Relatório",
      path: "/relatorios",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      label: "Gestão de Casos",
      path: "/gestao-geral",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      label: "Dashboard",
      path: "/dashboard",
      allowed: ["admin", "perito", "assistente"],
    },
    {
      label: "Sair",
      path: "/login",
      allowed: ["admin", "perito", "assistente"],
      isLogout: true,
    },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.allowed.includes(user.perfil.toLowerCase())
  );

  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/forgotPassword"
  ) {
    return null;
  }

  const handleMenuItemClick = async (item: typeof menuItems[number]) => {
    setIsOpen(false);
    if (item.isLogout) {
      await logout();
      window.location.href = "/login";
    } else {
      router.push(item.path);
    }
  };

  const toggleMenu = () => {
    console.log("Alternando menu, atualmente está aberto:", isOpen);
    setIsOpen((prev) => !prev);
  };

  // Sempre redirecione para /initialScreen ao clicar no logotipo
  const logoRedirectPath = "/initialScreen";

  const handleLogoClick = () => {
    router.push(logoRedirectPath);
  };

  // Redirecionar para /initialScreen ao clicar na saudação
  const handleGreetingClick = () => {
    router.push("/initialScreen");
  };

  console.log("Filtered menu items:", filteredItems);

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 bg-teal-500 text-white px-6 py-4 shadow-md">
      <div className="relative max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo central (desktop) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
          <button onClick={handleLogoClick} className="focus:outline-none">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </button>
        </div>

        {/* Saudação com redirecionamento */}
        <button
          onClick={handleGreetingClick}
          className="flex flex-col leading-tight focus:outline-none hover:opacity-80 transition"
        >
          <span className="text-sm text-gray-200">Olá,</span>
          <span className="text-lg font-semibold">{user.nome}</span>
          {user.cro && (
            <span className="text-xs text-gray-200">{`CRO: ${user.cro}`}</span>
          )}
        </button>

        {/* Botão menu hambúrguer */}
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition focus:outline-none"
          >
            <FaBars className="text-white text-xl" />
          </button>

          {isOpen && (
            <ul className="absolute right-0 top-12 mt-2 bg-white text-gray-800 rounded-md shadow-lg w-48 overflow-hidden z-50">
              {filteredItems.length === 0 ? (
                <li className="px-4 py-2 text-gray-500">Nenhum item disponível</li>
              ) : (
                filteredItems.map((item) => (
                  <li
                    key={item.path}
                    onClick={() => handleMenuItemClick(item)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {item.label}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}