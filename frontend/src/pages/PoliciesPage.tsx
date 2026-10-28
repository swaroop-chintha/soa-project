import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyService } from '../services/policyService';
import { Policy, PolicyRequest, PolicyValidationResponse } from '../types/policy';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';
import { Modal } from '../components/Modal';
import { AlertBanner } from '../components/AlertBanner';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { SummaryCard } from '../components/SummaryCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  DollarSign,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);

  // Selected policy and form data
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [validationResult, setValidationResult] = useState<PolicyValidationResponse | null>(null);
  const [validating, setValidating] = useState(false);

  // Form State
  const initialFormState: PolicyRequest = {
    policyNumber: '',
    customerName: '',
    policyType: 'HEALTH',
    coverageAmount: 10000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ACTIVE'
  };
  const [formData, setFormData] = useState<PolicyRequest>(initialFormState);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await policyService.getPolicies();
      setPolicies(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      ...initialFormState,
      policyNumber: `POL-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    try {
      await policyService.createPolicy({
        ...formData,
        coverageAmount: Number(formData.coverageAmount)
      });
      setIsCreateModalOpen(false);
      setSuccessMsg('Policy created successfully.');
      loadPolicies();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEdit = (policy: Policy) => {
    setSelectedPolicy(policy);
    setFormData({
      policyNumber: policy.policyNumber,
      customerName: policy.customerName,
      policyType: policy.policyType,
      coverageAmount: policy.coverageAmount,
      startDate: policy.startDate,
      endDate: policy.endDate,
      status: policy.status
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      await policyService.updatePolicy(selectedPolicy.id, {
        ...formData,
        coverageAmount: Number(formData.coverageAmount)
      });
      setIsEditModalOpen(false);
      setSuccessMsg('Policy updated successfully.');
      loadPolicies();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (policy: Policy) => {
    if (!window.confirm(`Are you sure you want to delete policy ${policy.policyNumber}?`)) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    try {
      await policyService.deletePolicy(policy.id);
      setSuccessMsg(`Policy ${policy.policyNumber} deleted successfully.`);
      loadPolicies();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleOpenView = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsViewModalOpen(true);
  };

  const handleValidate = async (policy: Policy) => {
    setSelectedPolicy(policy);
    setValidating(true);
    setValidationResult(null);
    setIsValidateModalOpen(true);
    try {
      const res = await policyService.validatePolicy(policy.id);
      setValidationResult(res);
    } catch (err: unknown) {
      setValidationResult({
        valid: false,
        message: getErrorMessage(err)
      });
    } finally {
      setValidating(false);
    }
  };

  const handleDownloadCertificate = (policy: Policy) => {
    const certText = `=====================================================
AEGIS INSURANCE GROUP — CERTIFICATE OF COVERAGE
=====================================================
Policy Number:       ${policy.policyNumber}
Policy Holder:       ${policy.customerName}
Insurance Type:      ${policy.policyType}
Maximum Coverage:    $${Number(policy.coverageAmount).toLocaleString()} USD
Status:              ${policy.status}
Effective Date:      ${policy.startDate}
Expiration Date:     ${policy.endDate}
=====================================================
This official document certifies that the policy holder indicated above is covered under the terms and limitations specified in the master policy schedule.
=====================================================
Issued by Aegis Policy Management Service
`;
    const blob = new Blob([certText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aegis-Policy-${policy.policyNumber}-Certificate.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Metrics
  const totalPolicies = policies.length;
  const activePolicies = policies.filter((p) => p.status === 'ACTIVE');
  const totalCoverage = activePolicies.reduce((acc, p) => acc + (Number(p.coverageAmount) || 0), 0);
  const inactivePolicies = policies.filter((p) => p.status !== 'ACTIVE').length;

  // Filtered policies based on search and status filter
  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.policyType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Policies"
        subtitle="Inspect active coverage parameters, renewal terms, and certified insurance schedules."
        breadcrumbs={[{ label: 'My Policies' }]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadPolicies}
              isLoading={loading}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/buy-insurance')}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Browse Plans
            </Button>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Policy
              </Button>
            )}
          </div>
        }
      />

      <AlertBanner type="error" message={error} onDismiss={() => setError(null)} />
      <AlertBanner type="success" message={successMsg} onDismiss={() => setSuccessMsg(null)} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Policies"
          value={totalPolicies.toString()}
          subtitle="All recorded contracts"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <SummaryCard
          title="Active Coverage"
          value={`$${(totalCoverage / 1000).toFixed(0)}k`}
          subtitle="Total protection ceiling"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <SummaryCard
          title="Active Policies"
          value={activePolicies.length.toString()}
          subtitle="Eligible for claim filing"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SummaryCard
          title="Inactive / Expired"
          value={inactivePolicies.toString()}
          subtitle="Lapsed or cancelled"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-4 shadow-aegis-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-aegis-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies or holders..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-aegis-border bg-white text-aegis-text focus:outline-none focus:ring-2 focus:ring-aegis-action/20 focus:border-aegis-action transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                statusFilter === s
                  ? 'bg-aegis-action text-white shadow-xs'
                  : 'bg-aegis-surface text-aegis-secondary hover:text-aegis-text'
              }`}
            >
              {s === 'ALL' ? 'All Policies' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Table */}
      {loading ? (
        <LoadingState message="Retrieving insurance policies from Gateway..." />
      ) : filteredPolicies.length === 0 ? (
        <EmptyState
          title="No matching policies found"
          message={
            searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria or status filter.'
              : 'You do not have any registered policies. Explore available insurance plans to get protected.'
          }
          actionLabel="Explore Plans"
          onAction={() => navigate('/buy-insurance')}
          icon={<ShieldCheck className="w-6 h-6" />}
        />
      ) : (
        <div className="bg-aegis-card rounded-2xl border border-aegis-border overflow-hidden shadow-aegis-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-aegis-surface/60 border-b border-aegis-border text-aegis-secondary font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 pl-6">Policy No</th>
                  <th className="py-3.5 px-4">Policy Holder</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Coverage Limit</th>
                  <th className="py-3.5 px-4">Term Validity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aegis-border/60">
                {filteredPolicies.map((p) => (
                  <tr key={p.id} className="hover:bg-aegis-surface/40 transition">
                    <td className="py-4 pl-6 font-mono font-semibold text-aegis-text">
                      {p.policyNumber}
                    </td>
                    <td className="py-4 px-4 font-medium text-aegis-text">
                      {p.customerName}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-aegis-surface text-aegis-primary font-medium border border-aegis-border">
                        {p.policyType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-aegis-action">
                      ${Number(p.coverageAmount).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-xs text-aegis-secondary">
                      {p.startDate} → {p.endDate}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenView(p)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-aegis-surface hover:bg-aegis-surface/80 text-aegis-text border border-aegis-border transition"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleValidate(p)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-aegis-surface hover:bg-aegis-surface/80 text-aegis-action border border-aegis-border transition"
                          title="Run Adjudication Eligibility Test"
                        >
                          Validate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadCertificate(p)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-aegis-surface hover:bg-aegis-surface/80 text-aegis-secondary hover:text-aegis-text border border-aegis-border transition"
                          title="Download Certificate"
                        >
                          <Download className="w-3 h-3 inline mr-1" />
                          Cert
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-aegis-surface hover:bg-aegis-surface/80 text-aegis-text border border-aegis-border transition"
                              title="Edit Policy"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                              title="Delete Policy"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-aegis-border bg-aegis-surface/40 text-xs text-aegis-secondary flex items-center justify-between">
            <span>Showing {filteredPolicies.length} of {policies.length} registered policies</span>
          </div>
        </div>
      )}

      {/* CREATE POLICY MODAL (Admin) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Insurance Policy"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <AlertBanner type="error" message={formError} onDismiss={() => setFormError(null)} />

          <div className="space-y-1">
            <label htmlFor="policyNumber" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
              Policy Number
            </label>
            <input
              id="policyNumber"
              type="text"
              value={formData.policyNumber}
              onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="customerName" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
              Policy Holder Name
            </label>
            <input
              id="customerName"
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="policyType" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
                Policy Type
              </label>
              <select
                id="policyType"
                value={formData.policyType}
                onChange={(e) => setFormData({ ...formData, policyType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
              >
                <option value="HEALTH">HEALTH</option>
                <option value="AUTO">AUTO</option>
                <option value="HOME">HOME</option>
                <option value="LIFE">LIFE</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="coverageAmount" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
                Coverage Amount ($)
              </label>
              <input
                id="coverageAmount"
                type="number"
                min="100"
                value={formData.coverageAmount}
                onChange={(e) => setFormData({ ...formData, coverageAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="startDate" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="endDate" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-aegis-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={formSubmitting}
            >
              Save Policy
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT POLICY MODAL (Admin) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Policy: ${selectedPolicy?.policyNumber}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <AlertBanner type="error" message={formError} onDismiss={() => setFormError(null)} />

          <div className="space-y-1">
            <label htmlFor="editCustomerName" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
              Policy Holder Name
            </label>
            <input
              id="editCustomerName"
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="editPolicyType" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
                Policy Type
              </label>
              <select
                id="editPolicyType"
                value={formData.policyType}
                onChange={(e) => setFormData({ ...formData, policyType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
              >
                <option value="HEALTH">HEALTH</option>
                <option value="AUTO">AUTO</option>
                <option value="HOME">HOME</option>
                <option value="LIFE">LIFE</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="editCoverageAmount" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
                Coverage Amount ($)
              </label>
              <input
                id="editCoverageAmount"
                type="number"
                min="100"
                value={formData.coverageAmount}
                onChange={(e) => setFormData({ ...formData, coverageAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="editStatus" className="text-xs font-semibold text-aegis-secondary uppercase tracking-wider">
              Status
            </label>
            <select
              id="editStatus"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-aegis-border text-sm focus:ring-2 focus:ring-aegis-action focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-aegis-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={formSubmitting}
            >
              Update Policy
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW POLICY MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Policy Specifications: ${selectedPolicy?.policyNumber}`}
      >
        {selectedPolicy && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-aegis-surface border border-aegis-border">
                <span className="text-aegis-secondary block mb-0.5">Policy Number</span>
                <span className="font-mono font-semibold text-aegis-text">{selectedPolicy.policyNumber}</span>
              </div>
              <div className="p-3 rounded-xl bg-aegis-surface border border-aegis-border">
                <span className="text-aegis-secondary block mb-0.5">Policy Holder</span>
                <span className="font-semibold text-aegis-text">{selectedPolicy.customerName}</span>
              </div>
              <div className="p-3 rounded-xl bg-aegis-surface border border-aegis-border">
                <span className="text-aegis-secondary block mb-0.5">Insurance Type</span>
                <span className="font-semibold text-aegis-text">{selectedPolicy.policyType}</span>
              </div>
              <div className="p-3 rounded-xl bg-aegis-surface border border-aegis-border">
                <span className="text-aegis-secondary block mb-0.5">Coverage Ceiling</span>
                <span className="font-semibold text-aegis-action">
                  ${Number(selectedPolicy.coverageAmount).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-aegis-surface border border-aegis-border">
                <span className="text-aegis-secondary block mb-0.5">Effective Term</span>
                <span className="text-aegis-text">{selectedPolicy.startDate} → {selectedPolicy.endDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-aegis-surface border border-aegis-border">
                <span className="text-aegis-secondary block mb-0.5">Status</span>
                <StatusBadge status={selectedPolicy.status} size="sm" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border text-xs text-aegis-secondary">
              <p>
                <strong>Claim Eligibility:</strong> {selectedPolicy.status === 'ACTIVE'
                  ? 'This policy is active and in good standing. Claims within coverage limits can be adjudicated.'
                  : 'This policy is currently inactive or lapsed. Claims filed under this policy will fail validation.'}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-aegis-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadCertificate(selectedPolicy)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download Certificate
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                {selectedPolicy.status === 'ACTIVE' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      navigate('/claims/new');
                    }}
                  >
                    File Claim
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* VALIDATE POLICY MODAL */}
      <Modal
        isOpen={isValidateModalOpen}
        onClose={() => setIsValidateModalOpen(false)}
        title={`Adjudication Eligibility Check: ${selectedPolicy?.policyNumber}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-aegis-secondary">
            Verifying policy eligibility, term dates, and coverage limits against automated underwriting rules.
          </p>

          {validating ? (
            <div className="py-8 text-center text-aegis-secondary">
              <RefreshCw className="w-8 h-8 text-aegis-action mx-auto mb-2 animate-spin" />
              <p className="text-sm font-medium">Validating policy constraints...</p>
            </div>
          ) : validationResult ? (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                validationResult.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {validationResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-sm">
                  {validationResult.valid ? 'Policy is Eligible' : 'Policy Validation Failed'}
                </h4>
                <p>{validationResult.message || (validationResult.valid ? 'Policy is active and in good standing.' : 'Policy failed adjudication eligibility check.')}</p>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end pt-3 border-t border-aegis-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsValidateModalOpen(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PoliciesPage;
