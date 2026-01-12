// src/components/PasswordStrength.tsx
import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.-_?":{}|<>]/.test(password),
    };
  }, [password]);

  const strength = Object.values(checks).filter(Boolean).length;
  const percentage = (strength / 5) * 100;

  const getLabel = () => {
    if (strength === 0) return { text: '', color: '' };
    if (strength <= 2) return { text: 'Weak', color: 'text-red-600' };
    if (strength === 3) return { text: 'Fair', color: 'text-orange-500' };
    if (strength === 4) return { text: 'Good', color: 'text-yellow-600' };
    return { text: 'Strong', color: 'text-green-600' };
  };

  const { text, color } = getLabel();

  return (
    <div className="mt-1.5 space-y-2">
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            strength <= 2
              ? 'bg-red-500'
              : strength === 3
              ? 'bg-orange-500'
              : strength === 4
              ? 'bg-yellow-500'
              : 'bg-green-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {password && (
        <div className="text-xs space-y-1">
          <p className={color}>{text} password</p>
          <ul className="text-muted-foreground list-disc list-inside text-[11px] space-y-0.5">
            {!checks.length && <li>At least 8 characters</li>}
            {!checks.uppercase && <li>One uppercase letter</li>}
            {!checks.lowercase && <li>One lowercase letter</li>}
            {!checks.number && <li>One number</li>}
            {!checks.special && <li>One special character</li>}
          </ul>
        </div>
      )}
    </div>
  );
}