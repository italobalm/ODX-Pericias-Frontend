"use client";

import Image from "next/image";
import { FaSignInAlt } from "react-icons/fa";

export default function Home() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-teal-100 to-teal-300 flex flex-col items-center justify-center space-y-8 overflow-hidden">
      {/* Bolinhas pulsantes no fundo */}
      <div className="absolute inset-0 z-0 animate-[pulseDots_2s_ease-in-out_infinite] opacity-30 bg-[radial-gradient(circle,_white_2px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        <div className="relative w-32 h-32">
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

        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-teal-600 text-white px-10 py-4 rounded-xl shadow-xl hover:bg-teal-700 transition transform hover:scale-105"
        >
          <div className="flex items-center justify-center gap-2">
            <FaSignInAlt className="text-2xl" />
            <span className="font-medium text-lg">Entrar</span>
          </div>
        </button>
      </div>

      <style jsx>{`
        @keyframes pulseDots {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
