import { IVitima } from "./Vitima";

// Interface ajustada para corresponder ao IEvidence do backend
export interface Evidence {
  _id: string; // ObjectId será tratado como string no frontend
  caso: string; // ObjectId será tratado como string no frontend
  vitima: string; // ObjectId será tratado como string no frontend
  tipo: "imagem" | "texto";
  categoria: string;
  dataUpload: string; // Date será tratado como string no frontend
  coletadoPor: string;
  conteudo?: string;
  vitimaDetails?: IVitima; // Adicionando vitimaDetails para refletir o populate do backend

}

// Ajustando EvidenceResponse para corresponder ao retorno do backend
export interface EvidenceResponse {
  msg: string;
  evidence: Evidence;
  vitima: IVitima; // Importado de Vitima.ts
}

// Ajustando EvidenceListResponse para usar Evidence
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