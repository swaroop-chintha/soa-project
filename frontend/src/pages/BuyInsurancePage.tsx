import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import {
  HeartPulse,
  Shield,
  Car,
  Home,
  Plane,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Info,
  Sparkles
} from 'lucide-react';

interface InsuranceProduct {
  id: string;
  name: string;
  category: 'Health' | 'Life' | 'Motor' | 'Home' | 'Travel';
  tagline: string;
  coverageCeiling: string;
  premiumEstimate: string;
  billingFrequency: string;
  benefits: string[];
  exclusions: string[];
  addOns: string[];
  description: string;
}

const PRODUCTS: InsuranceProduct[] = [
  // Health
  {
    id: 'health-optima',
    name: 'Aegis Comprehensive Health Guard',
    category: 'Health',
    tagline: 'Complete in-patient hospitalization and outpatient diagnostics protection.',
    coverageCeiling: '$500,000',
    premiumEstimate: '$145',
    billingFrequency: 'month',
    benefits: [
      'Zero co-pay at in-network partner hospitals',
      'Daycare medical procedures covered with 2-hour pre-authorization',
      'Annual preventive health checkup voucher',
      'Pre and post hospitalization coverage (60/180 days)'
    ],
    exclusions: [
      'Pre-existing conditions during initial 24-month moratorium',
      'Cosmetic and aesthetic surgical enhancements',
      'Non-prescribed alternative homeopathic remedies'
    ],
    addOns: ['Maternity & Newborn Care Rider', 'Critical Illness Lump Sum Booster', 'International Medical Evacuation'],
    description: 'Our benchmark health coverage product designed to shield your family from catastrophic medical inflation, backed by automated claims settlement via the Aegis Approval engine.'
  },
  {
    id: 'health-silver',
    name: 'Aegis Essential Care Plan',
    category: 'Health',
    tagline: 'Accessible catastrophic illness and critical injury coverage.',
    coverageCeiling: '$150,000',
    premiumEstimate: '$68',
    billingFrequency: 'month',
    benefits: [
      'Hospital room rent allowance up to $500/day',
      'ICU charges covered up to sum insured',
      'Emergency ambulance transportation expenses'
    ],
    exclusions: [
      'Outpatient routine dental consultations',
      'Spectacles and refractive laser surgery'
    ],
    addOns: ['Daily Hospital Cash Allowance', 'Personal Accident Extension'],
    description: 'A focused, value-oriented health policy offering fundamental hospitalization safeguards with fast adjudication.'
  },

  // Life
  {
    id: 'life-term-protect',
    name: 'Aegis Pure Term Protection',
    category: 'Life',
    tagline: 'Guaranteed financial security for your dependents with flexible terms.',
    coverageCeiling: '$1,000,000',
    premiumEstimate: '$52',
    billingFrequency: 'month',
    benefits: [
      'Lump-sum tax-free payout on terminal illness or demise',
      'Level premiums locked in for entire 30-year policy period',
      'Accelerated payout on accidental disability'
    ],
    exclusions: [
      'Self-inflicted harm or suicide within first policy year',
      'Participation in hazardous extreme competitive sports without rider'
    ],
    addOns: ['Waiver of Premium on Total Disability', 'Accidental Demise Double Indemnity'],
    description: 'Pure life protection engineered to ensure your family maintains their standard of living, mortgage payments, and educational commitments.'
  },

  // Motor
  {
    id: 'motor-comprehensive',
    name: 'Aegis Premier Motor Shield',
    category: 'Motor',
    tagline: 'Total bumper-to-bumper vehicle coverage and 24/7 roadside assistance.',
    coverageCeiling: '$65,000',
    premiumEstimate: '$85',
    billingFrequency: 'month',
    benefits: [
      'Zero depreciation cover on all body and mechanical parts',
      'Engine protection rider against water ingress and hydrostatic lock',
      'Cashless repair network across 1,200+ certified service centers'
    ],
    exclusions: [
      'Driving under influence of alcohol or intoxicating substances',
      'Consequential mechanical breakdown without external impact'
    ],
    addOns: ['Return to Invoice (100% replacement value)', 'Key & Lock Replacement', 'Consumables Cover'],
    description: 'Comprehensive auto insurance keeping you moving forward with digital claims processing and immediate tow dispatch.'
  },

  // Home
  {
    id: 'home-haven',
    name: 'Aegis Residential Haven Protect',
    category: 'Home',
    tagline: 'Comprehensive structure and content security against fire, flood, and theft.',
    coverageCeiling: '$750,000',
    premiumEstimate: '$42',
    billingFrequency: 'month',
    benefits: [
      'Reconstruction cost coverage for dwelling and boundary walls',
      'Burglary and theft indemnity for electronics, art, and furniture',
      'Temporary alternate living accommodation expenses'
    ],
    exclusions: [
      'Wilful neglect or defective construction prior to policy inception',
      'Losses caused by war or civil unrest'
    ],
    addOns: ['Tenant Liability Protection', 'Home Appliance Breakdown Cover', 'Valuable Jewellery Floater'],
    description: 'Complete home and household protection against natural disasters, accidental fires, and residential property losses.'
  },

  // Travel
  {
    id: 'travel-global',
    name: 'Aegis Global Explorer Voyager',
    category: 'Travel',
    tagline: 'Worldwide international medical emergency and trip disruption protection.',
    coverageCeiling: '$250,000',
    premiumEstimate: '$28',
    billingFrequency: 'trip',
    benefits: [
      'Overseas emergency sickness and hospitalization indemnity',
      'Baggage loss, flight cancellation, and missed connection compensation',
      'Emergency passport loss replacement assistance'
    ],
    exclusions: [
      'Travel undertaken against official advisory of destination embassies',
      'Pre-planned medical tourism treatments'
    ],
    addOns: ['Adventure Sports Winter Rider', 'Home Burglary While Abroad'],
    description: 'Seamless travel insurance with global cashless assistance and digital claim lodging from anywhere in the world.'
  }
];

export const BuyInsurancePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [detailProduct, setDetailProduct] = useState<InsuranceProduct | null>(null);

  const categories = ['ALL', 'Health', 'Life', 'Motor', 'Home', 'Travel'];

  const filteredProducts = PRODUCTS.filter((p) => {
    return selectedCategory === 'ALL' || p.category === selectedCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Health':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'Life':
        return <Shield className="w-5 h-5 text-indigo-500" />;
      case 'Motor':
        return <Car className="w-5 h-5 text-amber-500" />;
      case 'Home':
        return <Home className="w-5 h-5 text-emerald-500" />;
      case 'Travel':
        return <Plane className="w-5 h-5 text-sky-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-aegis-action" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insurance Product Catalogue"
        subtitle="Explore coverage solutions across Health, Life, Motor, Home, and Travel with transparent policy limits."
        breadcrumbs={[{ label: 'Buy Insurance' }]}
      />

      {/* Backend Integration Notice Banner */}
      <div className="bg-aegis-surface border border-aegis-lavender/50 rounded-2xl p-5 shadow-aegis-card flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-white border border-aegis-border flex items-center justify-center text-aegis-action flex-shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-semibold text-sm text-aegis-primary">
            Online Underwriting & Payment Gateway Status
          </h4>
          <p className="text-aegis-secondary leading-relaxed">
            Direct card checkout and instant policy binding are currently under active development. You can review all certified coverage specifications, exclusions, and premium tiers below.
            To provision an active policy under your test account, visit{' '}
            <button
              onClick={() => navigate('/policies')}
              className="text-aegis-action font-semibold hover:underline"
            >
              My Policies
            </button>{' '}
            or contact Aegis Support.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-aegis-action text-white shadow-xs'
                : 'bg-aegis-card border border-aegis-border text-aegis-secondary hover:text-aegis-text'
            }`}
          >
            {cat !== 'ALL' && getCategoryIcon(cat)}
            <span>{cat === 'ALL' ? 'All Insurance Plans' : `${cat} Insurance`}</span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-aegis-card rounded-2xl border border-aegis-border p-6 shadow-aegis-card flex flex-col justify-between hover:border-aegis-action/40 transition duration-150"
          >
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-center">
                    {getCategoryIcon(product.category)}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-aegis-secondary">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-semibold text-aegis-text leading-tight">
                      {product.name}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-aegis-secondary line-clamp-2">
                {product.tagline}
              </p>

              {/* Pricing & Coverage Strip */}
              <div className="p-3 rounded-xl bg-aegis-surface border border-aegis-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-aegis-secondary block">Max Coverage</span>
                  <span className="text-xs font-bold text-aegis-text">
                    {product.coverageCeiling}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-aegis-secondary block">Est. Premium</span>
                  <span className="text-xs font-bold text-aegis-action">
                    {product.premiumEstimate}
                    <span className="text-[10px] text-aegis-secondary font-normal">
                      /{product.billingFrequency}
                    </span>
                  </span>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-aegis-secondary uppercase tracking-wider block">
                  Core Highlights
                </span>
                <ul className="space-y-1.5 text-xs text-aegis-text">
                  {product.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-5 mt-5 border-t border-aegis-border flex items-center justify-between gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailProduct(product)}
                className="w-full"
              >
                View Full Specifications
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {detailProduct && (
        <Modal
          isOpen={Boolean(detailProduct)}
          onClose={() => setDetailProduct(null)}
          title={detailProduct.name}
        >
          <div className="space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-aegis-surface text-aegis-action border border-aegis-border mb-2">
                {getCategoryIcon(detailProduct.category)}
                <span>{detailProduct.category} Protection</span>
              </span>
              <p className="text-xs text-aegis-secondary leading-relaxed">
                {detailProduct.description}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-aegis-surface border border-aegis-border text-xs">
              <div>
                <span className="text-aegis-secondary block mb-0.5">Maximum Coverage Ceiling</span>
                <span className="text-sm font-bold text-aegis-text">
                  {detailProduct.coverageCeiling}
                </span>
              </div>
              <div>
                <span className="text-aegis-secondary block mb-0.5">Estimated Premium</span>
                <span className="text-sm font-bold text-aegis-action">
                  {detailProduct.premiumEstimate}{' '}
                  <span className="text-xs font-normal text-aegis-secondary">
                    / {detailProduct.billingFrequency}
                  </span>
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-aegis-text uppercase tracking-wider">
                Included Benefits & Coverage
              </h4>
              <ul className="space-y-1.5 text-xs text-aegis-text">
                {detailProduct.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-aegis-text uppercase tracking-wider">
                Exclusions & Moratoriums
              </h4>
              <ul className="space-y-1.5 text-xs text-aegis-secondary">
                {detailProduct.exclusions.map((e, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Available Add-Ons */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-aegis-text uppercase tracking-wider">
                Optional Riders & Add-ons
              </h4>
              <div className="flex flex-wrap gap-2">
                {detailProduct.addOns.map((addon, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-white border border-aegis-border text-aegis-text"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-aegis-action" />
                    {addon}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <p>
                <strong>Issuance Notice:</strong> Automated online purchase checkout is undergoing integration. To bind this policy today, an administrator or broker can configure this policy under your user account in the Policy Service.
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-aegis-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailProduct(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setDetailProduct(null);
                  navigate('/help');
                }}
              >
                Request Assistance
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BuyInsurancePage;
