// Interface ajustada para corresponder ao IVitima do backend
export interface IVitima {
    _id: string; // ObjectId será tratado como string no frontend
    nome?: string;
    dataNascimento?: string; // Date será tratado como string no frontend
    idadeAproximada?: number;
    nacionalidade?: string;
    cidade?: string;
    sexo: "masculino" | "feminino" | "indeterminado";
    estadoCorpo: "inteiro" | "fragmentado" | "carbonizado" | "putrefacto" | "esqueleto";
    imagens?: string[];
    lesoes?: string;
    identificada: boolean;
  }
  
  export interface VitimaListResponse {
    vitimas: IVitima[];
  }