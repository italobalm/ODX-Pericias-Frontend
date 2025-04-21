// src/hooks/useServiceWorker.ts
import { useEffect } from "react";

export const useServiceWorker = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js") // Registra o Service Worker
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration);
        })
        .catch((error) => {
          console.log("Falha ao registrar o Service Worker:", error);
        });
    }
  }, []);
};
