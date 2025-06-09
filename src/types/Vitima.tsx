export interface IVitima {
  _id: string;
  nome?: string;
  dataNascimento?: string;
  idadeAproximada?: number;
  nacionalidade?: string;
  cidade?: string;
  sexo: "masculino" | "feminino" | "indeterminado";
  estadoCorpo: "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto";
  imagens?: string[]; 
  lesoes?: string;
  identificada: boolean;
  caso?: string; // Added the 'caso' property

}

export interface VitimaListResponse {
  data: IVitima[];
  msg?: string;
  vitimas: IVitima[];
}