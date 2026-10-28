import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  badge?: React.ReactNode;
  trend?: {
    label: string;
    positive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  onClick,
  className = '',
}) => {
  const isClickable = Boolean(onClick);

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;
    try {
      return <IconComp size={18} strokeWidth={2} />;
    } catch {
      return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#EAE6F2] p-5 sm:p-6 transition-all duration-150 ${
        isClickable
          ? 'cursor-pointer hover:border-[#D4C7F5] hover:shadow-card hover:-translate-y-0.5'
          : 'shadow-subtle'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-[#F0EDFF] text-[#5B4886] flex items-center justify-center shrink-0">
              {renderIcon()}
            </div>
          )}
          <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-[#777181]">
            {title}
          </span>
        </div>
        {badge && <div>{badge}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-[28px] font-bold text-[#30264A] tracking-tight leading-none">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.positive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-neutral-100 text-[#777181]'
            }`}
          >
            {trend.label}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-[#777181] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
