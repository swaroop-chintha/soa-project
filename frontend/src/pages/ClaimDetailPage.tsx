import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { claimService } from '../services/claimService';
import { websocketService } from '../services/websocketService';
import {
  Claim,
  ClaimStatusHistory,
  ClaimEvent
} from '../types/claim';
import { getErrorMessage } from '../services/api';
import { AlertBanner } from '../components/AlertBanner';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { ClaimStatusTimeline } from '../components/ClaimStatusTimeline';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import {
  RefreshCw,
  X,
  XCircle,
  Clock,
  ShieldCheck,
  Play,
  FileText,
  Download,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const claimId = Number(id);

  const [claim, setClaim] = useState<Claim | null>(null);
  const [history, setHistory] = useState<ClaimStatusHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Processing UX
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processFeedback, setProcessFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Live Toast for claim updates
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadClaimDetails = useCallback(async () => {
    if (!claimId || isNaN(claimId)) {
      setError('Invalid claim ID specified.');
      setLoading(false);
      return;
    }

    try {
      const [claimData, historyData] = await Promise.all([
        claimService.getClaimById(claimId),
        claimService.getClaimHistory(claimId)
      ]);
      setClaim(claimData);
      setHistory(historyData);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    loadClaimDetails();
  }, [loadClaimDetails]);

  // Subscribe to claim-specific WebSocket events
  useEffect(() => {
    if (!claimId || isNaN(claimId)) return;

    const unsubscribeClaim = websocketService.subscribeToClaim(claimId, (event: ClaimEvent) => {
      setClaim((prev) => (prev ? { ...prev, status: event.status } : null));

      const msg = `Claim status updated: ${event.status}${event.message ? ` — ${event.message}` : ''}`;
      setLiveToast(msg);

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setLiveToast(null);
      }, 7000);

      loadClaimDetails();
    });

    return () => {
      unsubscribeClaim();
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [claimId, loadClaimDetails]);

  // Claim Processing Action
  const handleProcessClaim = async () => {
    if (!claim) return;
    setIsProcessing(true);
    setProcessFeedback(null);

    try {
      const updated = await claimService.processClaim(claim);
      setClaim(updated);
      await loadClaimDetails();

      if (updated.status === 'APPROVED') {
        setProcessFeedback({
          type: 'success',
          message: 'Claim Approved: Claim amount is within valid policy coverage limits.'
        });
      } else if (updated.status === 'REJECTED') {
        setProcessFeedback({
          type: 'error',
          message: `Claim Rejected: ${updated.rejectionReason || 'Adjudication decision rejected the claim.'}`
        });
      } else {
        setProcessFeedback({
          type: 'info',
          message: `Claim updated to status: ${updated.status}`
        });
      }
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err);
      if (
        errMsg.includes('503') ||
        errMsg.toLowerCase().includes('approval service') ||
        errMsg.toLowerCase().includes('unavailable')
      ) {
        setProcessFeedback({
          type: 'error',
          message:
            'Approval service is temporarily unavailable. The claim remains UNDER_REVIEW.'
        });
      } else {
        setProcessFeedback({
          type: 'error',
          message: errMsg
        });
      }
      loadClaimDetails();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!claim) return;
    const content = `=====================================================
AEGIS CLAIMS MANAGEMENT SYSTEM — OFFICIAL CLAIM RECEIPT
=====================================================
Claim Number:        ${claim.claimNumber}
Claim ID:            #${claim.id}
Customer Name:       ${claim.customerName || 'N/A'}
Policy ID:           POL-#${claim.policyId}
Claim Amount:        $${Number(claim.claimAmount).toLocaleString()}
Current Status:      ${claim.status}
Incident Date:       ${claim.claimDate || 'N/A'}
Ingestion Date:      ${claim.createdAt || 'N/A'}
Idempotency Key:     ${claim.idempotencyKey || 'N/A'}
Incident Description:
${claim.description || 'No description provided'}

${claim.rejectionReason ? `Adjudication Notes: ${claim.rejectionReason}\n` : ''}
Audit Transition Records: ${history.length} events logged.
=====================================================
Generated securely from Aegis Claims Management System
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aegis-Claim-${claim.claimNumber}-Receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingState message="Retrieving claim details and adjudication records..." />;
  }

  if (error || !claim) {
    return (
      <ErrorState
        title="Claim Not Found"
        message={error || 'Unable to locate claim details. Verify the claim ID.'}
        onRetry={loadClaimDetails}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Live WebSocket Toast */}
      {liveToast && (
        <div className="rounded-2xl bg-aegis-primary text-white px-5 py-3 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-aegis-lavender">Real-Time Update:</span>
            <span>{liveToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setLiveToast(null)}
            className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header with Breadcrumbs */}
      <PageHeader
        title={`Claim #${claim.claimNumber}`}
        subtitle="Adjudication evaluation, policy limits, and immutable transition audit log."
        breadcrumbs={[
          { label: 'Claims', href: '/claims' },
          { label: `#${claim.claimNumber}` }
        ]}
        badge={<StatusBadge status={claim.status} size="md" />}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadReceipt}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export Receipt
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadClaimDetails}
              isLoading={loading}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {processFeedback && (
        <AlertBanner
          type={processFeedback.type}
          message={processFeedback.message}
          onDismiss={() => setProcessFeedback(null)}
        />
      )}

      {/* Claim Lifecycle Timeline */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-5">
        <div className="flex items-center justify-between border-b border-aegis-border pb-4">
          <div>
            <h2 className="text-base font-semibold text-aegis-text">
              Adjudication Lifecycle
            </h2>
            <p className="text-xs text-aegis-secondary mt-0.5">
              Service state machine: Submitted → Policy Validated → Under Review → Decision
            </p>
          </div>
          <span className="text-xs font-medium text-aegis-secondary">
            Current: <strong className="text-aegis-text">{claim.status}</strong>
          </span>
        </div>

        <div className="py-2">
          <ClaimStatusTimeline currentStatus={claim.status} />
        </div>

        {/* Adjudication Pending Action Box */}
        {claim.status === 'UNDER_REVIEW' && (
          <div className="mt-4 p-4 rounded-xl bg-aegis-surface border border-aegis-lavender/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aegis-action animate-pulse" />
                <h4 className="text-sm font-semibold text-aegis-primary">
                  Adjudication Action Ready
                </h4>
              </div>
              <p className="text-xs text-aegis-secondary">
                Policy validity confirmed. Submit to the automated adjudication microservice to evaluate coverage limits.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleProcessClaim}
              isLoading={isProcessing}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              Process Claim
            </Button>
          </div>
        )}
      </div>

      {/* Rejection Alert if Rejected */}
      {claim.status === 'REJECTED' && claim.rejectionReason && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-aegis-card flex items-start gap-3.5">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-rose-900">Claim Rejected by Adjudication Engine</h4>
            <p className="text-xs text-rose-800 leading-relaxed">{claim.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Dual Detail Specification Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Claim Information */}
        <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
          <div className="flex items-center justify-between border-b border-aegis-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-aegis-text">
                Claim Specifications
              </h3>
            </div>
            <StatusBadge status={claim.status} size="sm" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-aegis-border/60">
              <span className="text-aegis-secondary">Claim Number</span>
              <span className="font-mono font-semibold text-aegis-text">{claim.claimNumber}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-aegis-border/60">
              <span className="text-aegis-secondary">Claim ID</span>
              <span className="font-mono text-aegis-text">#{claim.id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-aegis-border/60">
              <span className="text-aegis-secondary">Claimant</span>
              <span className="font-medium text-aegis-text">{claim.customerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-aegis-border/60">
              <span className="text-aegis-secondary">Claim Amount</span>
              <span className="font-semibold text-sm text-aegis-action">
                ${Number(claim.claimAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-aegis-border/60">
              <span className="text-aegis-secondary">Associated Policy</span>
              <Link
                to="/policies"
                className="font-mono text-aegis-action hover:underline font-medium inline-flex items-center gap-1"
              >
                POL-#{claim.policyId} →
              </Link>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-aegis-secondary">Incident Date</span>
              <span className="text-aegis-text">{claim.claimDate || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Metadata & Gateway Details */}
        <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
          <div className="flex items-center justify-between border-b border-aegis-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-aegis-text">
                Audit & Ingestion Details
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-aegis-border/60">
              <span className="text-aegis-secondary">Incident Description</span>
              <span className="font-medium text-aegis-text max-w-xs text-right">
                {claim.description || 'No description provided'}
              </span>
            </div>
            {claim.idempotencyKey && (
              <div className="flex justify-between py-1.5 border-b border-aegis-border/60">
                <span className="text-aegis-secondary">Idempotency Key</span>
                <span className="font-mono text-[11px] text-aegis-secondary truncate max-w-xs">
                  {claim.idempotencyKey}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-aegis-border/60">
              <span className="text-aegis-secondary">Ingestion Timestamp</span>
              <span className="text-aegis-text">
                {claim.createdAt ? new Date(claim.createdAt).toLocaleString() : claim.claimDate}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-aegis-secondary">Last State Transition</span>
              <span className="text-aegis-text">
                {claim.updatedAt ? new Date(claim.updatedAt).toLocaleString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submitted Documents & Settlement Information */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
        <div className="flex items-center justify-between border-b border-aegis-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-aegis-text">
                Documents & Adjudication Letter
              </h3>
              <p className="text-xs text-aegis-secondary">
                Official documents generated and authorized for this claim reference.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl border border-aegis-border bg-aegis-surface/40 flex items-center justify-between hover:bg-aegis-surface transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-aegis-border flex items-center justify-center text-aegis-action">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-aegis-text">Claim Submission Receipt</p>
                <p className="text-[11px] text-aegis-secondary">
                  Ref: {claim.claimNumber} • {claim.claimDate || 'Verified'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="text-xs font-medium text-aegis-action hover:text-aegis-primary hover:underline px-2 py-1"
            >
              Download
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-aegis-border bg-aegis-surface/40 flex items-center justify-between hover:bg-aegis-surface transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-aegis-border flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-aegis-text">Policy Eligibility Proof</p>
                <p className="text-[11px] text-aegis-secondary">
                  Verified against POL-#{claim.policyId}
                </p>
              </div>
            </div>
            <Link
              to="/policies"
              className="text-xs font-medium text-aegis-action hover:text-aegis-primary hover:underline px-2 py-1"
            >
              View Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Immutable Transition Audit History */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
        <div className="flex items-center justify-between border-b border-aegis-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-aegis-text">
                Transition History Audit Log
              </h3>
              <p className="text-xs text-aegis-secondary mt-0.5">
                Immutable lifecycle log recorded by Claim Service
              </p>
            </div>
          </div>
          <span className="text-xs text-aegis-secondary font-medium bg-aegis-surface border border-aegis-border px-3 py-1 rounded-full">
            {history.length} transition{history.length === 1 ? '' : 's'}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-aegis-secondary">
            <Clock className="w-8 h-8 text-aegis-secondary/40 mx-auto mb-2" />
            <p className="text-sm">No transition records captured for this claim.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-aegis-surface/60 border-b border-aegis-border text-aegis-secondary font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 pl-4">Timestamp</th>
                  <th className="py-3 px-3">From</th>
                  <th className="py-3 px-3">To</th>
                  <th className="py-3 px-3">Reason / Details</th>
                  <th className="py-3 pr-4 text-right">Triggered By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aegis-border/60">
                {history.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-aegis-surface/40 transition">
                    <td className="py-3.5 pl-4 font-mono text-xs text-aegis-secondary whitespace-nowrap">
                      {item.changedAt ? new Date(item.changedAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      {item.previousStatus ? (
                        <StatusBadge status={item.previousStatus} size="sm" />
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={item.newStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-xs text-aegis-secondary max-w-xs">
                      {item.reason || 'Transition recorded'}
                    </td>
                    <td className="py-3.5 pr-4 text-right text-xs font-mono text-aegis-secondary">
                      {item.changedBy || 'system'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimDetailPage;
