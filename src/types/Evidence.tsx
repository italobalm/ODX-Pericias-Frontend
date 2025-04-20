import { User } from "./User"; // Import the User interface

export interface Evidence {
  _id: string;
  casoReferencia: string; // Código de Referência do Caso Relacionado
  tipoEvidencia: 'imagem' | 'texto';
  categoria: string;
  dataUpload: string;
  vitima: 'identificada' | 'não identificada';
  sexo: 'masculino' | 'feminino' | 'indeterminado';
  estadoCorpo: 'inteiro' | 'fragmentado' | 'carbonizado' | 'putrefacto' | 'esqueleto';
  lesoes?: string;
  coletadoPor: Pick<User, 'nome' | 'email'>; // Populated from User model
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
