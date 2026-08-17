import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

const cn = (...inputs) => twMerge(clsx(inputs));

const Select = forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Select an option',
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
        <select
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl shadow-xs',
            'bg-white text-text-primary appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600',
            'transition-all duration-200 disabled:bg-slate-50 cursor-pointer',
            error && 'border-red-400 focus:ring-red-400/20 focus:border-red-400',
            className
          )}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
