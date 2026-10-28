import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { AlertBanner } from '../components/AlertBanner';
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Server,
  Send,
  BookOpen
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'Claims' | 'Policies' | 'Adjudication' | 'Technical';
}

const FAQS: FaqItem[] = [
  {
    category: 'Claims',
    question: 'How does automated claim adjudication work in Aegis?',
    answer:
      'When you file a claim, it enters the Claim Service with SUBMITTED status. The Policy Service automatically validates coverage validity. Next, the claim transitions to UNDER_REVIEW, where the Approval Service evaluates whether the requested amount is within your policy coverage ceiling. If eligible, it is APPROVED automatically.'
  },
  {
    category: 'Claims',
    question: 'What is an Idempotency Key and why is it important?',
    answer:
      'An Idempotency Key is a unique identifier generated for each claim submission. If network issues occur and the form is retried, the API Gateway and Claim Service recognize the key and prevent duplicate claims from being created in PostgreSQL.'
  },
  {
    category: 'Policies',
    question: 'How do I know if my policy is eligible for claims?',
    answer:
      'Only policies with status ACTIVE and an expiration date in the future are eligible. You can check the eligibility of any policy on the "My Policies" page by clicking the "Validate" button, which queries the Policy Service (:8081) directly.'
  },
  {
    category: 'Policies',
    question: 'Where can I download my official coverage certificate?',
    answer:
      'Coverage certificates are available for instant download in both the "My Policies" page and the "Documents Vault" page. These certificates include your policy number, maximum coverage limits, and term validity.'
  },
  {
    category: 'Technical',
    question: 'How do real-time status updates work in the dashboard?',
    answer:
      'Aegis streams claim state machine transitions in real time. Any status changes or adjudication determinations executed in the background reflect immediately on your screen without requiring a page refresh.'
  },
  {
    category: 'Technical',
    question: 'How is data protected across the Aegis platform?',
    answer:
      'All insurance operations, policy limits, and personal health declarations are cryptographically segregated, transmitted over authenticated JWT channels, and governed by strict data minimization standards.'
  }
];

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Grievance inquiry form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Claim Inquiries');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const filteredFaqs = FAQS.filter(
    (faq) => selectedCategory === 'ALL' || faq.category === selectedCategory
  );

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please provide both a subject and inquiry message.'
      });
      return;
    }

    setFeedback({
      type: 'info',
      message:
        'Inquiry captured for administrative review. Note: Automated ticketing webhook integration is currently in staging; for immediate assistance, contact admin@aegis.local.'
    });
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Grievances"
        subtitle="Frequently asked questions, system architecture guides, and customer support channels."
        breadcrumbs={[{ label: 'Help' }]}
      />

      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Official System Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-aegis-card rounded-2xl border border-aegis-border p-5 shadow-aegis-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-center text-aegis-action flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-semibold text-sm text-aegis-text">
              System Administrator Contact
            </h3>
            <p className="text-aegis-secondary">
              For account access, password resets, or broker policy provisioning:
            </p>
            <p className="font-mono font-medium text-aegis-action">
              admin@aegis.local
            </p>
          </div>
        </div>

        <div className="bg-aegis-card rounded-2xl border border-aegis-border p-5 shadow-aegis-card flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-center text-aegis-action flex-shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-semibold text-sm text-aegis-text">
              Platform & Systems Availability
            </h3>
            <p className="text-aegis-secondary">
              Core insurance services and adjudication engines are fully operational and processing claims normally.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-aegis-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-aegis-text">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-aegis-secondary mt-0.5">
                Core guidelines on adjudication, limits, and real-time processing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Claims', 'Policies', 'Technical'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-aegis-action text-white shadow-xs'
                    : 'bg-aegis-surface text-aegis-secondary hover:text-aegis-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-aegis-border overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-white hover:bg-aegis-surface/40 transition"
                >
                  <span className="text-xs sm:text-sm font-semibold text-aegis-text">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-aegis-action flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-aegis-secondary flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 text-xs text-aegis-secondary bg-aegis-surface/30 border-t border-aegis-border/60 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grievance & Support Form */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
        <div className="flex items-center gap-2 border-b border-aegis-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-aegis-surface flex items-center justify-center text-aegis-action">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-aegis-text">
              Submit Customer Inquiry or Grievance
            </h3>
            <p className="text-xs text-aegis-secondary">
              Report an issue with claim adjudication, policy limits, or account access.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitInquiry} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-aegis-text mb-1.5">
                Inquiry Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-aegis-border bg-white text-xs sm:text-sm text-aegis-text focus:outline-none focus:ring-2 focus:ring-aegis-action/20 focus:border-aegis-action transition"
              >
                <option value="Claim Inquiries">Claim Inquiries</option>
                <option value="Policy Coverage">Policy Coverage & Validation</option>
                <option value="Adjudication Reconsideration">Adjudication Reconsideration</option>
                <option value="Billing & ACH Payout">Billing & ACH Payout</option>
                <option value="Technical & Authentication">Technical & Authentication</option>
              </select>
            </div>

            <div>
              <FormField
                label="Subject Summary"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question regarding claim #CLM-4920 adjudication"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-aegis-text mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain the background of your grievance or question in detail..."
              className="w-full p-3.5 rounded-xl border border-aegis-border bg-white text-xs sm:text-sm text-aegis-text focus:outline-none focus:ring-2 focus:ring-aegis-action/20 focus:border-aegis-action transition"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-aegis-secondary">
              Inquiries are logged under your authenticated customer profile.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Inquiry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HelpPage;
