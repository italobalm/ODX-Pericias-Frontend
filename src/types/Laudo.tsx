import { IVitima } from "./Vitima";
import { Evidence } from "./Evidence";
import { User } from "./User";
import { Case } from "./Case";

export interface ILaudo {
  _id?: string;
  evidencias: Array<string | Evidence>;
  vitima: string | IVitima;
  caso: string | Case;
  perito: string | User;
  dadosAntemortem: string;
  dadosPostmortem: string;
  analiseLesoes: string;
  conclusao: string;
  dataCriacao: string | Date;
  assinaturaDigital?: string | null;
}

export interface LaudoResponse {
  msg: string;
  laudo: ILaudo;
  pdf: string;
}