export interface Case {
    _id: string;
    titulo: string;
    descricao: string;
    status: 'Em andamento' | 'Finalizado' | 'Arquivado';
    responsavel: string;
    dataCriacao: string;
  }
  

export interface CaseResponse {
  data: Case;
  msg?: string;
  success?: boolean;
}

export interface CaseListResponse {
  data: Case[];
  msg?: string;
  success?: boolean;
}