export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  confirm: string;
  firstname?: string;
  lastname?: string;
  accept: boolean;
};
export type RegisterResponse = { id?: number; email?: string; username?: string; };
