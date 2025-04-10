"use client";

import Image from "next/image";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        {/* MOBILE Layout (visível apenas em telas pequenas) */}
        <div className="flex flex-col items-center justify-center p-8 md:hidden">
          <div className="relative w-32 h-32 mb-6">
            <Image
              src="/logo.png"
              alt="Logo ODX"
              fill
              style={{ objectFit: "contain" }}
              unoptimized
            />
          </div>
          <h1 className="text-4xl font-extrabold text-teal-700 text-center">
            ODX <span className="text-teal-500">PERÍCIAS</span>
          </h1>
          <p className="text-lg text-teal-600 mt-2 text-center">
            A solução ideal para laudos rápidos e confiáveis.
          </p>

          <div className="w-full mt-10 space-y-4">
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

        {/* DESKTOP Layout (visível apenas em telas médias ou maiores) */}
        <div className="hidden md:flex w-full">
          {/* LADO ESQUERDO */}
          <div className="w-1/2 bg-teal-600 text-white flex flex-col justify-center p-16 space-y-6">
            <h1 className="text-5xl font-extrabold">
              ODX <span className="text-teal-200">PERÍCIAS</span>
            </h1>
            <p className="text-lg max-w-sm">
              A solução ideal para laudos rápidos e confiáveis.
            </p>
            <div className="w-36 h-36 relative mt-4">
              <Image
                src="/logo.png"
                alt="Logo ODX"
                fill
                style={{ objectFit: "contain" }}
                unoptimized
              />
            </div>
          </div>

          {/* LADO DIREITO */}
          <div className="w-1/2 flex flex-col justify-center items-center px-12 space-y-6">
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full max-w-sm bg-teal-600 text-white py-4 rounded-xl shadow-xl hover:bg-teal-700 transition transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2">
                <FaSignInAlt className="text-2xl" />
                <span className="font-medium text-lg">Entrar</span>
              </div>
            </button>

            <button
              onClick={() => (window.location.href = "/register")}
              className="w-full max-w-sm bg-teal-600 text-white py-4 rounded-xl shadow-xl hover:bg-teal-700 transition transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2">
                <FaUserPlus className="text-2xl" />
                <span className="font-medium text-lg">Cadastrar</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
