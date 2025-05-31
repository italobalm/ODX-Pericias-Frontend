export interface IVitima {
  _id: string;
  nome?: string;
  dataNascimento?: string | Date;
  idadeAproximada?: number;
  nacionalidade?: string;
  cidade?: string;
  sexo: "masculino" | "feminino" | "indeterminado";
  estadoCorpo: "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto";
  lesoes?: string[];
  imagens?: string[];
  identificada: boolean;
}

export interface Evidence {
  _id: string;
  caso: string; // ObjectId reference to Case
  casoReferencia: string; // Used for lookup, not stored in Evidence
  tipo: "imagem" | "texto";
  categoria: string;
  dataUpload: string;
  vitima: string; // ObjectId reference to Vitima
  coletadoPor: { nome: string }; // Populated by backend
  conteudo?: string;
  imagemURL?: string;
  laudo?: string;
}

export interface EvidenceResponse {
  msg?: string;
  evidence?: Evidence;
  vitima?: IVitima; // Added to match backend response
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