import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimService } from '../services/claimService';
import { policyService } from '../services/policyService';
import { Claim } from '../types/claim';
import { Policy } from '../types/policy';
import { getErrorMessage } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { ClaimStatusTimeline } from '../components/ClaimStatusTimeline';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import {
  FileText,
  PlusCircle,
  Search,
  ChevronRight,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';

export const ClaimsPage: React.FC = () => {
  const navigate = useNavigate();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [policyFilter, setPolicyFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [claimsData, policiesData] = await Promise.all([
        claimService.getClaims(),
        policyService.getPolicies(),
      ]);
      setClaims(claimsData);
      setPolicies(policiesData);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Map policyId to policyNumber for quick lookup
  const policyMap = useMemo(() => {
    const map = new Map<number, Policy>();
    policies.forEach((p) => map.set(p.id, p));
    return map;
  }, [policies]);

  // Extract available years from real data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    claims.forEach((c) => {
      const d = c.claimDate || c.createdAt;
      if (d) {
        years.add(d.slice(0, 4));
      }
    });
    return Array.from(years).sort().reverse();
  }, [claims]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Search
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        claim.claimNumber.toLowerCase().includes(query) ||
        (claim.description && claim.description.toLowerCase().includes(query)) ||
        claim.customerName.toLowerCase().includes(query);

      // Status
      const matchesStatus =
        statusFilter === 'ALL' || claim.status === statusFilter;

      // Year
      const claimDate = claim.claimDate || claim.createdAt || '';
      const matchesYear =
        yearFilter === 'ALL' || claimDate.startsWith(yearFilter);

      // Policy
      const matchesPolicy =
        policyFilter === 'ALL' || String(claim.policyId) === policyFilter;

      return matchesSearch && matchesStatus && matchesYear && matchesPolicy;
    });
  }, [claims, searchQuery, statusFilter, yearFilter, policyFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredClaims.length / pageSize) || 1;
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClaims.slice(start, start + pageSize);
  }, [filteredClaims, currentPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setYearFilter('ALL');
    setPolicyFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <PageHeader
        title="Insurance Claims"
        subtitle="Review your filed claims, inspect real-time adjudication status, and submit new reimbursement requests."
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Claims' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={fetchData}
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

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-[#EAE6F2] p-4 sm:p-5 shadow-subtle space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8A98]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by claim reference, customer, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F7F6FA] border border-[#EAE6F2] rounded-xl text-xs sm:text-sm text-[#211D2B] placeholder-[#8E8A98] focus:outline-none focus:border-[#5B4886] focus:bg-white transition-all"
            />
          </div>

          {/* Quick Clear Filter */}
          {(searchQuery || statusFilter !== 'ALL' || yearFilter !== 'ALL' || policyFilter !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="px-3.5 py-2 text-xs font-semibold text-[#5B4886] hover:bg-[#F0EDFF] rounded-xl border border-[#D4C7F5] transition-colors cursor-pointer shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-[#EAE6F2]">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E8A98] mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#EAE6F2] rounded-lg text-xs font-medium text-[#211D2B] focus:outline-none focus:border-[#5B4886]"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="POLICY_VALIDATED">Policy Validated</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E8A98] mb-1">
              Filing Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#EAE6F2] rounded-lg text-xs font-medium text-[#211D2B] focus:outline-none focus:border-[#5B4886]"
            >
              <option value="ALL">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Policy Filter */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8E8A98] mb-1">
              Policy Reference
            </label>
            <select
              value={policyFilter}
              onChange={(e) => {
                setPolicyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-[#EAE6F2] rounded-lg text-xs font-medium text-[#211D2B] focus:outline-none focus:border-[#5B4886]"
            >
              <option value="ALL">All Associated Policies</option>
              {policies.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.policyNumber} ({p.policyType})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Claims List / Table */}
      {loading ? (
        <LoadingState message="Fetching claims data..." />
      ) : error ? (
        <ErrorState
          title="Unable to load claims"
          message={error}
          onRetry={fetchData}
        />
      ) : filteredClaims.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={claims.length === 0 ? 'No claims submitted yet' : 'No claims match your filters'}
          description={
            claims.length === 0
              ? 'You have not submitted any insurance reimbursement claims yet. Click below to file your first claim against an active policy.'
              : 'Try adjusting your search criteria or resetting the filters to view claims.'
          }
          action={
            claims.length === 0
              ? {
                  label: 'File a Claim',
                  onClick: () => navigate('/claims/new'),
                  icon: PlusCircle,
                }
              : {
                  label: 'Reset Filters',
                  onClick: resetFilters,
                }
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#EAE6F2] shadow-subtle overflow-hidden">
          {/* Table Header / Count */}
          <div className="px-5 py-3.5 border-b border-[#EAE6F2] flex items-center justify-between text-xs text-[#777181]">
            <span className="font-medium">
              Showing <strong className="text-[#30264A]">{paginatedClaims.length}</strong> of{' '}
              <strong className="text-[#30264A]">{filteredClaims.length}</strong> total records
            </span>
            <span className="text-[11px] text-[#8E8A98]">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F7F6FA] text-[#777181] font-semibold text-[11px] uppercase tracking-wider border-b border-[#EAE6F2]">
                <tr>
                  <th className="py-3 px-5">Claim Ref</th>
                  <th className="py-3 px-4">Policy</th>
                  <th className="py-3 px-4">Claimant</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Lifecycle Step</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6F2]">
                {paginatedClaims.map((claim) => {
                  const policy = policyMap.get(claim.policyId);
                  return (
                    <tr
                      key={claim.id}
                      onClick={() => navigate(`/claims/${claim.id}`)}
                      className="hover:bg-[#F0EDFF]/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-[#30264A]">
                        {claim.claimNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#777181]">
                        <span className="font-semibold text-[#30264A]">
                          {policy ? policy.policyNumber : `ID #${claim.policyId}`}
                        </span>
                        {policy && (
                          <span className="block text-[11px] text-[#8E8A98]">
                            {policy.policyType}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#211D2B]">
                        {claim.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-[#777181] whitespace-nowrap">
                        {claim.claimDate || claim.createdAt?.split('T')[0] || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#30264A]">
                        ${Number(claim.claimAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 w-44">
                        <ClaimStatusTimeline currentStatus={claim.status} compact />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B4886] group-hover:text-[#30264A] transition-colors">
                          <span>View</span>
                          <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-[#EAE6F2]">
            {paginatedClaims.map((claim) => {
              const policy = policyMap.get(claim.policyId);
              return (
                <div
                  key={claim.id}
                  onClick={() => navigate(`/claims/${claim.id}`)}
                  className="p-4 hover:bg-[#F0EDFF]/20 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#30264A]">
                      {claim.claimNumber}
                    </span>
                    <StatusBadge status={claim.status} size="sm" />
                  </div>

                  <p className="text-xs text-[#211D2B] font-medium line-clamp-1">
                    {claim.description || 'Insurance reimbursement claim'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#777181] bg-[#F7F6FA] p-2.5 rounded-lg border border-[#EAE6F2]">
                    <div>
                      <span className="text-[10px] uppercase text-[#8E8A98] block">Policy</span>
                      <span className="font-semibold text-[#30264A]">
                        {policy ? policy.policyNumber : `#${claim.policyId}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-[#8E8A98] block">Amount</span>
                      <span className="font-bold text-[#30264A]">
                        ${Number(claim.claimAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <ClaimStatusTimeline currentStatus={claim.status} compact />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-[#EAE6F2] flex items-center justify-between bg-[#F7F6FA]">
              <Button
                variant="secondary"
                size="sm"
                icon={<ChevronLeft size={14} />}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>

              <span className="text-xs text-[#777181] font-medium">
                Page <strong className="text-[#30264A]">{currentPage}</strong> of{' '}
                <strong className="text-[#30264A]">{totalPages}</strong>
              </span>

              <Button
                variant="secondary"
                size="sm"
                iconRight={<ChevronRight size={14} />}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
