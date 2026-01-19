// src/components/PasswordStrength.tsx
import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = useMemo(() => ({
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password),
  }), [password]);

  const strengthCount = Object.values(checks).filter(Boolean).length;
  const percentage = (strengthCount / 5) * 100;

  const getStrengthInfo = () => {
    if (strengthCount === 0) return { label: '', color: 'bg-muted', textColor: '' };
    if (strengthCount <= 1) return { label: 'Very weak', color: 'bg-red-500', textColor: 'text-red-600' };
    if (strengthCount === 2) return { label: 'Weak', color: 'bg-red-400', textColor: 'text-red-500' };
    if (strengthCount === 3) return { label: 'Fair', color: 'bg-orange-400', textColor: 'text-orange-600' };
    if (strengthCount === 4) return { label: 'Good', color: 'bg-yellow-400', textColor: 'text-yellow-700' };
    return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const { label, color, textColor } = getStrengthInfo();

  return (
    <div className="mt-2 space-y-3">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Strength label */}
      {password && label && (
        <p className={`text-sm font-medium ${textColor}`}>
          {label} password
        </p>
      )}

      {/* Checklist with ticks / crosses */}
      <ul className="text-sm space-y-1.5">
        <RequirementItem 
          met={checks.length} 
          text="At least 8 characters" 
        />
        <RequirementItem 
          met={checks.uppercase} 
          text="At least one uppercase letter (A–Z)" 
        />
        <RequirementItem 
          met={checks.lowercase} 
          text="At least one lowercase letter (a–z)" 
        />
        <RequirementItem 
          met={checks.number} 
          text="At least one number (0–9)" 
        />
        <RequirementItem 
          met={checks.special} 
          text="At least one special character (!@#$%^&* etc.)" 
        />
      </ul>
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2">
      {met ? (
        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
      )}
      <span className={met ? 'text-foreground/90' : 'text-muted-foreground'}>
        {text}
      </span>
    </li>
  );
}