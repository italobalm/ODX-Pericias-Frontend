export interface Case {
  _id: string;
  titulo: string;
  descricao: string;
  status: "Em andamento" | "Finalizado" | "Arquivado";
  responsavel: string;
  dataCriacao: string;
  casoReferencia: string;
  cidade: string;
  estado: string;
}

export interface CaseResponse {
  data: Case;
  msg?: string;
  success?: boolean;
}

export interface CaseListResponse {
  casos: Case[]
  msg?: string;
  success?: boolean;
}

