import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  containerClassName = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <LeftIcon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 text-sm border border-border rounded-lg',
            'bg-white text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-200 disabled:bg-gray-50 disabled:text-text-secondary',
            LeftIcon && 'pl-9',
            RightIcon && 'pr-9',
            error && 'border-red-400 focus:ring-red-400 focus:border-red-400',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            <RightIcon size={16} />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
