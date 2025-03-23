import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  className = "",
  required,
  icon,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`block p-3 w-full rounded-md shadow-sm transition-colors duration-200 ${
            icon ? "pl-10" : "pl-3"
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-red-500 focus:ring-red-500"
          } ${className}`}
          required={required}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}
