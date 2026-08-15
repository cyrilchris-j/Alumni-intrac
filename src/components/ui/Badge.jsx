import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const variantClasses = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

const Badge = ({ children, variant = 'default', className = '', dot = false }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-0.5',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'primary' && 'bg-primary-500',
          variant === 'default' && 'bg-gray-500',
        )} />
      )}
      {children}
    </span>
  );
};

export default Badge;
