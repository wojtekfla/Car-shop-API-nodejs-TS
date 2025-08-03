export interface User {
    id: string;
    username: string;
    password: string; 
    role: 'admin' | 'user';
    balance: number;
  }
  
  export interface Car {
    id: string;
    model: string;
    price: number;
    ownerId: string | null;
  }

  export interface TokenPayload {
  id: string;
  username: string;
  role: "admin" | "user";
}
  