import { useMutation } from "@tanstack/react-query";
import { checkEmail, sendCode, verifyCode, setPassword } from "../services/set-password-service";
import type {
  CheckEmailResponse,
  SendCodeResponse,
  VerifyCodeResponse,
  SetPasswordResponse,
} from "../types/set-password";

/** Check if email exists and needs password setup */
export function useCheckEmail() {
  return useMutation({
    mutationFn: (email: string) => checkEmail(email),
  });
}

/** Send verification code to email */
export function useSendCode() {
  return useMutation({
    mutationFn: (email: string) => sendCode(email),
  });
}

/** Verify the 6-digit code */
export function useVerifyCode() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      verifyCode(email, code),
  });
}

/** Set new password with email, password, and tempToken */
export function useSetPassword() {
  return useMutation({
    mutationFn: ({
      email,
      password,
      tempToken,
    }: {
      email: string;
      password: string;
      tempToken: string;
    }) => setPassword(email, password, tempToken),
  });
}
