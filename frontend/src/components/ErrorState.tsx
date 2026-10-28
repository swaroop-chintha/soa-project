import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`bg-rose-50/60 border border-rose-200 rounded-xl p-6 sm:p-8 text-center flex flex-col items-center justify-center ${className}`}
      role="alert"
    >
      <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle size={22} />
      </div>

      <h3 className="text-base font-bold text-rose-950 mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto mb-5 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
