"use client";

import { useRouter } from "next/navigation";
import {
  FaFileAlt,
  FaFileMedical,
  FaClipboardList,
  FaLink,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();
  const userFullName = "Italo Melo";
  const croNumber = "123456";

  const menuItems = [
    { title: "Nova perícia", icon: <FaFileAlt />, path: "/nova-pericia" },
    { title: "Laudos", icon: <FaClipboardList />, path: "/laudos" },
    { title: "Comparar Laudos", icon: <FaLink />, path: "/comparar-laudos" },
    { title: "Minhas Perícias", icon: <FaFileMedical />, path: "/minhas-pericias" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full max-w-md fixed top-0 left-0 right-0 z-10 bg-teal-500 text-white px-6 py-4 rounded-b-3xl shadow-md flex items-center justify-between">
        <div className="flex flex-col leading-tight">
          <span className="text-sm text-gray-600">Olá,</span>
          <span className="text-lg font-semibold">{userFullName}</span>
          <span className="text-xs text-gray-600">{`CRO: ${croNumber}`}</span>
        </div>

        <button
          onClick={() => router.push("/settings")}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
        >
          <FaCog className="text-white text-xl" />
        </button>
      </header>

      {/* Conteúdo central */}
      <main className="flex flex-col items-center justify-center w-full max-w-md flex-grow pt-36 pb-20">
        <h1 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          O que deseja fazer?
        </h1>

        <div className="grid grid-cols-2 gap-6 w-full px-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow hover:bg-gray-50 transition border border-gray-200"
            >
              <span className="text-4xl text-teal-500">{item.icon}</span>
              <span className="mt-2 text-base font-medium text-gray-800">{item.title}</span>
            </button>
          ))}
        </div>
      </main>

      {/* 🚪 Botão de logout fixo */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => router.push("/")}
          className="bg-red-600 text-white p-3 rounded-full shadow-md hover:bg-red-500 transition"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </div>
  );
}
