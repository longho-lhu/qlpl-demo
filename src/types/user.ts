export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  full_name: string | null;
  mssv: string | null;
  class: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: number;
  profile_completed: number;
  created_at: string;
}

export type PublicUser = Omit<UserRow, "password_hash">;

export interface JwtPayload {
  sub: number;
  username: string;
}
