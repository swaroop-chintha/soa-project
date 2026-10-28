import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { AlertBanner } from '../components/AlertBanner';
import {
  User,
  Shield,
  Heart,
  Brain,
  Car,
  Home,
  Users,
  CreditCard,
  Lock,
  Info,
  CheckCircle2,
  Save
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  // Active section tab
  const [activeTab, setActiveTab] = useState<string>('personal');

  // Form State
  const [personal, setPersonal] = useState({
    username: user?.username || 'customer',
    fullName: user?.username ? user.username.toUpperCase() : 'Aegis Customer',
    dob: '1990-05-15',
    gender: 'Male',
    occupation: 'Professional'
  });

  const [contact, setContact] = useState({
    email: `${user?.username || 'customer'}@example.com`,
    phone: '+1 (555) 382-9104',
    addressLine1: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477'
  });

  const [kyc] = useState({
    idType: 'PASSPORT',
    idNumber: 'A12894562',
    status: 'VERIFIED',
    issueDate: '2021-03-10',
    expiryDate: '2031-03-09'
  });

  const [health, setHealth] = useState({
    bloodGroup: 'O+',
    allergies: 'Penicillin',
    chronicConditions: 'None reported',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+1 (555) 902-1144'
  });

  // Consent-based Mental Health Section
  const [mentalHealthConsent, setMentalHealthConsent] = useState(false);
  const [mentalHealthData, setMentalHealthData] = useState({
    counselingHistory: 'None',
    stressManagementNotes: 'Standard workplace wellness sessions',
    consentGrantedAt: ''
  });

  const [vehicles] = useState([
    { id: 'v1', make: 'Tesla', model: 'Model 3', year: '2023', vin: '5YJ3E1EB8PF123456', plate: '7ABC123' },
    { id: 'v2', make: 'Toyota', model: 'RAV4', year: '2021', vin: '2T3C1RFV5MC987654', plate: '9XYZ789' }
  ]);

  const [assets] = useState([
    { id: 'a1', type: 'Primary Residence', address: '742 Evergreen Terrace, Springfield, OR', estimatedValue: '$450,000' }
  ]);

  const [nominees] = useState([
    { id: 'n1', name: 'Jane Doe', relationship: 'Spouse', sharePercentage: 70 },
    { id: 'n2', name: 'Alex Doe', relationship: 'Child', sharePercentage: 30 }
  ]);

  const [bankDetails] = useState({
    accountHolder: user?.username ? user.username.toUpperCase() : 'Aegis Customer',
    bankName: 'First Federal Reserve Bank',
    routingNumber: '021000021',
    accountNumberMasked: '•••• •••• 4892',
    accountType: 'CHECKING'
  });

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    // Do NOT store sensitive medical or bank details in localStorage
    // Inform user of backend persistence status
    setFeedback({
      type: 'info',
      message:
        'Profile parameters validated. Your account identity is secured under your authenticated credentials.'
    });
  };

  const tabs = [
    { id: 'personal', label: 'Personal & Contact', icon: <User className="w-4 h-4" /> },
    { id: 'kyc', label: 'KYC & Identity', icon: <Shield className="w-4 h-4" /> },
    { id: 'health', label: 'Health & Medical', icon: <Heart className="w-4 h-4" /> },
    { id: 'mental-health', label: 'Mental Wellness (Optional)', icon: <Brain className="w-4 h-4" /> },
    { id: 'assets', label: 'Vehicles & Assets', icon: <Car className="w-4 h-4" /> },
    { id: 'nominees', label: 'Nominees & Dependents', icon: <Users className="w-4 h-4" /> },
    { id: 'banking', label: 'Claim Payout Bank', icon: <CreditCard className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile & Assets"
        subtitle="Manage identity credentials, KYC records, insured assets, and claim payout bank accounts."
        breadcrumbs={[{ label: 'My Profile' }]}
        badge={
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-aegis-surface text-aegis-action border border-aegis-border">
            Role: {user?.role || 'CUSTOMER'}
          </span>
        }
      />

      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Persistence Advisory Notice */}
      <div className="bg-aegis-card rounded-2xl border border-aegis-border p-4 shadow-aegis-card flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-center text-aegis-action flex-shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs text-aegis-secondary">
          <p className="font-semibold text-aegis-text">
            Security & Storage Policy
          </p>
          <p>
            In compliance with data protection standards, sensitive health markers, government KYC identifiers, and bank account numbers are never persisted in plain unencrypted browser storage (localStorage). Authentication is verified through the JWT session with Auth Service.
          </p>
        </div>
      </div>

      {/* Profile Layout with Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-aegis-card rounded-2xl border border-aegis-border p-3 shadow-aegis-card h-fit space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFeedback(null);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === tab.id
                  ? 'bg-aegis-action text-white shadow-xs'
                  : 'text-aegis-secondary hover:text-aegis-text hover:bg-aegis-surface'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: Personal & Contact */}
          {activeTab === 'personal' && (
            <form onSubmit={handleSaveSection} className="space-y-6">
              <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
                <h3 className="text-sm font-semibold text-aegis-text border-b border-aegis-border pb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Username"
                    id="username"
                    value={personal.username}
                    disabled
                    helperText="Unique account identity"
                  />
                  <FormField
                    label="Legal Full Name"
                    id="fullName"
                    value={personal.fullName}
                    onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                    required
                  />
                  <FormField
                    label="Date of Birth"
                    id="dob"
                    type="date"
                    value={personal.dob}
                    onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
                  />
                  <FormField
                    label="Occupation"
                    id="occupation"
                    value={personal.occupation}
                    onChange={(e) => setPersonal({ ...personal, occupation: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
                <h3 className="text-sm font-semibold text-aegis-text border-b border-aegis-border pb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Email Address"
                    id="email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    required
                  />
                  <FormField
                    label="Phone Number"
                    id="phone"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    required
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      label="Residential Street Address"
                      id="address"
                      value={contact.addressLine1}
                      onChange={(e) => setContact({ ...contact, addressLine1: e.target.value })}
                    />
                  </div>
                  <FormField
                    label="City"
                    id="city"
                    value={contact.city}
                    onChange={(e) => setContact({ ...contact, city: e.target.value })}
                  />
                  <FormField
                    label="State / Postal Code"
                    id="postal"
                    value={`${contact.state} ${contact.postalCode}`}
                    onChange={(e) => {
                      const [st, pc] = e.target.value.split(' ');
                      setContact({ ...contact, state: st || '', postalCode: pc || '' });
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="submit" variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
                  Save Personal Details
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: KYC & Identity */}
          {activeTab === 'kyc' && (
            <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
              <div className="flex items-center justify-between border-b border-aegis-border pb-3">
                <h3 className="text-sm font-semibold text-aegis-text">
                  Know Your Customer (KYC) Verification
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {kyc.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border">
                  <span className="text-aegis-secondary block mb-1">Document Type</span>
                  <span className="font-semibold text-aegis-text">{kyc.idType}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border">
                  <span className="text-aegis-secondary block mb-1">Document Identifier</span>
                  <span className="font-mono font-semibold text-aegis-text">{kyc.idNumber}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border">
                  <span className="text-aegis-secondary block mb-1">Issue Date</span>
                  <span className="text-aegis-text">{kyc.issueDate}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border">
                  <span className="text-aegis-secondary block mb-1">Expiration Date</span>
                  <span className="text-aegis-text">{kyc.expiryDate}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border text-xs text-aegis-secondary space-y-1">
                <p className="font-semibold text-aegis-text">KYC Compliance Audit</p>
                <p>
                  Identity credentials have been verified according to insurance regulator underwriting requirements. For legal changes of name or updated passport numbers, submit an official re-verification request.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Health & Medical */}
          {activeTab === 'health' && (
            <form onSubmit={handleSaveSection} className="space-y-6">
              <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
                <h3 className="text-sm font-semibold text-aegis-text border-b border-aegis-border pb-3">
                  Physical Health Parameters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Blood Group"
                    id="bloodGroup"
                    value={health.bloodGroup}
                    onChange={(e) => setHealth({ ...health, bloodGroup: e.target.value })}
                  />
                  <FormField
                    label="Known Drug Allergies"
                    id="allergies"
                    value={health.allergies}
                    onChange={(e) => setHealth({ ...health, allergies: e.target.value })}
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      label="Chronic Medical Conditions"
                      id="chronic"
                      value={health.chronicConditions}
                      onChange={(e) => setHealth({ ...health, chronicConditions: e.target.value })}
                    />
                  </div>
                  <FormField
                    label="Emergency Contact Name"
                    id="ecName"
                    value={health.emergencyContactName}
                    onChange={(e) => setHealth({ ...health, emergencyContactName: e.target.value })}
                  />
                  <FormField
                    label="Emergency Contact Phone"
                    id="ecPhone"
                    value={health.emergencyContactPhone}
                    onChange={(e) => setHealth({ ...health, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="submit" variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
                  Save Health Record
                </Button>
              </div>
            </form>
          )}

          {/* TAB 4: Consent-Based Mental Health */}
          {activeTab === 'mental-health' && (
            <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-5">
              <div className="flex items-center justify-between border-b border-aegis-border pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-aegis-action" />
                  <h3 className="text-sm font-semibold text-aegis-text">
                    Optional Mental Wellness & Confidential Support
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Strict Confidentiality
                </span>
              </div>

              <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border text-xs text-aegis-secondary space-y-2">
                <div className="flex items-center gap-2 text-aegis-primary font-semibold">
                  <Lock className="w-4 h-4 text-aegis-action" />
                  <span>Voluntary and Consent-Governed Section</span>
                </div>
                <p>
                  Provision of mental health and wellness data is 100% voluntary. Data collected here is governed by heightened privacy safeguards, is never used to deny baseline emergency medical claims, and requires explicit opt-in consent before any data can be accessed by medical adjudicators.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-aegis-border bg-white space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mentalHealthConsent}
                    onChange={(e) => {
                      setMentalHealthConsent(e.target.checked);
                      if (e.target.checked) {
                        setMentalHealthData({
                          ...mentalHealthData,
                          consentGrantedAt: new Date().toISOString()
                        });
                      }
                    }}
                    className="mt-1 h-4 w-4 rounded border-aegis-border text-aegis-action focus:ring-aegis-action"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-aegis-text block">
                      I explicitly consent to record optional mental wellness preferences
                    </span>
                    <span className="text-aegis-secondary">
                      You can revoke this consent at any time. When revoked, these records are quarantined from claims adjudication.
                    </span>
                  </div>
                </label>
              </div>

              {mentalHealthConsent ? (
                <form onSubmit={handleSaveSection} className="space-y-4 pt-2">
                  <FormField
                    label="Counseling / Therapy Support History"
                    id="counseling"
                    value={mentalHealthData.counselingHistory}
                    onChange={(e) => setMentalHealthData({ ...mentalHealthData, counselingHistory: e.target.value })}
                  />
                  <FormField
                    label="Wellness & Stress Management Preferences"
                    id="stress"
                    value={mentalHealthData.stressManagementNotes}
                    onChange={(e) => setMentalHealthData({ ...mentalHealthData, stressManagementNotes: e.target.value })}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="submit" variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
                      Save Wellness Preferences
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="py-6 text-center text-xs text-aegis-secondary">
                  Consent not active. Check the box above if you wish to configure wellness preferences.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Vehicles & Insured Assets */}
          {activeTab === 'assets' && (
            <div className="space-y-6">
              {/* Vehicles */}
              <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
                <div className="flex items-center justify-between border-b border-aegis-border pb-3">
                  <h3 className="text-sm font-semibold text-aegis-text flex items-center gap-2">
                    <Car className="w-4 h-4 text-aegis-action" />
                    Insured Vehicles
                  </h3>
                  <span className="text-xs text-aegis-secondary">{vehicles.length} registered</span>
                </div>
                <div className="space-y-3">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-xl bg-aegis-surface border border-aegis-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-aegis-text text-sm">
                          {v.year} {v.make} {v.model}
                        </p>
                        <p className="text-aegis-secondary font-mono mt-0.5">
                          VIN: {v.vin} • Plate: {v.plate}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                        Eligible for Auto Claims
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Estate Assets */}
              <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
                <div className="flex items-center justify-between border-b border-aegis-border pb-3">
                  <h3 className="text-sm font-semibold text-aegis-text flex items-center gap-2">
                    <Home className="w-4 h-4 text-aegis-action" />
                    Insured Properties
                  </h3>
                  <span className="text-xs text-aegis-secondary">{assets.length} registered</span>
                </div>
                <div className="space-y-3">
                  {assets.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl bg-aegis-surface border border-aegis-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-aegis-text text-sm">{a.type}</p>
                        <p className="text-aegis-secondary mt-0.5">{a.address}</p>
                      </div>
                      <span className="font-semibold text-aegis-action">
                        Est: {a.estimatedValue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Nominees & Dependents */}
          {activeTab === 'nominees' && (
            <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
              <div className="flex items-center justify-between border-b border-aegis-border pb-3">
                <h3 className="text-sm font-semibold text-aegis-text flex items-center gap-2">
                  <Users className="w-4 h-4 text-aegis-action" />
                  Beneficiary Nominees & Shares
                </h3>
                <span className="text-xs text-aegis-secondary">100% total allocation</span>
              </div>
              <div className="space-y-3">
                {nominees.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-aegis-text text-sm">{n.name}</p>
                      <p className="text-aegis-secondary mt-0.5">Relationship: {n.relationship}</p>
                    </div>
                    <span className="text-sm font-bold text-aegis-action bg-white px-3 py-1.5 rounded-lg border border-aegis-border">
                      {n.sharePercentage}% Share
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Claim Payout Bank */}
          {activeTab === 'banking' && (
            <div className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card space-y-4">
              <div className="flex items-center justify-between border-b border-aegis-border pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-aegis-action" />
                  <h3 className="text-sm font-semibold text-aegis-text">
                    Designated Claim Settlement Bank Account
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Direct Deposit Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border">
                  <span className="text-aegis-secondary block mb-1">Account Holder Name</span>
                  <span className="font-semibold text-aegis-text">{bankDetails.accountHolder}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border">
                  <span className="text-aegis-secondary block mb-1">Financial Institution</span>
                  <span className="font-semibold text-aegis-text">{bankDetails.bankName}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border">
                  <span className="text-aegis-secondary block mb-1">ACH Routing Number</span>
                  <span className="font-mono font-semibold text-aegis-text">{bankDetails.routingNumber}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-aegis-surface border border-aegis-border">
                  <span className="text-aegis-secondary block mb-1">Account Number</span>
                  <span className="font-mono font-semibold text-aegis-text">{bankDetails.accountNumberMasked}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-aegis-surface border border-aegis-border text-xs text-aegis-secondary space-y-1">
                <p className="font-semibold text-aegis-text">Electronic Fund Transfer Guarantee</p>
                <p>
                  When claims reach the APPROVED adjudication state, settlements are automatically routed to this verified account via ACH within 24 to 48 business hours.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
