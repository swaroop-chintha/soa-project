import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  message,
  action,
  actionLabel,
  onAction,
  className = '',
}) => {
  const bodyText = description || message || '';

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;
    try {
      return <IconComp size={24} strokeWidth={1.75} />;
    } catch {
      return null;
    }
  };

  const hasAction = action || (actionLabel && onAction);
  const finalActionLabel = action?.label || actionLabel || '';
  const finalActionClick = action?.onClick || onAction || (() => {});
  const ActionIcon = action?.icon;

  return (
    <div
      className={`bg-white rounded-xl border border-[#EAE6F2] p-8 sm:p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F0EDFF] text-[#5B4886] flex items-center justify-center mb-4 shadow-xs">
          {renderIcon()}
        </div>
      )}

      <h3 className="text-base sm:text-lg font-bold text-[#30264A] mb-1.5">
        {title}
      </h3>

      {bodyText && (
        <p className="text-xs sm:text-sm text-[#777181] max-w-md mx-auto mb-6 leading-relaxed">
          {bodyText}
        </p>
      )}

      {hasAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={finalActionClick}
          icon={ActionIcon ? <ActionIcon size={16} /> : undefined}
        >
          {finalActionLabel}
        </Button>
      )}
    </div>
  );
};
