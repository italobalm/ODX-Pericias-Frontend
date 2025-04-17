export interface Evidence {
    _id: string;
    caso: string; // ID do caso
    tipo: 'imagem' | 'texto';
    categoria: string;
    dataUpload: string;
    vitima: 'identificada' | 'não identificada';
    sexo: 'masculino' | 'feminino' | 'indeterminado';
    estadoCorpo: 'inteiro' | 'fragmentado' | 'carbonizado' | 'putrefacto' | 'esqueleto';
    lesoes?: string;
    coletadoPor: string;
    conteudo?: string; 
    imagemURL?: string;
    laudo?: string;
  }
  
  export interface EvidenceResponse {
    data: Evidence;
    msg?: string;
    success?: boolean;
  }
  
  export interface EvidenceListResponse {
    data: Evidence[];
    msg?: string;
    success?: boolean;
  }