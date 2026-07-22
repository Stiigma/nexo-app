// ─── Domain types shared across all features ───

export type UserRole = "Admin" | "Operator";

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}
