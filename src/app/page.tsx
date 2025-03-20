// app/page.tsx

"use client";

import Image from "next/image";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100 flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Container Título */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16 px-6 sm:px-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-700">
          ODX <span className="text-teal-600 font-medium">PERÍCIAS</span>
        </h1>
        {/* Subtítulo abaixo do Título */}
        <p className="mt-2 text-lg sm:text-xl text-teal-600">
          A solução ideal para laudos rápidos e confiáveis.
        </p>
      </div>

      {/* Container da Logo */}
      <div className="w-full max-w-md mb-16 relative h-56 sm:h-72">
        <Image
          src="/logo.png" // Verifique o caminho da imagem
          alt="Logo ODX PERICIAS"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Botões de Login e Cadastro */}
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={() => (window.location.href = "/login")}
          className="w-full bg-teal-600 text-white py-4 rounded-xl shadow-xl hover:bg-teal-700 transition transform hover:scale-105"
        >
          <div className="flex items-center justify-center gap-2">
            <FaSignInAlt className="text-2xl" />
            <span className="font-medium text-lg">Entrar</span>
          </div>
        </button>

        <button
          onClick={() => (window.location.href = "/register")}
          className="w-full bg-teal-600 text-white py-4 rounded-xl shadow-xl hover:bg-teal-700 transition transform hover:scale-105"
        >
          <div className="flex items-center justify-center gap-2">
            <FaUserPlus className="text-2xl" />
            <span className="font-medium text-lg">Cadastrar</span>
          </div>
        </button>
      </div>
    </div>
  );
}
