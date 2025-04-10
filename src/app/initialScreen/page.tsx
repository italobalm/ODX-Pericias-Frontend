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
import React from "react";

export default function HomePage() {
  const router = useRouter();
  const userFullName = "Italo Melo";
  const croNumber = "123456";

  const menuItems = [
    { title: "Nova perícia", icon: FaFileAlt, path: "/novaPericia" },
    { title: "Minhas Perícias", icon: FaFileMedical, path: "/minhas-pericias" },
    { title: "Laudos", icon: FaClipboardList, path: "/laudos" },
    { title: "Comparar Laudos", icon: FaLink, path: "/comparar-laudos" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full fixed top-0 left-0 right-0 z-10 bg-teal-500 text-white px-6 py-4 shadow-md flex items-center justify-between md:justify-center">
        <div className="w-full max-w-4xl flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <span className="text-sm text-gray-200">Olá,</span>
            <span className="text-lg font-semibold">{userFullName}</span>
            <span className="text-xs text-gray-200">{`CRO: ${croNumber}`}</span>
          </div>

          <button
            onClick={() => router.push("/settings")}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
          >
            <FaCog className="text-white text-xl" />
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center w-full max-w-4xl flex-grow pt-36 pb-20 px-6 md:px-12">
        <h1 className="text-lg font-semibold text-gray-800 mb-6 text-center">
          O que deseja fazer?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {menuItems.map((item, index) => (
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

      <div className="fixed bottom-6 right-6 md:right-12">
        <button
          onClick={() => router.replace("/")}
          className="bg-red-600 text-white p-3 rounded-full shadow-md hover:bg-red-500 transition"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </div>
  );
}
