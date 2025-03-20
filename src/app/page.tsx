// app/page.tsx

"use client";

import Image from "next/image";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa"; // Ícones para os botões

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 sm:p-20">
      {/* Container para a Logo com tamanho definido */}
      <div className="mb-12 relative w-[900px] h-[600px]">
        <Image
          src="/logo-pagina-inicial.png" // Caminho da sua logo
          alt="Logo ODX Perícias"
          fill
          style={{ objectFit: "contain" }} // Preenche o container sem distorcer
        />
      </div>

      {/* Botões de Login e Cadastro */}
      <div className="w-full max-w-md space-y-6">
        {/* Botão de Login */}
        <button
          onClick={() => (window.location.href = "/login")}
          className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 flex items-center justify-center gap-2 transition"
        >
          <FaSignInAlt className="text-lg" />
          Login
        </button>

        {/* Botão de Cadastro */}
        <button
          onClick={() => (window.location.href = "/register")}
          className="w-full bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 flex items-center justify-center gap-2 transition"
        >
          <FaUserPlus className="text-lg" />
          Cadastro
        </button>
      </div>
    </div>
  );
}
