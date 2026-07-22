/** API response for checking if an email exists */
export interface CheckEmailResponse {
  exists: boolean;
  hasPassword: boolean;
}

/** API response for sending a verification code */
export interface SendCodeResponse {
  message: string;
  expiresInMinutes: number;
}

/** API response for verifying the code */
export interface VerifyCodeResponse {
  verified: boolean;
  tempToken: string;
  expiresAt?: string; // ISO date string
}

/** API response for setting a new password */
export interface SetPasswordResponse {
  message: string;
}

/** Password strength level */
export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong";

/** Password strength details */
export interface PasswordStrength {
  level: PasswordStrengthLevel;
  score: number; // 0-4
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}
