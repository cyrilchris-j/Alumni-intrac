import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export const cn = (...inputs) => twMerge(clsx(inputs));

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-2.5',
  xl: 'text-base px-8 py-3',
};

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
  secondary: 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 focus:ring-primary-500',
  ghost: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary focus:ring-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
  outline: 'border border-border text-text-secondary hover:bg-gray-50 focus:ring-gray-300',
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
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon size={16} />
      ) : null}
      {children}
      {!loading && RightIcon && <RightIcon size={16} />}
    </button>
  );
};

export default Button;
