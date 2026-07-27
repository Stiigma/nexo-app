import { api } from "@/common/services/api-client";
import type {
  CheckEmailResponse,
  SendCodeResponse,
  VerifyCodeResponse,
  SetPasswordResponse,
} from "../types/set-password";

/** Check if email exists and whether the user already has a password */
export function checkEmail(email: string): Promise<CheckEmailResponse> {
  return api.get<CheckEmailResponse>("/auth/check-email", { email });
}

/** Send a verification code to the given email */
export function sendCode(email: string): Promise<SendCodeResponse> {
  return api.post<SendCodeResponse>("/auth/send-code", { email });
}

/** Verify the 6-digit code and return a temporary token */
export function verifyCode(
  email: string,
  code: string
): Promise<VerifyCodeResponse> {
  return api.post<VerifyCodeResponse>("/auth/verify-code", { email, code });
}

/** Set a new password using the temporary token */
export function setPassword(
  email: string,
  password: string,
  tempToken: string
): Promise<SetPasswordResponse> {
  return api.post<SetPasswordResponse>("/auth/set-password", {
    email,
    password,
    tempToken,
  });
}
