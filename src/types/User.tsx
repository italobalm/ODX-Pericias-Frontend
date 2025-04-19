export interface User {
  _id: string; 
  nome: string;
  email: string;
  senha?: string;
  perfil: 'Admin' | 'Perito' | 'Assistente';
  rg: string;
  cro?: string;
}

export type Perfil = "Admin" | "Perito" | "Assistente";


export interface AuthResponse {
  token: string;
  user: User;
}