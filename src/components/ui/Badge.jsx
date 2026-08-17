import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const variantClasses = {
  default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
  primary: 'bg-primary-50 text-primary-900 border border-primary-200/80 font-semibold',
  gold: 'bg-gradient-to-r from-gold-50 to-gold-100/90 text-gold-900 border border-gold-300/80 shadow-xs font-semibold',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold',
  emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold',
  danger: 'bg-red-50 text-red-700 border border-red-200/80 font-semibold',
  info: 'bg-sky-50 text-sky-800 border border-sky-200/80 font-semibold',
  purple: 'bg-purple-50 text-purple-800 border border-purple-200/80 font-semibold',
};

const Badge = ({ children, variant = 'default', className = '', dot = false }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-0.5 tracking-tight select-none',
        variantClasses[variant] || variantClasses.default,
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          variant === 'success' && 'bg-emerald-500',
          variant === 'emerald' && 'bg-emerald-500',
          variant === 'gold' && 'bg-gold-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'primary' && 'bg-primary-600',
          variant === 'default' && 'bg-slate-400',
        )} />
      )}
      {children}
    </span>
  );
};

export default Badge;

