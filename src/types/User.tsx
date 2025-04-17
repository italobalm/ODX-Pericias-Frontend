export interface User {
  id: string;
  nome: string;
  cro: string;
  perfil: 'Admin' | 'Perito' | 'Assistente';
  email?: string; // Optional since not returned by getLoggedUser
  rg?: string;    // Optional since not returned by getLoggedUser
}

export interface AuthResponse {
  token: string;
  user: User;
}