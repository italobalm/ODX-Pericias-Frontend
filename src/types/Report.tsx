import { Evidence } from "./Evidence";
import { IVitima } from "./Vitima";
import { ILaudo } from "./Laudo";

export interface Report {
  _id: string;
  titulo: string;
  descricao: string;
  objetoPericia: string;
  analiseTecnica: string;
  metodoUtilizado: string;
  destinatario: string;
  materiaisUtilizados: string;
  examesRealizados: string;
  consideracoesTecnicoPericiais: string;
  conclusaoTecnica: string;
  caso: string; // ID do caso
  evidencias: string[] | Evidence[]; // Array de IDs ou objetos Evidence
  vitimas: string[] | IVitima[]; // Array de IDs ou objetos Vitima
  laudos: string[] | ILaudo[]; // Array de IDs ou objetos Laudo
  audioURL?: string; // URL do áudio
  criadoEm: string;
  assinadoDigitalmente: boolean;
}

export interface ReportResponse {
  data: Report;
  msg?: string;
  success?: boolean;
  report?: Report; // Para compatibilidade com a resposta do backend
  pdf?: string; // PDF em base64 retornado pelo backend
}

export interface ReportListResponse {
  data: Report[];
  msg?: string;
  success?: boolean;
}