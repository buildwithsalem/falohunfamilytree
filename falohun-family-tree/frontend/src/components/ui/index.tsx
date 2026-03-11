// components/ui/index.tsx — shared UI primitives

import { forwardRef, InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn, getInitials } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

/* ─── Input ──────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block font-sans text-sm font-medium text-umber-700 mb-1.5">
          {label}
          {props.required && <span className="text-earth-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn('input-warm', error && 'border-red-300 focus:ring-red-400', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-sans text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs font-sans text-umber-400">{hint}</p>}
    </div>
  )
);
Input.displayName = 'Input';

/* ─── Textarea ──────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block font-sans text-sm font-medium text-umber-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={4}
        className={cn('input-warm resize-none', error && 'border-red-300', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-sans text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

/* ─── Button ─────────────────────────────────────── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
}

export function Button({
  variant = 'primary', size = 'md', loading, leftIcon, children, className, disabled, ...props
}: ButtonProps) {
  const variants = {
    primary: 'btn-primary',
    gold: 'btn-gold',
    ghost: 'btn-ghost',
    danger: 'bg-red-500 text-white rounded-xl font-sans font-medium hover:bg-red-600 transition-colors shadow-sm',
  };
  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'px-6 py-3',
    lg: 'text-lg px-8 py-4',
  };
  return (
    <button
      className={cn(variants[variant], sizes[size], 'inline-flex items-center justify-center gap-2', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
    </button>
  );
}

/* ─── Avatar ─────────────────────────────────────── */
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        avatarSizes[size],
        'rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center',
        'bg-gradient-to-br from-earth-400 to-gold-500 text-white font-bold font-sans',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

/* ─── Badge ──────────────────────────────────────── */
interface BadgeProps {
  children: ReactNode;
  variant?: 'earth' | 'gold' | 'forest' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'earth', className }: BadgeProps) {
  const v = {
    earth: 'bg-earth-100 text-earth-700 border-earth-200',
    gold: 'bg-gold-100 text-gold-700 border-gold-200',
    forest: 'bg-forest-100 text-forest-700 border-forest-200',
    gray: 'bg-umber-100 text-umber-600 border-umber-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium border', v[variant], className)}>
      {children}
    </span>
  );
}

/* ─── Card ───────────────────────────────────────── */
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      className={cn(
        'card-warm p-6',
        hoverable && 'cursor-pointer hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/* ─── Section Header ─────────────────────────────── */
export function SectionHeader({ title, subtitle, className }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn('gold-bar', className)}>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal-800">{title}</h2>
      {subtitle && <p className="font-body text-umber-600 mt-2">{subtitle}</p>}
    </div>
  );
}

/* ─── Skeleton loader ────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />;
}

/* ─── Empty State ────────────────────────────────── */
export function EmptyState({ icon, title, subtitle, action }: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {icon && <div className="text-earth-300 mb-4">{icon}</div>}
      <h3 className="font-display text-xl font-semibold text-umber-700 mb-2">{title}</h3>
      {subtitle && <p className="font-body text-sm text-umber-500 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────── */
export function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-warm-lg max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-up">
        {title && (
          <div className="px-6 py-5 border-b border-earth-100">
            <h3 className="font-display text-xl font-semibold text-charcoal-800">{title}</h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
