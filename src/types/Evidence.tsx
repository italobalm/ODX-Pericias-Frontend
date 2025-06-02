import { IVitima } from "./Vitima";

// Interface ajustada para corresponder ao IEvidence do backend
export interface Evidence {
  _id: string;
  caso: string; // ObjectId será tratado como string no frontend
  vitima: string; // ObjectId será tratado como string no frontend
  tipo: "imagem" | "texto";
  categoria: string;
  dataUpload: string; // Date será tratado como string no frontend
  coletadoPor: string;
  conteudo?: string;
  vitimaDetails?: IVitima; // Para dados populados da vítima
}

export interface EvidenceResponse {
  msg: string;
  evidence: Evidence;
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