export interface User {
  id: string;
  _id: string; 
  nome: string;
  cro: string;
  email: string;
  senha?: string;
  perfil: 'Admin' | 'Perito' | 'Assistente';
}

export type Perfil = "Admin" | "Perito" | "Assistente";


export interface AuthResponse {
  token: string;
  user: User;
}