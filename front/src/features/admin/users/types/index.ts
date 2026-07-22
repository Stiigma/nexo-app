export interface UserDto {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  hasPassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  name?: string;
  password: string;
  role: "Admin" | "Operator";
}

export interface UpdateUserPayload {
  email?: string;
  name?: string | null;
  role?: "Admin" | "Operator";
  isActive?: boolean;
}
