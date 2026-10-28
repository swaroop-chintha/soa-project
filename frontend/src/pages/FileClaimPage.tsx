import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimService } from '../services/claimService';
import { policyService } from '../services/policyService';
import { Policy } from '../types/policy';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { AlertBanner } from '../components/AlertBanner';
import { LoadingState } from '../components/LoadingState';
import {
  ShieldAlert,
  FileText,
  DollarSign,
  Info,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const FileClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [policiesError, setPoliciesError] = useState<string | null>(null);

  // Form Fields
  const [policyId, setPolicyId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>(user?.username || '');
  const [claimAmount, setClaimAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Idempotency Key
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  });

  // State
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoadingPolicies(true);
    setPoliciesError(null);
    try {
      const data = await policyService.getPolicies();
      // Filter for active policies eligible for claim filing
      const eligible = data.filter((p) => p.status === 'ACTIVE');
      setPolicies(eligible);
      if (eligible.length > 0) {
        setPolicyId(eligible[0].id.toString());
      }
    } catch (err: unknown) {
      setPoliciesError(getErrorMessage(err));
    } finally {
      setLoadingPolicies(false);
    }
  };

  const selectedPolicy = policies.find((p) => p.id.toString() === policyId);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!policyId) {
      errors.policyId = 'Please select an eligible active policy.';
    }

    if (!customerName.trim()) {
      errors.customerName = 'Claimant name is required.';
    }

    const amountNum = Number(claimAmount);
    if (!claimAmount || isNaN(amountNum) || amountNum <= 0) {
      errors.claimAmount = 'Please enter a valid positive claim amount.';
    } else if (selectedPolicy && amountNum > selectedPolicy.coverageAmount) {
      errors.claimAmount = `Claim amount ($${amountNum.toLocaleString()}) exceeds the maximum coverage ($${selectedPolicy.coverageAmount.toLocaleString()}) for this policy.`;
    }

    if (!description.trim()) {
      errors.description = 'Please describe the incident in detail.';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // Append incident date note to description so it is preserved in claim-service DTO
      const fullDescription = incidentDate
        ? `[Incident Date: ${incidentDate}] ${description.trim()}`
        : description.trim();

      const created = await claimService.createClaim(
        {
          policyId: Number(policyId),
          customerName: customerName.trim(),
          claimAmount: Number(claimAmount),
          description: fullDescription
        },
        idempotencyKey
      );

      setSubmitSuccess(
        `Claim #${created.claimNumber} filed successfully with status ${created.status}. Redirecting to details...`
      );

      setTimeout(() => {
        navigate(`/claims/${created.id}`);
      }, 1500);
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err));
      // Refresh idempotency key on failure to avoid stale replay if the user modifies input
      setIdempotencyKey(
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="File a Claim"
        subtitle="Submit a formal insurance claim directly to the Aegis automated adjudication engine."
        breadcrumbs={[
          { label: 'Claims', href: '/claims' },
          { label: 'File a Claim' }
        ]}
      />

      {policiesError && (
        <AlertBanner
          type="error"
          message={policiesError}
          onDismiss={() => setPoliciesError(null)}
        />
      )}

      {submitError && (
        <AlertBanner
          type="error"
          message={submitError}
          onDismiss={() => setSubmitError(null)}
        />
      )}

      {submitSuccess && (
        <AlertBanner
          type="success"
          message={submitSuccess}
          onDismiss={() => setSubmitSuccess(null)}
        />
      )}

      {loadingPolicies ? (
        <LoadingState message="Verifying your eligible active insurance policies..." />
      ) : policies.length === 0 ? (
        <div className="bg-aegis-card rounded-2xl border border-aegis-border p-8 text-center space-y-4 shadow-aegis-card">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-aegis-text">
              No Active Policies Found
            </h3>
            <p className="text-xs text-aegis-secondary max-w-md mx-auto mt-1">
              You do not have any active insurance policies eligible for filing a claim. Please acquire or activate a policy first.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/buy-insurance')}
            >
              Explore Insurance Catalogue
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadPolicies}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Policy Selection Section */}
          <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
            <div className="flex items-center gap-2 border-b border-aegis-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-aegis-text">
                  1. Policy Selection
                </h3>
                <p className="text-xs text-aegis-secondary">
                  Choose the active policy under which this incident occurred.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-aegis-text mb-1.5">
                  Select Active Policy <span className="text-rose-500">*</span>
                </label>
                <select
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-aegis-border bg-white text-xs sm:text-sm text-aegis-text focus:outline-none focus:ring-2 focus:ring-aegis-action/20 focus:border-aegis-action transition"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.policyNumber} — {p.policyType} (Limit: ${Number(p.coverageAmount).toLocaleString()})
                    </option>
                  ))}
                </select>
                {formErrors.policyId && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.policyId}</p>
                )}
              </div>

              <div>
                <FormField
                  label="Claimant Legal Name"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  error={formErrors.customerName}
                  required
                />
              </div>
            </div>

            {selectedPolicy && (
              <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-aegis-primary">
                  <Info className="w-4 h-4 text-aegis-action flex-shrink-0" />
                  <span>
                    Selected Policy Coverage: <strong>${Number(selectedPolicy.coverageAmount).toLocaleString()}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-aegis-secondary">
                  Valid until: {selectedPolicy.endDate || 'Ongoing'}
                </span>
              </div>
            )}
          </div>

          {/* Incident & Claim Amount Section */}
          <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
            <div className="flex items-center gap-2 border-b border-aegis-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-aegis-text">
                  2. Incident & Claim Amount
                </h3>
                <p className="text-xs text-aegis-secondary">
                  Specify financial loss and date of occurrence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  label="Claim Amount (USD)"
                  id="claimAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  error={formErrors.claimAmount}
                  helperText={
                    selectedPolicy
                      ? `Must not exceed coverage ceiling ($${selectedPolicy.coverageAmount.toLocaleString()})`
                      : undefined
                  }
                  required
                />
              </div>

              <div>
                <FormField
                  label="Incident Date"
                  id="incidentDate"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  helperText="Date when the loss or medical occurrence took place"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-aegis-text mb-1.5">
                Detailed Incident Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide comprehensive details: location of event, parties involved, hospital/provider name, and nature of damage or treatment..."
                className={`w-full p-3.5 rounded-xl border bg-white text-xs sm:text-sm text-aegis-text focus:outline-none focus:ring-2 focus:ring-aegis-action/20 focus:border-aegis-action transition ${
                  formErrors.description ? 'border-rose-400 ring-1 ring-rose-300' : 'border-aegis-border'
                }`}
              />
              {formErrors.description && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.description}</p>
              )}
            </div>
          </div>

          {/* Document Attachment & Adjudication Notice */}
          <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-3">
            <div className="flex items-center gap-2 border-b border-aegis-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-aegis-text">
                  3. Documentation & Verification
                </h3>
                <p className="text-xs text-aegis-secondary">
                  Supporting attachments and fraud-prevention safeguards.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border text-xs text-aegis-secondary space-y-2">
              <p>
                <strong>Backend Integration Notice:</strong> Digital document vault upload is securely automated at initial filing. If manual invoices, police reports, or medical discharge summaries are required by the adjudication service, an action notification will appear in your claim details timeline.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-aegis-primary">
                <span>Idempotency Protection Key:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-aegis-border truncate">
                  {idempotencyKey}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate('/claims')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Official Claim
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FileClaimPage;
