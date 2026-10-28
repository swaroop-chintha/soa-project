import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { LogoIcon } from '../components/LogoIcon';
import { useAuth } from '../hooks/useAuth';
import { policyService } from '../services/policyService';
import { Policy } from '../types/policy';
import {
  ArrowRight,
  Car,
  HeartHandshake,
  HeartPulse,
  Home,
  Plane,
  ShieldAlert,
  Star,
  X
} from 'lucide-react';

interface PolicyCategory {
  id: string;
  type: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  detail: string;
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Policy Modal state for landing page
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory | null>(null);
  const [categoryPolicies, setCategoryPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState<boolean>(false);
  const [policyFetchError, setPolicyFetchError] = useState<string | null>(null);

  const heroTechList = [
    'Spring Boot',
    'Spring Cloud',
    'Netflix Eureka',
    'PostgreSQL',
    'JWT Security',
    'Resilience4j',
    'React',
    'TypeScript',
  ];

  const backedTechList = [
    'Spring Boot',
    'Spring Cloud',
    'PostgreSQL',
    'Netflix Eureka',
    'JWT Security',
    'Resilience4j',
    'React',
    'TypeScript',
  ];

  const policyCategories: PolicyCategory[] = [
    {
      id: 'motor',
      type: 'AUTO',
      title: 'Motor Insurance',
      icon: Car,
      description: 'Protection for your car or two-wheeler, with coverage options for accidents, damage, and other eligible risks.',
      detail: 'Covers physical loss or damage to vehicles, third-party liability, collision coverage, and comprehensive protection according to underwritten terms.'
    },
    {
      id: 'life',
      type: 'LIFE',
      title: 'Term Life Insurance',
      icon: HeartHandshake,
      description: 'Explore life insurance coverage designed to help provide financial security for your family.',
      detail: 'Provides guaranteed death benefit coverage for specified policy durations, protecting your beneficiaries against sudden loss of income.'
    },
    {
      id: 'health',
      type: 'HEALTH',
      title: 'Health Insurance',
      icon: HeartPulse,
      description: 'Understand health coverage options for eligible medical expenses, hospitalization, and healthcare needs.',
      detail: 'Inpatient and outpatient hospitalization coverage, emergency medical services, and preventative wellness benefits under contracted policy limits.'
    },
    {
      id: 'home',
      type: 'HOME',
      title: 'Home Insurance',
      icon: Home,
      description: 'Explore protection options for your home and eligible property-related risks.',
      detail: 'Safeguards residential structures and personal contents against fire, weather catastrophes, structural perils, and specified liability events.'
    },
    {
      id: 'travel',
      type: 'TRAVEL',
      title: 'Travel Insurance',
      icon: Plane,
      description: 'Learn about coverage options for eligible travel disruptions, emergencies, and unexpected expenses.',
      detail: 'Protection against trip cancellations, lost transit baggage, emergency international medical care, and travel itinerary interruptions.'
    },
    {
      id: 'accident',
      type: 'ACCIDENT',
      title: 'Personal Accident Insurance',
      icon: ShieldAlert,
      description: 'Discover coverage options for eligible accidental injuries and their financial consequences.',
      detail: 'Provides financial benefits for accidental injury, temporary or permanent disability, and accidental medical expenses.'
    }
  ];

  const customerReviews = [
    {
      id: 1,
      review: "The policy information is much easier to understand.",
      reviewer: "Sample customer",
      descriptor: "Customer experience",
      rating: 5
    },
    {
      id: 2,
      review: "I can follow the different stages of a claim without confusion.",
      reviewer: "Sample policyholder",
      descriptor: "Claims journey",
      rating: 5
    },
    {
      id: 3,
      review: "The layout makes it easier to find the information I need.",
      reviewer: "Sample visitor",
      descriptor: "Customer experience",
      rating: 5
    },
    {
      id: 4,
      review: "The claim history gives a clearer picture of the process.",
      reviewer: "Sample claims user",
      descriptor: "Claims journey",
      rating: 5
    },
    {
      id: 5,
      review: "The insurance categories make it easier to explore my options.",
      reviewer: "Sample visitor",
      descriptor: "Customer experience",
      rating: 5
    }
  ];

  // Handle open category detail modal
  const handleOpenCategoryModal = async (cat: PolicyCategory) => {
    setSelectedCategory(cat);
    setLoadingPolicies(true);
    setPolicyFetchError(null);
    setCategoryPolicies([]);

    try {
      const allPolicies = await policyService.getPolicies();
      // Match category type (e.g. HEALTH, AUTO, LIFE, HOME)
      const matched = allPolicies.filter(
        (p) => p.policyType.toUpperCase() === cat.type.toUpperCase()
      );
      setCategoryPolicies(matched);
    } catch {
      // Backend may be offline or unreachable from public visitor view
      setPolicyFetchError(
        'Unable to query live insurer records from Gateway at this time.'
      );
    } finally {
      setLoadingPolicies(false);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCategory(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClaimsCta = () => {
    if (isAuthenticated) {
      navigate('/claims');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#111111] font-sans selection:bg-[#2B2644] selection:text-white">
      {/* SECTION 1: NAVBAR & HERO */}
      <div className="relative min-h-screen h-screen flex flex-col overflow-hidden bg-[#F5F5F5]">
        {/* Navbar overlays the hero */}
        <PublicNavbar />

        {/* Hero outer container */}
        <div className="flex-1 px-6 pt-20 pb-6 flex items-end">
          {/* Large rounded hero card matching Halo reference */}
          <div className="relative w-full h-[calc(100vh-96px)] rounded-2xl overflow-hidden bg-neutral-100 shadow-xs border border-[#E5DDF5]/60">
            {/* ASSET 1: Hero Background Video */}
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
            />

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col items-start justify-start h-full p-8 md:p-12 pt-28 md:pt-36">
              {/* Headline */}
              <h1
                className="text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4 text-[#111111]"
                style={{ letterSpacing: '-0.04em' }}
              >
                Insurance Claims.<br />Simplified.
              </h1>

              {/* Description */}
              <p className="text-base md:text-lg leading-relaxed max-w-md mb-8 font-inter text-[#66636D]">
                A secure, intelligent insurance claims platform that connects
                policy validation, automated adjudication, and transparent claim
                tracking through resilient microservices.
              </p>

              {/* Primary action & secondary link */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('introduction')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-3 bg-black text-white rounded-full pl-6 pr-2.5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                >
                  <span>Explore Platform</span>
                  <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-[#66636D] hover:text-[#111111] transition-colors px-2 py-1"
                >
                  Sign In
                </button>
              </div>

              {/* Hero technology marquee */}
              <div className="mt-auto pt-8 w-full max-w-md overflow-hidden">
                <div className="flex w-max space-x-6 animate-marquee-hero hover:[animation-play-state:paused]">
                  {[...heroTechList, ...heroTechList].map((tech, idx) => (
                    <span
                      key={`${tech}-${idx}`}
                      className="text-xs font-medium text-[#66636D] tracking-wider uppercase whitespace-nowrap"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTRODUCTION & FEATURE CARDS */}
      <section id="introduction" className="max-w-[88rem] mx-auto px-6 py-20 md:py-24">
        {/* First Row: Heading and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start mb-16">
          <div>
            <h2
              className="text-4xl md:text-5xl font-medium leading-tight mb-8 text-[#111111]"
              style={{ letterSpacing: '-0.03em' }}
            >
              Meet Aegis.
            </h2>
            <button
              type="button"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-3 bg-black text-white rounded-full pl-6 pr-2.5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors duration-200 shadow-sm"
            >
              <span>Explore Platform</span>
              <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </button>
          </div>

          <div>
            <p className="text-lg md:text-xl text-[#66636D] leading-relaxed font-normal pt-2">
              Aegis Claims System streamlines insurance policy verification,
              claim submission, adjudication, and audit tracking through a
              secure and resilient microservices architecture.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CARD 1: 2 Columns on LG with ASSET 2 Lavender Scenery Background */}
          <div
            className="lg:col-span-2 rounded-2xl p-7 min-h-80 flex flex-col justify-between bg-cover bg-center overflow-hidden relative shadow-xs border border-[#E5DDF5] hover:border-[#D4C5EF] hover:shadow-lavender-md transition-all duration-200"
            style={{
              backgroundImage:
                "url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85')",
            }}
          >
            <div>
              <h3 className="text-2xl font-medium text-[#111111] tracking-tight">
                Policies that protect
              </h3>
            </div>
            <div>
              <p className="text-sm text-[#111111]/85 max-w-sm leading-relaxed font-medium">
                Explore policy details, coverage limits, validity dates, and
                eligibility information in one clear view.
              </p>
            </div>
          </div>

          {/* CARD 2: Dark purple #2B2644 */}
          <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between text-white bg-[#2B2644] border border-[#3A3358] hover:border-[#4B4372] shadow-xs hover:shadow-md transition-all duration-200">
            <div>
              <h3 className="text-2xl font-medium text-white tracking-tight">
                Claims, clearly handled
              </h3>
            </div>
            <div>
              <p className="text-sm text-white/70 leading-relaxed">
                Track each claim through policy validation, review, and its
                final approval or rejection.
              </p>
            </div>
          </div>

          {/* CARD 3: Dark purple #2B2644 */}
          <div className="rounded-2xl p-7 min-h-80 flex flex-col justify-between text-white bg-[#2B2644] border border-[#3A3358] hover:border-[#4B4372] shadow-xs hover:shadow-md transition-all duration-200">
            <div>
              <h3 className="text-2xl font-medium text-white tracking-tight">
                Built for reliability
              </h3>
            </div>
            <div>
              <p className="text-sm text-white/70 leading-relaxed">
                Secure authentication, resilient service communication, and
                auditable status transitions help keep claims processing
                transparent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: NEW POLICIES SECTION (id="policies") */}
      <section id="policies" className="max-w-[88rem] mx-auto px-6 py-20 md:py-24 border-t border-[#E5DDF5]">
        {/* Section Introduction */}
        <div className="max-w-3xl mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2B2644]/70 block">
            PROTECTION THAT FITS YOUR LIFE
          </span>
          <h2
            className="text-4xl md:text-5xl font-medium leading-tight text-[#111111]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Coverage for what matters.
          </h2>
          <p className="text-base md:text-lg text-[#66636D] leading-relaxed">
            Explore insurance categories, understand your coverage options, and
            find protection that fits your needs.
          </p>
        </div>

        {/* 6 Category Cards Grid: Subtle lavender edges and light hover state */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policyCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => handleOpenCategoryModal(cat)}
                className="bg-white rounded-3xl p-8 border border-[#E5DDF5] hover:border-[#D4C5EF] hover:bg-[#FCFAFF] hover:-translate-y-0.5 hover:shadow-lavender-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F0FC] text-[#2B2644] flex items-center justify-center mb-6 group-hover:bg-[#2B2644] group-hover:text-white transition-colors duration-200 shadow-xs border border-[#E5DDF5]/60">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <h3 className="text-xl font-medium text-[#111111] tracking-tight mb-2.5">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-[#66636D] leading-relaxed mb-6">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5DDF5]/60 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2B2644] group-hover:text-black transition-colors">
                    <span>Explore Coverage</span>
                    <span className="w-7 h-7 rounded-full bg-[#F4F0FC] text-[#2B2644] group-hover:bg-[#2B2644] group-hover:text-white flex items-center justify-center transition-all duration-200 border border-[#E5DDF5]/70">
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </span>
                  <span className="text-[11px] font-mono text-[#66636D]/80 uppercase bg-[#F4F0FC] px-2.5 py-1 rounded-full border border-[#E5DDF5]/70">
                    TYPE: {cat.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: NEW CLAIMS SECTION (id="claims") */}
      <section id="claims" className="max-w-[88rem] mx-auto px-6 py-20 md:py-24 border-t border-[#E5DDF5]">
        {/* Section Introduction */}
        <div className="max-w-3xl mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2B2644]/70 block">
            CLAIMS WITHOUT THE COMPLEXITY
          </span>
          <h2
            className="text-4xl md:text-5xl font-medium leading-tight text-[#111111]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Every claim. Clearly handled.
          </h2>
          <p className="text-base md:text-lg text-[#66636D] leading-relaxed">
            Follow a transparent claims journey, from policy verification and
            submission to review and final adjudication.
          </p>
        </div>

        {/* 4 Steps: Mostly white cards with very light lavender borders and light lavender stage icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* STEP 1 */}
          <div className="bg-white rounded-2xl p-7 border border-[#E5DDF5] hover:border-[#D4C5EF] hover:bg-[#FCFAFF] hover:-translate-y-0.5 hover:shadow-lavender-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-7 h-7 rounded-full bg-[#F4F0FC] text-[#2B2644] font-mono font-semibold text-xs flex items-center justify-center border border-[#E5DDF5]">
                  01
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F0FC] text-[#2B2644] border border-[#E5DDF5]">
                  SUBMITTED
                </span>
              </div>
              <h3 className="text-lg font-medium text-[#111111] mb-2 tracking-tight">
                Submit
              </h3>
              <p className="text-sm text-[#66636D] leading-relaxed">
                Provide the required claim details and submit your claim for review.
              </p>
            </div>
            <div className="pt-6 text-[11px] text-[#66636D]/70 border-t border-[#E5DDF5]/70 mt-6 flex items-center justify-between">
              <span>Client Ingestion</span>
              <span className="font-mono text-[#2B2644]/70">Idempotent</span>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="bg-white rounded-2xl p-7 border border-[#E5DDF5] hover:border-[#D4C5EF] hover:bg-[#FCFAFF] hover:-translate-y-0.5 hover:shadow-lavender-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-7 h-7 rounded-full bg-[#F4F0FC] text-[#2B2644] font-mono font-semibold text-xs flex items-center justify-center border border-[#E5DDF5]">
                  02
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F0FC] text-[#2B2644] border border-[#E5DDF5]">
                  POLICY_VALIDATED
                </span>
              </div>
              <h3 className="text-lg font-medium text-[#111111] mb-2 tracking-tight">
                Verify
              </h3>
              <p className="text-sm text-[#66636D] leading-relaxed">
                The system checks policy validity, coverage information, and claim eligibility.
              </p>
            </div>
            <div className="pt-6 text-[11px] text-[#66636D]/70 border-t border-[#E5DDF5]/70 mt-6 flex items-center justify-between">
              <span>Policy Service (:8081)</span>
              <span className="font-mono text-[#2B2644]/70">Active Term</span>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="bg-white rounded-2xl p-7 border border-[#E5DDF5] hover:border-[#D4C5EF] hover:bg-[#FCFAFF] hover:-translate-y-0.5 hover:shadow-lavender-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-7 h-7 rounded-full bg-[#F4F0FC] text-[#2B2644] font-mono font-semibold text-xs flex items-center justify-center border border-[#E5DDF5]">
                  03
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F0FC] text-[#2B2644] border border-[#E5DDF5]">
                  UNDER_REVIEW
                </span>
              </div>
              <h3 className="text-lg font-medium text-[#111111] mb-2 tracking-tight">
                Review
              </h3>
              <p className="text-sm text-[#66636D] leading-relaxed">
                The claim moves through the review and adjudication process.
              </p>
            </div>
            <div className="pt-6 text-[11px] text-[#66636D]/70 border-t border-[#E5DDF5]/70 mt-6 flex items-center justify-between">
              <span>Approval Engine (:8083)</span>
              <span className="font-mono text-[#2B2644]/70">Rule Eval</span>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="bg-white rounded-2xl p-7 border border-[#E5DDF5] hover:border-[#D4C5EF] hover:bg-[#FCFAFF] hover:-translate-y-0.5 hover:shadow-lavender-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-7 h-7 rounded-full bg-[#F4F0FC] text-[#2B2644] font-mono font-semibold text-xs flex items-center justify-center border border-[#E5DDF5]">
                  04
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4F0FC] text-[#2B2644] border border-[#E5DDF5]">
                  APPROVED / REJECTED
                </span>
              </div>
              <h3 className="text-lg font-medium text-[#111111] mb-2 tracking-tight">
                Track the outcome
              </h3>
              <p className="text-sm text-[#66636D] leading-relaxed">
                Follow the recorded claim status and review its available history.
              </p>
            </div>
            <div className="pt-6 text-[11px] text-[#66636D]/70 border-t border-[#E5DDF5]/70 mt-6 flex items-center justify-between">
              <span>Audit Trail</span>
              <span className="font-mono text-[#2B2644]/70">Immutable</span>
            </div>
          </div>
        </div>

        {/* Claims CTA Banner in dark purple #2B2644 */}
        <div className="bg-[#2B2644] text-white rounded-3xl p-8 sm:p-10 border border-[#3A3358] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
              Ready to submit or review an insurance claim?
            </h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Every decision is consistently evaluated against policy coverage thresholds with transparent audit records.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClaimsCta}
            className="inline-flex items-center gap-3 bg-white text-[#2B2644] hover:bg-[#F4F0FC] rounded-full pl-6 pr-2.5 py-2.5 text-sm font-medium transition-colors duration-200 shadow-sm flex-shrink-0"
          >
            <span>Access Claims Dashboard</span>
            <span className="w-7 h-7 rounded-full bg-[#2B2644] flex items-center justify-center text-white">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
          </button>
        </div>
      </section>

      {/* SECTION 5: EXISTING TECHNOLOGY / BACKED-BY MARQUEE */}
      <section id="technology" className="max-w-[88rem] mx-auto px-6 py-20 border-t border-[#E5DDF5]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          {/* Left Text */}
          <div className="col-span-1">
            <p className="text-base text-[#66636D] leading-relaxed font-normal">
              Powered by reliable technology<br className="hidden lg:inline" /> and transparent claims processing.
            </p>
          </div>

          {/* Right Continuous 30s Marquee */}
          <div className="col-span-1 md:col-span-3 overflow-hidden">
            <div className="flex w-max space-x-12 animate-marquee-backed hover:[animation-play-state:paused]">
              {[...backedTechList, ...backedTechList].map((tech, idx) => (
                <span
                  key={`${tech}-${idx}`}
                  className="text-base md:text-lg font-medium text-[#111111]/75 hover:text-[#2B2644] tracking-tight whitespace-nowrap flex-shrink-0 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: EXISTING USE-CASE SECTION */}
      <section id="use-cases" className="max-w-[88rem] mx-auto px-6 py-20 md:py-24 border-t border-[#E5DDF5]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-sm text-[#2B2644]/70 font-medium block uppercase tracking-wider text-xs">
              Insurance Operations
            </span>
            <h2
              className="text-5xl md:text-6xl font-medium leading-none text-[#111111]"
              style={{ letterSpacing: '-0.04em' }}
            >
              Built for every claim
            </h2>
            <p className="text-base md:text-lg text-[#66636D] leading-relaxed max-w-md pt-2">
              From policy verification to final adjudication, Aegis connects
              the key stages of insurance claims processing through a
              consistent, secure, and auditable workflow.
            </p>
          </div>

          {/* Right Column: Large Media Card with ASSET 3 Video */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden min-h-[520px] lg:min-h-[720px] flex flex-col justify-end shadow-xs bg-neutral-200 border border-[#E5DDF5]">
              {/* ASSET 3: Background Video */}
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_183428_ab5e672a-f608-4dcb-b319-f3e040f02e2d.mp4"
              />

              {/* Overlay Content */}
              <div className="relative z-10 p-8 md:p-12 text-black">
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight mb-3">
                  Claims Processing
                </h3>
                <p className="text-sm md:text-base text-black/75 max-w-lg mb-6 leading-relaxed font-normal">
                  Validate policy eligibility, evaluate claims against coverage
                  limits, track status transitions, and preserve a complete
                  audit history through a unified claims workflow.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="inline-flex items-center group text-sm font-medium text-black transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-white/85 backdrop-blur flex items-center justify-center mr-3 text-[#2B2644] group-hover:bg-white transition-colors shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <span>Explore Platform</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: NEW CUSTOMER REVIEW MARQUEE (id="reviews") */}
      <section id="reviews" className="max-w-[88rem] mx-auto px-6 py-20 md:py-24 border-t border-[#E5DDF5] overflow-hidden">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2B2644]/70 block">
            BUILT AROUND TRUST
          </span>
          <h2
            className="text-4xl md:text-5xl font-medium leading-tight text-[#111111]"
            style={{ letterSpacing: '-0.03em' }}
          >
            A clearer experience for every customer.
          </h2>
          <p className="text-base md:text-lg text-[#66636D] leading-relaxed">
            Simple information, transparent processes, and a clearer view of
            insurance coverage.
          </p>
        </div>

        {/* Animated Continuous Review Strip: White cards, subtle lavender borders, light lavender star container */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="flex w-max space-x-6 animate-marquee-reviews hover:[animation-play-state:paused]">
            {[...customerReviews, ...customerReviews].map((rev, idx) => (
              <div
                key={`${rev.id}-${idx}`}
                className="w-80 sm:w-96 rounded-2xl bg-white border border-[#E5DDF5] hover:border-[#D4C5EF] hover:shadow-lavender-md hover:-translate-y-0.5 transition-all duration-200 p-6 flex flex-col justify-between flex-shrink-0"
              >
                <div>
                  {/* Star Rating indicator inside light lavender badge */}
                  <div className="inline-flex items-center gap-1.5 mb-4 bg-[#F4F0FC] px-3 py-1 rounded-full border border-[#E5DDF5]/80">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-3.5 h-3.5 text-amber-400 fill-amber-400 stroke-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#2B2644]/80 uppercase font-medium">
                      Experience preview
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-[#111111] font-medium leading-snug mb-6">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5DDF5]/70 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111111]">{rev.reviewer}</span>
                  <span className="text-[#66636D]">{rev.descriptor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CALL TO ACTION */}
      <section className="max-w-[88rem] mx-auto px-6 py-12 mb-16">
        <div className="rounded-3xl bg-[#172554] text-white p-10 sm:p-14 lg:p-16 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-[#1E3A8A]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white leading-tight">
              Ready to explore Aegis?
            </h2>
            <p className="text-base text-white/80 leading-relaxed">
              Explore policies, submit claims, and follow the adjudication
              process through a single interface.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-[#F4F0FC] rounded-full pl-6 pr-2.5 py-2.5 text-sm font-medium transition-colors duration-200 shadow-sm"
            >
              <span>Open Dashboard</span>
              <span className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </button>
          </div>

          {/* Decorative halo ring */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E5DDF5] bg-[#F5F5F5] py-12 text-[#66636D]">
        <div className="max-w-[88rem] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E5DDF5]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-[24px] h-[24px] flex items-center justify-center">
                <LogoIcon size={22} />
              </div>
              <span className="font-semibold text-lg text-[#2E2A47]">Aegis</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('introduction')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-black transition"
              >
                Platform
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('policies')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-black transition"
              >
                Policies
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('claims')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-black transition"
              >
                Claims
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-black transition"
              >
                Architecture
              </button>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="hover:text-black transition"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="hover:text-black transition"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} Aegis Claims System. All rights reserved.</p>
            <p className="text-[#66636D]/70">Microservice Insurance Claims &amp; Adjudication Platform</p>
          </div>
        </div>
      </footer>

      {/* POLICY CATEGORY INFORMATIONAL MODAL */}
      {selectedCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl border border-[#E5DDF5] shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-150 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4F0FC] text-[#2B2644] flex items-center justify-center border border-[#E5DDF5]/80">
                  <selectedCategory.icon className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-xl font-medium tracking-tight text-[#111111]">
                    {selectedCategory.title}
                  </h3>
                  <span className="text-xs font-mono text-[#66636D]">
                    CATEGORY: {selectedCategory.type}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="p-1.5 rounded-full hover:bg-[#F4F0FC] text-neutral-500 hover:text-black transition"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Overview Content */}
            <div className="space-y-3 text-sm">
              <p className="text-[#111111]/90 leading-relaxed font-medium">
                {selectedCategory.description}
              </p>
              <p className="text-[#66636D] leading-relaxed text-xs">
                {selectedCategory.detail}
              </p>
              <div className="p-3.5 rounded-2xl bg-[#F4F0FC] border border-[#E5DDF5] text-xs text-[#2B2644] leading-relaxed">
                Available policies, underwriting limits, and eligibility depend on the insurer&apos;s actual policy database.
              </div>
            </div>

            {/* Backend Query Results */}
            <div className="space-y-2 pt-2 border-t border-[#E5DDF5]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-[#2B2644]">
                  Registered Policies ({selectedCategory.type})
                </span>
                <span className="text-[#66636D] font-mono text-[11px]">
                  Policy Service (:8081)
                </span>
              </div>

              {loadingPolicies ? (
                <div className="py-6 text-center text-xs text-[#66636D] animate-pulse">
                  Querying policy registry via API Gateway...
                </div>
              ) : policyFetchError ? (
                <div className="p-3 rounded-xl bg-[#F4F0FC] border border-[#E5DDF5]/60 text-xs text-[#66636D] text-center">
                  {policyFetchError}
                </div>
              ) : categoryPolicies.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#FCFAFF] border border-[#E5DDF5]/70 text-xs text-[#66636D] text-center space-y-1">
                  <p className="font-medium text-[#111111]">No active policies found for this category</p>
                  <p className="text-[11px] text-[#66636D]">
                    No matching policies are currently available in the database for {selectedCategory.type}.
                  </p>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {categoryPolicies.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-[#FCFAFF] border border-[#E5DDF5] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-semibold text-[#111111]">
                          {p.policyNumber}
                        </div>
                        <div className="text-[11px] text-[#66636D]">
                          {p.customerName} • {p.startDate} to {p.endDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#111111]">
                          ${Number(p.coverageAmount).toLocaleString()}
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#E5DDF5] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#66636D] hover:bg-[#F4F0FC] hover:text-[#111111] transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  navigate(isAuthenticated ? '/policies' : '/login');
                }}
                className="inline-flex items-center gap-2 bg-black text-white hover:bg-gray-800 px-5 py-2 rounded-full text-xs font-medium transition shadow-xs"
              >
                <span>View Available Policies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
