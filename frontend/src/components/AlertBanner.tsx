import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertBannerProps {
  type?: 'error' | 'success' | 'info';
  message: string | null;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  message,
  onDismiss
}) => {
  if (!message) return null;

  const config = {
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-4 h-4 text-[#1E40AF] flex-shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 mb-6 flex items-start justify-between gap-3 shadow-xs text-xs sm:text-sm ${config.bg}`}
    >
      <div className="flex items-start gap-2.5">
        {config.icon}
        <span className="leading-relaxed">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-black/5 transition text-current opacity-70 hover:opacity-100 focus:outline-none"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
