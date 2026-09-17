import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder:text-surface-400 
            focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 
            disabled:bg-surface-100 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
