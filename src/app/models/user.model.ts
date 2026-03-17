export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: boolean;
  status: string;
  logged_in: boolean;
  role?: 'customer' | 'admin';
}
