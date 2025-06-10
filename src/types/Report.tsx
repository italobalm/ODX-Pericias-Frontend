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
  evidencias: string[] | Evidence[];
  vitimas: string[] | IVitima[];
  laudos: string[] | ILaudo[];
  audioURL?: string;
  criadoEm: string;
  assinadoDigitalmente: boolean;
}

export interface ReportResponse {
  data: Report;
  msg?: string;
  success?: boolean;
  report?: Report; 
  pdf?: string; 
}

export interface ReportListResponse {
  data: Report[];
  msg?: string;
  success?: boolean;
}