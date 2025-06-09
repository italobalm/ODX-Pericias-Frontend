import { IVitima } from "./Vitima";
import { Case } from "./Case";

export interface Evidence {
  _id: string;
  caso: string | Case;
  vitima: string | IVitima;
  tipo: "imagem" | "texto";
  categoria: string;
  dataUpload: string | Date;
  coletadoPor: string;
  texto?: string;
  imagem?: string;
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