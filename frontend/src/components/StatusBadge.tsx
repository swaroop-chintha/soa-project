import React from 'react';
import { ClaimStatus } from '../types/claim';
import { PolicyStatus } from '../types/policy';

interface StatusBadgeProps {
  status: ClaimStatus | PolicyStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const normalized = status?.toUpperCase() || 'UNKNOWN';

  const getStyle = () => {
    switch (normalized) {
      case 'SUBMITTED':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Submitted',
        };
      case 'POLICY_VALIDATED':
        return {
          bg: 'bg-[#F0EDFF] text-[#5B4886] border-[#D4C7F5]',
          dot: 'bg-[#8B7CE8]',
          label: 'Policy Validated',
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-purple-50 text-[#5B4886] border-purple-200',
          dot: 'bg-[#5B4886]',
          label: 'Under Review',
        };
      case 'APPROVED':
      case 'ACTIVE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          label: normalized === 'ACTIVE' ? 'Active' : 'Approved',
        };
      case 'REJECTED':
      case 'CANCELLED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-600',
          label: normalized === 'CANCELLED' ? 'Cancelled' : 'Rejected',
        };
      case 'INACTIVE':
      case 'EXPIRED':
        return {
          bg: 'bg-[#F7F6FA] text-[#777181] border-[#EAE6F2]',
          dot: 'bg-[#777181]',
          label: normalized === 'INACTIVE' ? 'Inactive' : 'Expired',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status || 'Unknown',
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${sizeClasses} tracking-tight ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
    </span>
  );
};
