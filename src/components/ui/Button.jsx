import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export const cn = (...inputs) => twMerge(clsx(inputs));

const sizeClasses = {
  xs: 'text-xs px-2.5 py-1 rounded-lg',
  sm: 'text-xs px-3.5 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 rounded-xl',
  lg: 'text-base px-6 py-2.5 rounded-xl',
  xl: 'text-base px-8 py-3 rounded-2xl',
};

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
  gold: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white focus:ring-blue-400 shadow-sm hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-blue-500 shadow-xs hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 focus:ring-blue-300',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-sm',
  success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 focus:ring-emerald-500 shadow-sm',
  outline: 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-300 shadow-xs',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon size={15} />
      ) : null}
      {children}
      {!loading && RightIcon && <RightIcon size={15} />}
    </button>
  );
};

export default Button;

