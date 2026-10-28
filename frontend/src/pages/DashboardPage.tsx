import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { policyService } from '../services/policyService';
import { claimService } from '../services/claimService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Policy } from '../types/policy';
import { Claim } from '../types/claim';
import { PageHeader } from '../components/PageHeader';
import { SummaryCard } from '../components/SummaryCard';
import { StatusBadge } from '../components/StatusBadge';
import { ClaimStatusTimeline } from '../components/ClaimStatusTimeline';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import {
  FileText,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  RefreshCw
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [policiesData, claimsData] = await Promise.all([
        policyService.getPolicies(),
        claimService.getClaims(),
      ]);
      setPolicies(Array.isArray(policiesData) ? policiesData : []);
      setClaims(Array.isArray(claimsData) ? claimsData : []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Safe data calculations
  const safeClaims = Array.isArray(claims) ? claims : [];
  const safePolicies = Array.isArray(policies) ? policies : [];

  const ongoingClaims = safeClaims.filter(
    (c) =>
      c &&
      (c.status === 'SUBMITTED' ||
        c.status === 'POLICY_VALIDATED' ||
        c.status === 'UNDER_REVIEW')
  );

  const activePolicies = safePolicies.filter((p) => p && p.status === 'ACTIVE');

  // Next renewal: earliest expiring active policy
  const sortedByExpiry = [...activePolicies]
    .filter((p) => p && p.endDate)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  const nextRenewalPolicy = sortedByExpiry[0] || null;

  // Action needed: any claim in UNDER_REVIEW or policy expiring within 60 days
  const now = new Date();
  const expiringSoonPolicies = activePolicies.filter((p) => {
    if (!p || !p.endDate) return false;
    const expDate = new Date(p.endDate);
    const time = expDate.getTime();
    if (isNaN(time)) return false;
    const diffDays = Math.ceil((time - now.getTime()) / (1000 * 3600 * 24));
    return diffDays > 0 && diffDays <= 60;
  });

  const actionsNeeded = [
    ...ongoingClaims
      .filter((c) => c.status === 'UNDER_REVIEW')
      .map((c) => ({
        type: 'claim' as const,
        id: c.id,
        title: `Claim #${c.claimNumber} under review`,
        description: 'Underwriting adjudication evaluation is in progress.',
        link: `/claims/${c.id}`,
        linkText: 'Track Adjudication',
      })),
    ...expiringSoonPolicies.map((p) => ({
      type: 'policy' as const,
      id: p.id,
      title: `Policy ${p.policyNumber} renewal approaching`,
      description: `Coverage expires on ${p.endDate}. Review benefits or submit renewal.`,
      link: '/policies',
      linkText: 'View Policy',
    })),
  ];

  if (loading) {
    return <LoadingState message="Loading your insurance dashboard..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        message={error}
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Welcome Page Header */}
      <PageHeader
        title={`Welcome back, ${user?.username || 'Customer'}`}
        subtitle="Manage your active insurance policies, track ongoing claims, and submit new reimbursement requests."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={fetchDashboardData}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle size={15} />}
              onClick={() => navigate('/claims/new')}
            >
              File a Claim
            </Button>
          </div>
        }
      />

      {/* 2. Small Summary Cards (Supported by real API data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <SummaryCard
          title="Ongoing Claims"
          value={ongoingClaims.length}
          subtitle={
            ongoingClaims.length > 0
              ? `${ongoingClaims.length} active in adjudication lifecycle`
              : 'No claims currently in progress'
          }
          icon={FileText}
          onClick={() => navigate('/claims')}
        />

        <SummaryCard
          title="Active Policies"
          value={activePolicies.length}
          subtitle={`Across ${policies.length} total lifetime registered policies`}
          icon={ShieldCheck}
          onClick={() => navigate('/policies')}
        />

        <SummaryCard
          title="Next Policy Renewal"
          value={nextRenewalPolicy ? nextRenewalPolicy.endDate : 'None'}
          subtitle={
            nextRenewalPolicy
              ? `${nextRenewalPolicy.policyNumber} (${nextRenewalPolicy.policyType})`
              : 'All registered policies up to date'
          }
          icon={Calendar}
          onClick={() => navigate('/policies')}
        />
      </div>

      {/* 3. Action Needed Section (Only shown when supported by genuine data) */}
      {actionsNeeded.length > 0 && (
        <div className="bg-[#FFFDF7] border border-[#FDE68A] rounded-xl p-5 shadow-subtle">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-[#B45309]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#92400E]">
              Action & Attention Required ({actionsNeeded.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {actionsNeeded.slice(0, 3).map((action, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-lg border border-[#FDE68A]/60"
              >
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#30264A]">
                    {action.title}
                  </p>
                  <p className="text-xs text-[#777181]">{action.description}</p>
                </div>
                <Link
                  to={action.link}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B4886] hover:text-[#30264A] shrink-0"
                >
                  <span>{action.linkText}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Ongoing Claims Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#30264A] tracking-tight">
              Ongoing Claims ({ongoingClaims.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#777181]">
              Live status tracking and audit history for active submissions.
            </p>
          </div>

          <Link
            to="/claims"
            className="text-xs sm:text-sm font-semibold text-[#5B4886] hover:text-[#30264A] inline-flex items-center gap-1"
          >
            <span>View All Claims</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {ongoingClaims.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No ongoing claims"
            description="You currently have no active claims in progress. If you incurred a recent covered expense, submit a new claim to begin automated adjudication."
            action={{
              label: 'File a Claim Now',
              onClick: () => navigate('/claims/new'),
              icon: PlusCircle,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {ongoingClaims.map((claim) => (
              <div
                key={claim.id}
                onClick={() => navigate(`/claims/${claim.id}`)}
                className="bg-white rounded-xl border border-[#EAE6F2] p-5 sm:p-6 shadow-subtle hover:border-[#D4C7F5] hover:shadow-card transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8E8A98]">
                        Claim Ref
                      </span>
                      <h3 className="text-base font-bold text-[#30264A]">
                        {claim.claimNumber}
                      </h3>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>

                  <p className="text-xs sm:text-sm text-[#211D2B] font-medium line-clamp-2 mb-3">
                    {claim.description || 'Insurance reimbursement claim'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#777181] mb-4 bg-[#F7F6FA] p-3 rounded-lg border border-[#EAE6F2]">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#8E8A98]">
                        Amount
                      </span>
                      <span className="font-bold text-[#30264A] text-sm">
                        ${Number(claim.claimAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#8E8A98]">
                        Submitted On
                      </span>
                      <span className="font-medium text-[#30264A]">
                        {claim.claimDate || claim.createdAt?.split('T')[0] || 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2">
                    <span className="text-[11px] uppercase font-semibold text-[#8E8A98] tracking-wider block mb-1">
                      Adjudication Progress
                    </span>
                    <ClaimStatusTimeline currentStatus={claim.status} compact />
                  </div>

                  <div className="pt-3 border-t border-[#EAE6F2] flex items-center justify-between text-xs text-[#8E8A98]">
                    <span>
                      Updated:{' '}
                      {claim.updatedAt
                        ? new Date(claim.updatedAt).toLocaleDateString()
                        : 'Recent'}
                    </span>
                    <span className="text-[#5B4886] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Active Policies Snapshot */}
      <div className="bg-white rounded-xl border border-[#EAE6F2] p-5 sm:p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE6F2]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#30264A]">
              Active Policies Summary
            </h2>
            <p className="text-xs text-[#777181]">
              Eligible coverage plans available for claim filings.
            </p>
          </div>
          <Link
            to="/policies"
            className="text-xs font-semibold text-[#5B4886] hover:text-[#30264A]"
          >
            Manage Policies &rarr;
          </Link>
        </div>

        {activePolicies.length === 0 ? (
          <p className="text-xs text-[#777181] py-4 text-center">
            No active policies found on record.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePolicies.slice(0, 3).map((policy) => (
              <div
                key={policy.id}
                className="p-3.5 rounded-lg border border-[#EAE6F2] bg-[#F7F6FA]/60 hover:bg-[#F0EDFF]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#30264A]">
                    {policy.policyNumber}
                  </span>
                  <StatusBadge status={policy.status} size="sm" />
                </div>
                <p className="text-xs text-[#777181] font-medium mb-2">
                  {policy.policyType} &bull; Cap: ${Number(policy.coverageAmount).toLocaleString()}
                </p>
                <span className="text-[11px] text-[#8E8A98]">
                  Valid: {policy.startDate} to {policy.endDate}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
