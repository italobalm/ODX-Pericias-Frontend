import { IVitima } from "../types/Vitima";
import { Evidence } from "../types/Evidence";
import { User } from "../types/User";

export interface ILaudo {
  _id?: string;
  evidencias: Array<string | Evidence>;
  vitima: string | IVitima;
  perito: string | User;
  dadosAntemortem: string;
  dadosPostmortem: string;
  analiseLesoes: string;
  conclusao: string;
  dataCriacao: string | Date;
  assinaturaDigital?: string;
}
export interface LaudoListResponse {
  laudos: ILaudo[];
}