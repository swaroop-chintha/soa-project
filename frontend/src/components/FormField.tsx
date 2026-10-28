import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  required,
  error,
  helperText,
  children,
  className = '',
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  ...inputProps
}) => {
  const fieldId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={fieldId}
        className="flex items-center justify-between text-[13px] font-semibold text-[#211D2B]"
      >
        <span>
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </span>
        {!required && (
          <span className="text-[11px] font-normal text-[#8E8A98]">Optional</span>
        )}
      </label>

      <div className="relative">
        {children ? (
          children
        ) : (
          <input
            id={fieldId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full h-11 px-3.5 rounded-xl border bg-white text-xs sm:text-sm text-[#211D2B] focus:outline-none focus:ring-2 focus:ring-[#5B4886]/20 focus:border-[#5B4886] transition ${
              error ? 'border-rose-400 ring-1 ring-rose-300' : 'border-[#EAE6F2]'
            } ${disabled ? 'bg-neutral-100 text-[#777181] cursor-not-allowed' : ''}`}
            {...inputProps}
          />
        )}
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-xs text-rose-600 mt-0.5 font-medium">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#777181] mt-0.5 leading-normal">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
