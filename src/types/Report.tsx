export interface Report {
    _id: string;
    titulo: string;
    descricao: string;
    objetoPericia: string;
    analiseTecnica: string;
    metodoUtilizado: string;
    destinatario: string;
    materiaisUtilizados: string;
    examesRealizados: string;
    consideracoesTecnicoPericiais: string;
    conclusaoTecnica: string;
    caso: string; // ID do caso
    evidencias: string[]; // array de IDs das evidências
    criadoEm: string;
    assinadoDigitalmente: boolean;
  }
  
  export interface ReportResponse {
    data: Report;
    msg?: string;
    success?: boolean;
  }
  
  export interface ReportListResponse {
    data: Report[];
    msg?: string;
    success?: boolean;
  }