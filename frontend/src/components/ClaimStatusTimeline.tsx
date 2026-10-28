import React from 'react';
import { ClaimStatus } from '../types/claim';
import { Check, X, Clock } from 'lucide-react';

interface ClaimStatusTimelineProps {
  currentStatus: ClaimStatus | string;
  compact?: boolean;
  className?: string;
}

interface Step {
  key: string;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { key: 'SUBMITTED', label: 'Submitted', description: 'Intake recorded' },
  { key: 'POLICY_VALIDATED', label: 'Validated', description: 'Coverage verified' },
  { key: 'UNDER_REVIEW', label: 'Under Review', description: 'Underwriting evaluation' },
  { key: 'FINAL', label: 'Decision', description: 'Final determination' },
];

export const ClaimStatusTimeline: React.FC<ClaimStatusTimelineProps> = ({
  currentStatus,
  compact = false,
  className = '',
}) => {
  const normalized = currentStatus?.toUpperCase() || 'SUBMITTED';
  const isRejected = normalized === 'REJECTED' || normalized === 'CANCELLED';
  const isApproved = normalized === 'APPROVED';

  // Determine active step index (0 to 3)
  const getActiveIndex = () => {
    switch (normalized) {
      case 'SUBMITTED':
        return 0;
      case 'POLICY_VALIDATED':
        return 1;
      case 'UNDER_REVIEW':
        return 2;
      case 'APPROVED':
      case 'REJECTED':
      case 'CANCELLED':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveIndex();

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 w-full ${className}`}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isFinal = idx === STEPS.length - 1;

          let barColor = 'bg-[#EAE6F2]';
          if (isCompleted) {
            barColor = 'bg-[#5B4886]';
          } else if (isCurrent) {
            barColor = isRejected ? 'bg-rose-500' : isApproved ? 'bg-emerald-600' : 'bg-[#8B7CE8]';
          }

          return (
            <div key={step.key} className="flex-1 flex flex-col gap-1">
              <div className={`h-1.5 rounded-full ${barColor} transition-all`} />
              <div className="flex justify-between items-center text-[10px] text-[#777181]">
                {isCurrent && (
                  <span className={`font-semibold truncate ${isRejected ? 'text-rose-600' : isApproved ? 'text-emerald-700' : 'text-[#5B4886]'}`}>
                    {isFinal ? (isRejected ? 'Rejected' : isApproved ? 'Approved' : 'Decision') : step.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#EAE6F2] -z-0" />

        {/* Progress Line */}
        <div
          className="absolute top-4 left-6 h-0.5 bg-[#5B4886] transition-all duration-300 -z-0"
          style={{
            width: `${Math.min(100, (activeIndex / (STEPS.length - 1)) * 100)}%`,
          }}
        />

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isFinal = idx === STEPS.length - 1;

          let nodeBg = 'bg-white border-[#EAE6F2] text-[#A19CAE]';
          let nodeIcon = <span className="text-xs font-semibold">{idx + 1}</span>;

          if (isCompleted) {
            nodeBg = 'bg-[#5B4886] border-[#5B4886] text-white';
            nodeIcon = <Check size={14} strokeWidth={2.5} />;
          } else if (isCurrent) {
            if (isRejected && isFinal) {
              nodeBg = 'bg-rose-600 border-rose-600 text-white shadow-sm ring-4 ring-rose-100';
              nodeIcon = <X size={14} strokeWidth={2.5} />;
            } else if (isApproved && isFinal) {
              nodeBg = 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-4 ring-emerald-100';
              nodeIcon = <Check size={14} strokeWidth={2.5} />;
            } else {
              nodeBg = 'bg-[#5B4886] border-[#5B4886] text-white shadow-sm ring-4 ring-[#F0EDFF]';
              nodeIcon = <Clock size={14} strokeWidth={2.5} />;
            }
          }

          const finalLabel = isFinal
            ? isRejected
              ? 'Rejected'
              : isApproved
              ? 'Approved'
              : 'Decision Pending'
            : step.label;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative z-10 px-1">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${nodeBg}`}
              >
                {nodeIcon}
              </div>

              <span
                className={`mt-2 text-xs font-semibold ${
                  isCurrent
                    ? isRejected
                      ? 'text-rose-600'
                      : isApproved
                      ? 'text-emerald-700'
                      : 'text-[#30264A]'
                    : isCompleted
                    ? 'text-[#30264A]'
                    : 'text-[#777181]'
                }`}
              >
                {finalLabel}
              </span>

              <span className="hidden sm:block text-[11px] text-[#8E8A98] mt-0.5 max-w-[90px]">
                {step.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
