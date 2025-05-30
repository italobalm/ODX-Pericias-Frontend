import { User } from "./User";

export interface Evidence {
  _id: string;
  caso: string;
  casoReferencia: string; // Renomeado de caso para casoReferencia
  tipo: 'imagem' | 'texto'; // Renomeado de tipoEvidencia para tipo
  categoria: string;
  dataUpload: string;
  vitima: 'identificada' | 'não identificada';
  sexo: 'masculino' | 'feminino' | 'indeterminado';
  estadoCorpo: 'inteiro' | 'fragmentado' | 'carbonizado' | 'putrefacto' | 'esqueleto';
  lesoes?: string;
  coletadoPor: User | string;
  conteudo?: string;
  imagemURL?: string;
  laudo?: string;
}

export interface EvidenceResponse {
  msg?: string;
  evidence?: Evidence;
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