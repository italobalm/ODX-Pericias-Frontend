// types/index.ts
export interface User {
    _id: string;
    nome: string;
    email: string;
    perfil: 'Admin' | 'Perito' | 'Assistente';
    rg: string;
    cro?: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface ApiError {
    response?: {
      data: {
        message: string;
      };
    };
  }