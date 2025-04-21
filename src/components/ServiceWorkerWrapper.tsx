"use client";

import { useServiceWorker } from "@/hooks/useServiceWorker";

export default function ServiceWorkerWrapper() {
  useServiceWorker(); // aqui ele chama o hook que registra o service worker
  return null; // não precisa renderizar nada visual
}
