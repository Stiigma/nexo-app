import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/common/lib/utils";
import type {
  PasswordStrength,
  PasswordStrengthLevel,
} from "../../types/set-password";

function evaluatePassword(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  let level: PasswordStrengthLevel = "weak";
  if (score >= 4) level = "strong";
  else if (score >= 3) level = "good";
  else if (score >= 2) level = "fair";

  return { level, score, requirements };
}

const LEVEL_CONFIG: Record<
  PasswordStrengthLevel,
  { color: string; barColor: string; label: string }
> = {
  weak: {
    color: "text-destructive",
    barColor: "bg-destructive",
    label: "Débil",
  },
  fair: {
    color: "text-orange-500",
    barColor: "bg-orange-500",
    label: "Regular",
  },
  good: {
    color: "text-yellow-500",
    barColor: "bg-yellow-500",
    label: "Buena",
  },
  strong: {
    color: "text-green-500",
    barColor: "bg-green-500",
    label: "Fuerte",
  },
};

const REQUIREMENT_LABELS: Record<string, string> = {
  minLength: "Mínimo 8 caracteres",
  hasUppercase: "Una letra mayúscula",
  hasLowercase: "Una letra minúscula",
  hasNumber: "Un número",
  hasSpecialChar: "Un carácter especial",
};

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => evaluatePassword(password), [password]);
  const config = LEVEL_CONFIG[strength.level];

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Meter bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < strength.score ? config.barColor : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Strength label */}
      <p className={cn("text-xs font-medium", config.color)}>
        Seguridad: {config.label}
      </p>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {Object.entries(strength.requirements).map(([key, met]) => (
          <li key={key} className="flex items-center gap-1.5 text-xs">
            {met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span
              className={cn(
                met ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {REQUIREMENT_LABELS[key]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
