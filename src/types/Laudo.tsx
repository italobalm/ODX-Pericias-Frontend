export interface ILaudo {
  _id: string;
  evidencia: string;
  perito: string;
  dadosAntemortem: string;
  dadosPostmortem: string;
  analiseLesoes: string;
  conclusao: string;
  dataCriacao: string;
  assinaturaDigital?: string;
}

export interface ILaudoListResponse {
  laudos: ILaudo[];
}