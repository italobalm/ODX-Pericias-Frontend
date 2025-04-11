"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";

interface NavbarProps {
  userFullName: string;
  croNumber: string;
}

export default function Navbar({ userFullName, croNumber }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Oculta navbar nas rotas '/' e '/login'
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  const menuItems = [
    { label: "Início", path: "/initialScreen" },
    { label: "Minhas Perícias", path: "/minhas-pericias" },
    { label: "Nova Perícia", path: "/novaPericia" },
    { label: "Laudos", path: "/laudos" },
    { label: "Comparar Laudos", path: "/comparar-laudos" },
    { label: "Configurações", path: "/settings" },
  ];

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-10 bg-teal-500 text-white px-6 py-4 shadow-md">
      <div className="relative max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo central no desktop */}
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

        {/* Menu hambúrguer sempre à direita */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
          >
            <FaBars className="text-white text-xl" />
          </button>

          {isOpen && (
            <ul className="absolute right-0 mt-2 bg-white text-gray-800 rounded-md shadow-lg w-48 overflow-hidden z-20">
              {menuItems.map((item) => (
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
