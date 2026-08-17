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
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <LeftIcon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl',
            'bg-white text-text-primary placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600',
            'transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400 shadow-xs',
            LeftIcon && 'pl-10',
            RightIcon && 'pr-10',
            error && 'border-red-400 focus:ring-red-400/20 focus:border-red-400',
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
