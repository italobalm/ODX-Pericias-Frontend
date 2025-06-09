import { Case } from "./Case";

export interface IVitima {
  _id: string;
  nome?: string | null;
  dataNascimento?: string | null;
  idadeAproximada?: number | null;
  nacionalidade?: string | null;
  cidade?: string | null;
  sexo: "masculino" | "feminino" | "indeterminado";
  estadoCorpo: "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto";
  lesoes?: string | null;
  identificada: boolean;
  caso?: string | Case | null;
}

export interface VitimaListResponse {
  data: IVitima[];
  msg?: string;
}