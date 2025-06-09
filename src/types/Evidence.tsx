import { IVitima } from "./Vitima";
import { Case } from "./Case";

export interface Evidence {
  _id: string;
  caso: string | Case;
  vitima?: IVitima | undefined;
  tipo: "imagem" | "texto";
  categoria: string;
  dataUpload: string | Date | null;
  coletadoPor: string; 
  texto?: string | null;
  imagem?: string | null;
}

export interface EvidenceResponse {
  msg: string;
  evidence: Evidence;
  vitima: IVitima;
}

export interface EvidenceListResponse {
  msg?: string;
  evidencias: Evidence[];
  paginacao: {
    total: number;
    paginaAtual: number;
    porPagina: number;
    totalPaginas: number;
  };
}