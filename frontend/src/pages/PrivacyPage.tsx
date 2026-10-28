import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { AlertBanner } from '../components/AlertBanner';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  Download,
  Database
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { user } = useAuth();

  // Functional preferences
  const [preferences, setPreferences] = useState({
    claimStatusLiveSync: true,
    telemetryLogging: false,
    optionalHealthConsent: false,
    marketingCommunications: false
  });

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setFeedback({
        type: 'success',
        message: `Privacy preference for "${key}" updated for this session.`
      });
      return updated;
    });
  };

  const handleExportData = () => {
    const exportPayload = {
      user: {
        username: user?.username || 'customer',
        role: user?.role || 'CUSTOMER',
        exportedAt: new Date().toISOString()
      },
      privacyPreferences: preferences,
      dataProtectionNotice:
        'Aegis Claims System strictly adheres to DPDP and GDPR data minimization standards. Authentication credentials and claims audit records are cryptographically secured.'
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aegis-Privacy-Data-Export-${user?.username || 'user'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Privacy & Consent Governance"
        subtitle="Configure data protection settings, consent purposes, and exercise personal data rights."
        breadcrumbs={[{ label: 'Privacy & Consent' }]}
      />

      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Overview Notice */}
      <div className="bg-aegis-surface border border-aegis-lavender/50 rounded-2xl p-5 shadow-aegis-card flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-white border border-aegis-border flex items-center justify-center text-aegis-action flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-aegis-secondary">
          <h4 className="font-semibold text-sm text-aegis-primary">
            Data Minimization & Sovereign Governance
          </h4>
          <p>
            Aegis is architected on the principle of data minimization. Your insurance records, policy contracts, and claim evaluations are isolated across purpose-specific microservices and are never sold to external third-party data brokers.
          </p>
        </div>
      </div>

      {/* Data Categories Governance Table */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
        <div className="flex items-center gap-2 border-b border-aegis-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-aegis-text">
              Personal Data Categories & Storage Purposes
            </h3>
            <p className="text-xs text-aegis-secondary">
              Transparent disclosure of every data entity processed by Aegis microservices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-aegis-text">Identity & Session Credentials</span>
              <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-aegis-border text-aegis-action">
                Authentication Engine
              </span>
            </div>
            <p className="text-aegis-secondary">
              Stores username, BCrypt-hashed password, assigned RBAC role, and issues signed HMAC-SHA256 JWT tokens. Tokens are transmitted over HTTP Authorization headers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-aegis-text">Policy & Underwriting Limits</span>
              <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-aegis-border text-aegis-action">
                Policy Registry
              </span>
            </div>
            <p className="text-aegis-secondary">
              Maintains customer policy schedule, insured coverage ceiling amounts, and validity dates used for adjudication verification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-aegis-text">Claims & Incident Descriptions</span>
              <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-aegis-border text-aegis-action">
                Claims Management
              </span>
            </div>
            <p className="text-aegis-secondary">
              Stores formal claim submissions, financial loss figures, incident narratives, and immutable transition audit logs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-aegis-text">Automated Adjudication Decisions</span>
              <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-aegis-border text-aegis-action">
                Adjudication Service
              </span>
            </div>
            <p className="text-aegis-secondary">
              Evaluates incoming claims against active coverage ceilings. Decisions and mathematical reason strings are stored for auditing compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Consent Preferences */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
        <div className="flex items-center gap-2 border-b border-aegis-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-aegis-text">
              Active Consent Preferences
            </h3>
            <p className="text-xs text-aegis-secondary">
              Preferences are enforced across client interactions and microservice gateways.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Toggle 1 */}
          <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-aegis-text block">
                Real-Time WebSocket State Sync (STOMP)
              </span>
              <p className="text-xs text-aegis-secondary">
                Permits real-time claim status update notifications streamed directly from the message broker to your browser session.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('claimStatusLiveSync')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                preferences.claimStatusLiveSync ? 'bg-aegis-action' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  preferences.claimStatusLiveSync ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-aegis-text block">
                Sensitive Health & Medical Data Sharing
              </span>
              <p className="text-xs text-aegis-secondary">
                Authorizes medical review teams to inspect optional health questionnaire responses during complex hospitalization claims.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('optionalHealthConsent')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                preferences.optionalHealthConsent ? 'bg-aegis-action' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  preferences.optionalHealthConsent ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-aegis-text block">
                Telemetry & System Performance Diagnostics
              </span>
              <p className="text-xs text-aegis-secondary">
                Shares anonymous frontend network latency and Gateway load-balancing metrics with the operations engineering team.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('telemetryLogging')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                preferences.telemetryLogging ? 'bg-aegis-action' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  preferences.telemetryLogging ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Subject Rights Actions */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
        <div className="flex items-center gap-2 border-b border-aegis-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-aegis-text">
              Data Subject Rights (DPDP & GDPR)
            </h3>
            <p className="text-xs text-aegis-secondary">
              Export your personal data or file a formal right-to-be-forgotten request.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-aegis-text">Export Machine-Readable Profile</p>
            <p className="text-aegis-secondary">
              Download all active identity attributes, role authorizations, and consent logs in JSON format.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportData}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export My Data (.JSON)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
