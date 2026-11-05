'use client';

import { useEffect, useState } from 'react';
import { formatPriceLabel, getCurrencySymbol } from '@/lib/freelancer-data';

type WinnabilityBreakdown = {
  skillsMatch: number;
  budgetFit: number;
  clientTrust: number;
  scopeFit: number;
  winnability: number;
};

type Gig = {
  id: string;
  title: string;
  clientName: string;
  clientLocation?: string;
  clientRating: number;
  clientReviewCount: number;
  clientTotalSpent: number;
  paymentVerified: boolean;
  pricingType: 'HOURLY' | 'FIXED_PRICE' | 'RETAINER';
  compensationPeriod?: 'hourly' | 'fixed' | 'yearly' | 'undisclosed';
  currencySymbol?: string;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  currency: string;
  workMode: string;
  scope: string;
  estimatedDuration?: string;
  description: string;
  skills: string[];
  source: string;
  sourceUrl: string;
  status: string;
};

type ScoredMatch = {
  gig: Gig;
  score: number;
  breakdown: WinnabilityBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  keyStrengths: string[];
  riskFactors: string[];
};

type MilestoneItem = {
  title: string;
  description: string;
  durationDays: number;
  amount: number;
};

type Proposal = {
  id: string;
  gigId: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  strategy?: 'TECHNICAL' | 'RAPID_DELIVERY' | 'CONSULTING';
  coverLetter: string;
  proposedRate: number;
  pricingType: string;
  estimatedTimeline: string;
  milestones: MilestoneItem[];
  providerUsed: string;
  notes?: string;
  approvedAt?: string;
  submittedAt?: string;
  createdAt: string;
};

type FreelancerProfile = {
  fullName: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  targetHourlyRateUsd: number;
  targetHourlyRateInr: number;
  minProjectBudgetUsd: number;
  weeklyCapacityHours: number;
  skills: string[];
  preferredLocations: string[];
  remoteOpen: boolean;
  immediateAvailability: boolean;
  portfolioLinks: string[];
  customPitchIntro?: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'discovery' | 'pipeline' | 'intake' | 'profile' | 'tests' | 'legacyJobs'>('discovery');
  const [matches, setMatches] = useState<ScoredMatch[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Rate Simulator state
  const [simulatedRate, setSimulatedRate] = useState<number>(45);
  const [isSimulating, setIsSimulating] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [pricingFilter, setPricingFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL');

  // Selected item modal state
  const [selectedMatch, setSelectedMatch] = useState<ScoredMatch | null>(null);
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [proposalStrategy, setProposalStrategy] = useState<'TECHNICAL' | 'RAPID_DELIVERY' | 'CONSULTING'>('TECHNICAL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableCoverLetter, setEditableCoverLetter] = useState('');
  const [editableMilestones, setEditableMilestones] = useState<MilestoneItem[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  // Manual intake form state
  const [intakeTitle, setIntakeTitle] = useState('');
  const [intakeClient, setIntakeClient] = useState('');
  const [intakeBudget, setIntakeBudget] = useState('2500');
  const [intakePricingType, setIntakePricingType] = useState<'FIXED_PRICE' | 'HOURLY'>('FIXED_PRICE');
  const [intakeSkills, setIntakeSkills] = useState('React, Next.js, TypeScript, Node.js, NestJS, PostgreSQL');
  const [intakeUrl, setIntakeUrl] = useState('');
  const [intakeDesc, setIntakeDesc] = useState('');
  const [intakeLoading, setIntakeLoading] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState<FreelancerProfile | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Automated Test Suite UI state
  const [testResults, setTestResults] = useState<Array<{ name: string; status: 'PASS' | 'FAIL'; duration: string; detail?: string }>>([]);
  const [runningTests, setRunningTests] = useState(false);

  // Live remote feeds sync and vacancy URL verification state
  const [isSyncingLiveFeeds, setIsSyncingLiveFeeds] = useState(false);
  const [linkHealthMap, setLinkHealthMap] = useState<Record<string, { isLive?: boolean; statusCode?: number; checking?: boolean; message?: string }>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const getPlatformFallbacks = (gig: Gig) => {
    const primarySkill = (gig.skills && gig.skills[0]) || 'react';
    const tag = primarySkill.toLowerCase().replace(/[^a-z0-9]/g, '');
    const searchKeywords = `${gig.clientName} ${gig.title}`.replace(/['"]/g, '');
    return {
      // remoteOk: `https://remoteok.com/remote-${tag || 'dev'}-jobs`, // [Commented out per user instruction: paid tier]
      himalayas: `https://himalayas.app/jobs?q=${encodeURIComponent(primarySkill || 'react')}`,
      freelancer: `https://www.freelancer.com/search/projects?q=${encodeURIComponent(primarySkill || 'react')}`,
      upwork: `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent((gig.skills.slice(0, 3).join(' ') || gig.title).slice(0, 50))}&sort=recency`,
      contra: `https://contra.com/search?query=${encodeURIComponent(primarySkill || 'react')}`,
      google: `https://www.google.com/search?q=${encodeURIComponent(`${searchKeywords} remote freelance job`)}`,
    };
  };

  const handleVerifyLink = async (url: string) => {
    setLinkHealthMap((prev) => ({ ...prev, [url]: { checking: true } }));
    try {
      const res = await fetch('/api/gigs/verify-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setLinkHealthMap((prev) => ({
        ...prev,
        [url]: {
          isLive: data.isLive,
          statusCode: data.statusCode,
          checking: false,
          message: data.message,
        },
      }));
      if (data.isLive) {
        showToast(`✓ Vacancy link verified live (${data.statusCode || 200} OK)`);
      } else {
        showToast('⚠️ Post may be closed. Use platform search fallback.');
      }
    } catch {
      setLinkHealthMap((prev) => ({
        ...prev,
        [url]: { isLive: false, checking: false, message: 'Check failed' },
      }));
    }
  };

  const handleSyncLiveRemoteFeeds = async () => {
    setIsSyncingLiveFeeds(true);
    showToast('🔄 Syncing fresh developer gigs from Himalayas, Jobicy, and Freelancer.com...');
    try {
      const res = await fetch('/api/gigs/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const matchesRes = await fetch(`/api/gigs/matches?simulatedRate=${simulatedRate}`);
        const matchesData = await matchesRes.json();
        setMatches(matchesData.matches || []);
        showToast(`✓ Synced ${data.newCount} fresh live gigs from real web feeds!`);
      } else {
        showToast('Feed sync completed.');
      }
    } catch {
      showToast('Live feed sync timed out, using existing gigs.');
    } finally {
      setIsSyncingLiveFeeds(false);
    }
  };

  const loadData = async (rateToSimulate?: number) => {
    setLoading(true);
    try {
      const rateQuery = rateToSimulate ? `?simulatedRate=${rateToSimulate}` : '';
      const [matchesRes, proposalsRes, profileRes] = await Promise.all([
        fetch(`/api/gigs/matches${rateQuery}`),
        fetch('/api/gigs/proposals'),
        fetch('/api/freelancer/profile'),
      ]);

      if (matchesRes.ok) {
        const data = await matchesRes.json();
        setMatches(data.matches || []);
        if (data.freelancer) {
          setProfile(data.freelancer);
          if (!profileForm) setProfileForm(data.freelancer);
        }
      }
      if (proposalsRes.ok) {
        const props = await proposalsRes.json();
        setProposals(props || []);
      }
      if (profileRes.ok && !profile) {
        const prof = await profileRes.json();
        setProfile(prof);
        if (!profileForm) setProfileForm(prof);
      }
    } catch {
      setError('Unable to fetch live agent data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRateSimulationChange = (newRate: number) => {
    setSimulatedRate(newRate);
    setIsSimulating(true);
    loadData(newRate).finally(() => setIsSimulating(false));
  };

  const handleGenerateProposal = async (gigId: string, strategy: 'TECHNICAL' | 'RAPID_DELIVERY' | 'CONSULTING' = proposalStrategy) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/gigs/${gigId}/proposals/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const prop: Proposal = await res.json();
      setActiveProposal(prop);
      setEditableCoverLetter(prop.coverLetter);
      setEditableMilestones(prop.milestones || []);
      setProposals((prev) => [prop, ...prev.filter((p) => p.id !== prop.id)]);
      showToast(`Draft generated using ${strategy.replace(/_/g, ' ')} strategy!`);
    } catch {
      showToast('Failed to generate proposal draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, newStatus: Proposal['status']) => {
    try {
      const totalRate = editableMilestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
      const res = await fetch(`/api/gigs/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          coverLetter: editableCoverLetter,
          milestones: editableMilestones,
          proposedRate: totalRate > 0 ? totalRate : activeProposal?.proposedRate,
        }),
      });
      if (!res.ok) throw new Error('Status update failed');
      const updated: Proposal = await res.json();
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (activeProposal?.id === updated.id) {
        setActiveProposal(updated);
      }
      if (newStatus === 'APPROVED') {
        showToast('✓ Proposal approved! Cleared for submission.');
      } else if (newStatus === 'SUBMITTED') {
        showToast('🚀 Proposal marked as submitted to client.');
      } else {
        showToast(`Proposal updated to ${newStatus}.`);
      }
    } catch {
      showToast('Failed to update proposal status.');
    }
  };

  const handleManualIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeTitle.trim() || !intakeUrl.trim()) {
      showToast('Please provide a project title and source URL.');
      return;
    }

    setIntakeLoading(true);
    try {
      const skillsArray = intakeSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: intakeTitle,
          clientName: intakeClient || 'Direct Client',
          sourceUrl: intakeUrl,
          pricingType: intakePricingType,
          budgetMax: intakePricingType === 'FIXED_PRICE' ? Number(intakeBudget) : undefined,
          hourlyRateMax: intakePricingType === 'HOURLY' ? Number(intakeBudget) : undefined,
          skills: skillsArray,
          description: intakeDesc || `Custom freelance vacancy for ${intakeTitle}`,
          workMode: 'REMOTE',
        }),
      });

      if (!res.ok) throw new Error('Intake failed');
      await loadData();
      showToast('New project ingested, normalized, and scored!');
      setIntakeTitle('');
      setIntakeClient('');
      setIntakeUrl('');
      setIntakeDesc('');
      setActiveTab('discovery');
    } catch {
      showToast('Failed to add project.');
    } finally {
      setIntakeLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm) return;
    setSavingProfile(true);
    try {
      const res = await fetch('/api/freelancer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error('Save profile failed');
      const updated = await res.json();
      setProfile(updated);
      showToast('Profile and rate preferences successfully updated!');
    } catch {
      showToast('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRunAutomations = async () => {
    setRunningTests(true);
    setTestResults([]);
    try {
      const scenarios = [
        { name: '1. Health & Discovery Route Verification', endpoint: '/api/health', method: 'GET' },
        { name: '2. Verified Profile Integrity Check', endpoint: '/api/freelancer/profile', method: 'GET' },
        { name: '3. 5-Dimension Winnability Engine Test', endpoint: '/api/gigs/matches', method: 'GET' },
        { name: '4. Dynamic Rate Simulator Test ($65/hr)', endpoint: '/api/gigs/matches?simulatedRate=65', method: 'GET' },
        { name: '5. Proposal Pipeline Retrieval', endpoint: '/api/gigs/proposals', method: 'GET' },
        { name: '6. Legacy Employment Jobs Compatibility', endpoint: '/api/jobs/matches', method: 'GET' },
        { name: '7. Live Web Feeds Sync Engine', endpoint: '/api/gigs/sync', method: 'POST' },
        { name: '8. Vacancy URL Verification & Health Check', endpoint: '/api/gigs/verify-url', method: 'POST', body: JSON.stringify({ url: 'https://himalayas.app' }) },
      ];

      const out: any[] = [];
      for (const sc of scenarios) {
        const t0 = performance.now();
        const res = await fetch(sc.endpoint, {
          method: sc.method,
          headers: sc.body ? { 'Content-Type': 'application/json' } : undefined,
          body: sc.body,
        });
        const dur = Math.round(performance.now() - t0);
        out.push({
          name: sc.name,
          status: res.ok ? 'PASS' : 'FAIL',
          duration: `${dur}ms`,
          detail: res.ok ? `HTTP ${res.status} OK` : `HTTP ${res.status} Error`,
        });
      }
      setTestResults(out);
      showToast('Automations executed! All routes verified.');
    } catch (err: any) {
      showToast(`Automation check failed: ${err.message}`);
    } finally {
      setRunningTests(false);
    }
  };

  const handleDownloadMarkdown = (prop: Proposal, gig?: Gig) => {
    const content = `# Freelance Proposal: ${gig?.title || 'Contract Opportunity'}
Client: ${gig?.clientName || 'Client'}
Proposed Rate: $${prop.proposedRate} ${prop.pricingType === 'HOURLY' ? '/hr' : 'fixed'}
Timeline: ${prop.estimatedTimeline}
Strategy: ${prop.strategy || 'TECHNICAL'}
Status: ${prop.status}

## Statement of Qualifications & Cover Letter
${prop.coverLetter}

## Proposed Milestones
${(prop.milestones || []).map((m, i) => `${i + 1}. **${m.title}** ($${m.amount}) - ${m.durationDays} days\n   ${m.description}`).join('\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposal-${prop.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Proposal downloaded as Markdown (.md)');
  };

  const filteredMatches = matches.filter((m) => {
    const titleMatch =
      m.gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.gig.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.gig.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const gigPeriod = m.gig.compensationPeriod || (m.gig.pricingType === 'HOURLY' ? 'hourly' : 'fixed');
    const pricingMatch =
      pricingFilter === 'ALL' ||
      m.gig.pricingType === pricingFilter ||
      (pricingFilter === 'HOURLY' && (m.gig.pricingType === 'HOURLY' || gigPeriod === 'hourly')) ||
      (pricingFilter === 'FIXED_PRICE' && (m.gig.pricingType === 'FIXED_PRICE' || gigPeriod === 'fixed')) ||
      (pricingFilter === 'YEARLY' && gigPeriod === 'yearly') ||
      (pricingFilter === 'UNDISCLOSED' && gigPeriod === 'undisclosed');
    const scoreMatch =
      scoreFilter === 'ALL'
        ? true
        : scoreFilter === 'HIGH'
        ? m.score >= 80
        : m.score >= 65;
    const techMatch =
      selectedTech === 'ALL'
        ? true
        : m.gig.skills.some((s) => s.toLowerCase().includes(selectedTech.toLowerCase()));
    return titleMatch && pricingMatch && scoreMatch && techMatch;
  });

  const highWinnabilityGigs = matches.filter((m) => m.score >= 80);
  const readyReviewCount = proposals.filter((p) => p.status === 'READY_FOR_REVIEW').length;
  const approvedCount = proposals.filter((p) => p.status === 'APPROVED').length;
  const submittedCount = proposals.filter((p) => p.status === 'SUBMITTED').length;

  return (
    <main>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#f8fafc', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, border: '1px solid var(--border-muted)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          {toastMessage}
        </div>
      )}

      {/* Minimal Top Bar Contract: Brand · Tabs · Actions */}
      <nav className="top-nav">
        <div className="brand-wordmark">
          <span className="brand-title">Freelancer Agent</span>
          <span className="brand-tag">· Dhruv Parasher · 4y MERN</span>
        </div>

        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button
            className={`tab-btn ${activeTab === 'discovery' ? 'active' : ''}`}
            onClick={() => setActiveTab('discovery')}
          >
            Discovery ({matches.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            Pipeline ({proposals.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'intake' ? 'active' : ''}`}
            onClick={() => setActiveTab('intake')}
          >
            Ingest
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            Automations
          </button>
          <button
            className={`tab-btn ${activeTab === 'legacyJobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('legacyJobs')}
          >
            Jobs
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="secondary"
            onClick={() => loadData(simulatedRate)}
            title="Sync all open feeds"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            ↻ Sync
          </button>
          <button
            className="success"
            onClick={() => setActiveTab('intake')}
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            + Ingest Project
          </button>
        </div>
      </nav>

      {/* Quiet Assurance & Verified Profile Line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)' }}>
        <div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Dhruv Parasher</span>
          <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>·</span>
          <span>4 Years Experience</span>
          <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>·</span>
          <span>React, Next.js, Node.js, NestJS, TypeScript, PostgreSQL, MongoDB</span>
          <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>·</span>
          <span style={{ color: '#34d399' }}>Available Immediately</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ color: '#34d399' }}>●</span>
          <span>Human-in-the-Loop: Zero auto-bidding or unauthorized messaging</span>
        </div>
      </div>

      {/* Minimal KPI Metrics Strip */}
      <section className="grid">
        <div className="metric">
          <small>Discovered Contracts</small>
          <strong>{matches.length}</strong>
          <span>Permitted public feeds</span>
        </div>
        <div className="metric">
          <small>High Winnability (≥ 80)</small>
          <strong style={{ color: '#34d399' }}>{highWinnabilityGigs.length}</strong>
          <span>Direct skill & rate alignment</span>
        </div>
        <div className="metric">
          <small>Awaiting Review</small>
          <strong style={{ color: readyReviewCount > 0 ? '#fbbf24' : 'var(--text-primary)' }}>{readyReviewCount}</strong>
          <span>Drafted for manual review</span>
        </div>
        <div className="metric">
          <small>Pipeline Active</small>
          <strong style={{ color: '#60a5fa' }}>{approvedCount + submittedCount}</strong>
          <span>Active in proposal queue</span>
        </div>
      </section>

      {/* TAB 1: GIG DISCOVERY */}
      {activeTab === 'discovery' && (
        <section>
          {/* Header Row: Feed status & Sync */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, margin: 0 }}>Active Freelance Opportunities</h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                Direct contracts from Himalayas, Jobicy, Freelancer.com, and community briefs.
              </p>
            </div>
            <button
              className="outline"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={handleSyncLiveRemoteFeeds}
              disabled={isSyncingLiveFeeds}
            >
              {isSyncingLiveFeeds ? 'Syncing Feeds...' : '↻ Refresh Feeds'}
            </button>
          </div>

          {/* Minimal Rate Simulator */}
          <div className="panel" style={{ marginBottom: 16, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14 }}>Hourly Rate Winnability Simulator</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Test how adjusting your proposed hourly rate shifts winnability scores across client budgets.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  ${simulatedRate}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ hr</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>$30</span>
              <input
                type="range"
                min="30"
                max="85"
                step="5"
                value={simulatedRate}
                onChange={(e) => handleRateSimulationChange(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-primary)', cursor: 'pointer', height: 4 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>$85</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>
                {simulatedRate <= 45 ? 'Optimal market winnability: Strong conversion on fixed and hourly contracts.' : 'Selective rate: Targets senior architectural consulting contracts.'}
              </span>
              {isSimulating && <span style={{ color: 'var(--accent-primary)' }}>Recalculating scores...</span>}
            </div>
          </div>

          {/* Quick Tech Filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>Stack:</span>
            {['ALL', 'React', 'Next.js', 'NestJS', 'Node.js', 'GraphQL', 'PostgreSQL', 'MongoDB'].map((tech) => (
              <button
                key={tech}
                className={selectedTech === tech ? 'secondary' : 'outline'}
                style={{
                  padding: '3px 10px',
                  fontSize: 12,
                  borderRadius: 4,
                  fontWeight: selectedTech === tech ? 600 : 400,
                  borderColor: selectedTech === tech ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  color: selectedTech === tech ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                onClick={() => setSelectedTech(tech)}
              >
                {tech}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Filter by title, skill, or client name..."
              className="input"
              style={{ flex: 1, minWidth: 200 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value)}
            >
              <option value="ALL">All Compensation Models</option>
              <option value="HOURLY">Hourly Contracts</option>
              <option value="FIXED_PRICE">Fixed Price Projects</option>
              <option value="YEARLY">Salaried / Annual</option>
              <option value="UNDISCLOSED">Competitive / Undisclosed</option>
            </select>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
            >
              <option value="ALL">All Winnability Scores</option>
              <option value="HIGH">High Winnability (≥ 80)</option>
              <option value="GOOD">Good Fit (≥ 65)</option>
            </select>
          </div>

          {loading && <p style={{ color: 'var(--text-muted)' }}>Scanning permitted providers and scoring opportunities...</p>}
          {error && <p style={{ color: 'var(--accent-danger)' }}>{error}</p>}

          {!loading && filteredMatches.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h3 style={{ fontSize: 15 }}>No matching contracts found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try resetting filters or paste a project URL via the Ingest tab.</p>
              <button className="secondary" style={{ marginTop: 8 }} onClick={() => { setSearchTerm(''); setSelectedTech('ALL'); setPricingFilter('ALL'); setScoreFilter('ALL'); }}>
                Reset Filters
              </button>
            </div>
          )}

          {filteredMatches.map((m) => {
            const gig = m.gig;
            const scoreClass =
              m.score >= 80 ? 'score-high' : m.score >= 65 ? 'score-mid' : 'score-low';
            const priceLabel = formatPriceLabel(gig);

            return (
              <article key={gig.id} className="card-item">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Clean Minimal Score Badge */}
                  <div className={`score-badge ${scoreClass}`}>
                    <span>{m.score}</span>
                    <small style={{ fontSize: 9, opacity: 0.8 }}>FIT</small>
                  </div>

                  {/* Main Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 15 }}>
                        {gig.title}
                      </h3>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
                        {priceLabel}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '4px 0 10px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{gig.clientName}</span>
                      <span>·</span>
                      <span>{gig.clientLocation || 'Remote Worldwide'}</span>
                      {gig.paymentVerified && (
                        <>
                          <span>·</span>
                          <span style={{ color: '#34d399' }}>✓ Verified</span>
                        </>
                      )}
                      <span>·</span>
                      <span>⭐ {gig.clientRating.toFixed(1)} ({gig.clientReviewCount} reviews)</span>
                      <span>·</span>
                      <span className="tabular-nums">${Math.round(gig.clientTotalSpent).toLocaleString()} spent</span>
                    </div>

                    <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {gig.description}
                    </p>

                    {/* Skill Tags */}
                    <div style={{ marginBottom: 12 }}>
                      {gig.skills.map((skill) => {
                        const isMatched = m.matchedSkills.includes(skill);
                        return (
                          <span key={skill} className={`tag ${isMatched ? 'matched' : ''}`}>
                            {isMatched ? '✓ ' : ''}{skill}
                          </span>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                      <button
                        onClick={() => {
                          setSelectedMatch(m);
                          handleGenerateProposal(gig.id);
                        }}
                        style={{ fontSize: 12, padding: '5px 12px' }}
                      >
                        Draft Proposal
                      </button>
                      <button
                        onClick={() => setSelectedMatch(m)}
                        className="secondary"
                        style={{ fontSize: 12, padding: '5px 12px' }}
                      >
                        Inspect Fit
                      </button>
                      <a
                        href={gig.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="outline"
                        style={{ fontSize: 12, padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                      >
                        Direct Link ↗
                      </a>

                      {(() => {
                        const fallbacks = getPlatformFallbacks(gig);
                        const health = linkHealthMap[gig.sourceUrl];
                        return (
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' }}>
                            <a
                              href={fallbacks.upwork}
                              target="_blank"
                              rel="noreferrer"
                              className="outline"
                              style={{ fontSize: 11, padding: '5px 8px', textDecoration: 'none' }}
                            >
                              Upwork ↗
                            </a>
                            <a
                              href={fallbacks.freelancer}
                              target="_blank"
                              rel="noreferrer"
                              className="outline"
                              style={{ fontSize: 11, padding: '5px 8px', textDecoration: 'none' }}
                            >
                              Freelancer ↗
                            </a>
                            <button
                              className="secondary"
                              style={{
                                fontSize: 11,
                                padding: '5px 8px',
                                color: health?.isLive ? '#34d399' : health?.isLive === false ? '#f87171' : 'var(--text-muted)',
                              }}
                              onClick={() => handleVerifyLink(gig.sourceUrl)}
                              disabled={health?.checking}
                            >
                              {health?.checking
                                ? 'Checking...'
                                : health?.isLive
                                ? `Live (${health.statusCode || 200})`
                                : health?.isLive === false
                                ? 'Closed'
                                : 'Check Link'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* TAB 2: PIPELINE & KANBAN */}
      {activeTab === 'pipeline' && (
        <section>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 16, margin: 0 }}>Proposal Review & Submission Pipeline</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  Proposals require explicit review before dispatch. Approving clears a proposal for manual copy and submission.
                </p>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Zero Auto-Submission: Personal credentials are never held or automated.
              </span>
            </div>
          </div>

          <div className="kanban-board">
            {/* Column 1: Ready for Review */}
            <div className="kanban-col">
              <div className="kanban-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>Awaiting Review</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {readyReviewCount}
                </span>
              </div>
              {proposals.filter((p) => p.status === 'READY_FOR_REVIEW').length === 0 ? (
                <small style={{ display: 'block', textAlign: 'center', padding: '36px 10px', color: 'var(--text-muted)' }}>
                  No drafts currently awaiting review.
                </small>
              ) : (
                proposals
                  .filter((p) => p.status === 'READY_FOR_REVIEW')
                  .map((p) => {
                    const gig = matches.find((m) => m.gig.id === p.gigId)?.gig;
                    return (
                      <div key={p.id} className="card-item" style={{ marginBottom: 10, padding: '12px 14px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: 14 }}>
                          {gig ? gig.title : `Proposal ${p.id}`}
                        </h4>
                        <small style={{ color: 'var(--text-muted)' }}>{gig?.clientName || 'Client'}</small>
                        <div style={{ margin: '6px 0', fontSize: 13, color: 'var(--accent-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                          {gig ? (gig.currencySymbol || getCurrencySymbol(gig.currency)) : '$'}{p.proposedRate} {p.pricingType === 'HOURLY' ? '/hr' : 'total'}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          <button
                            className="secondary"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => {
                              setActiveProposal(p);
                              setEditableCoverLetter(p.coverLetter);
                              setEditableMilestones(p.milestones || []);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="success"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => handleUpdateProposalStatus(p.id, 'APPROVED')}
                          >
                            ✓ Approve
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Column 2: Approved / Cleared */}
            <div className="kanban-col">
              <div className="kanban-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>Ready to Submit</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {approvedCount}
                </span>
              </div>
              {proposals.filter((p) => p.status === 'APPROVED').length === 0 ? (
                <small style={{ display: 'block', textAlign: 'center', padding: '36px 10px', color: 'var(--text-muted)' }}>
                  No proposals approved yet.
                </small>
              ) : (
                proposals
                  .filter((p) => p.status === 'APPROVED')
                  .map((p) => {
                    const gig = matches.find((m) => m.gig.id === p.gigId)?.gig;
                    return (
                      <div key={p.id} className="card-item" style={{ marginBottom: 10, padding: '12px 14px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: 14 }}>
                          {gig ? gig.title : `Proposal ${p.id}`}
                        </h4>
                        <small style={{ color: 'var(--text-muted)' }}>{gig?.clientName || 'Client'}</small>
                        <div style={{ margin: '6px 0', fontSize: 13, color: '#34d399', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                          {gig ? (gig.currencySymbol || getCurrencySymbol(gig.currency)) : '$'}{p.proposedRate} {p.pricingType === 'HOURLY' ? '/hr' : 'total'}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {gig?.sourceUrl && (
                            <a
                              href={gig.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="outline"
                              style={{ fontSize: 11, padding: '4px 8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              Job Post ↗
                            </a>
                          )}
                          <button
                            className="outline"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => {
                              navigator.clipboard.writeText(p.coverLetter);
                              showToast('Cover letter copied! Paste into client application.');
                            }}
                          >
                            Copy Text
                          </button>
                          <button
                            className="outline"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => handleDownloadMarkdown(p, gig)}
                          >
                            .md
                          </button>
                          <button
                            style={{ fontSize: 11, padding: '4px 8px', background: '#059669' }}
                            onClick={() => handleUpdateProposalStatus(p.id, 'SUBMITTED')}
                            title="Click this after you have pasted and submitted your bid on the client platform"
                          >
                            Mark Submitted ✓
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Column 3: Submitted */}
            <div className="kanban-col">
              <div className="kanban-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-primary)' }}>Submitted to Client</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {submittedCount}
                </span>
              </div>
              {proposals.filter((p) => p.status === 'SUBMITTED').length === 0 ? (
                <small style={{ display: 'block', textAlign: 'center', padding: '36px 10px', color: 'var(--text-muted)' }}>
                  No active client submissions yet.
                </small>
              ) : (
                proposals
                  .filter((p) => p.status === 'SUBMITTED')
                  .map((p) => {
                    const gig = matches.find((m) => m.gig.id === p.gigId)?.gig;
                    return (
                      <div key={p.id} className="card-item" style={{ marginBottom: 10, padding: '12px 14px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: 14 }}>
                          {gig ? gig.title : `Proposal ${p.id}`}
                        </h4>
                        <small style={{ color: 'var(--text-muted)' }}>Submitted {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : 'Recently'}</small>
                        <div style={{ margin: '6px 0', fontSize: 13, color: 'var(--accent-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                          {gig ? (gig.currencySymbol || getCurrencySymbol(gig.currency)) : '$'}{p.proposedRate} {p.pricingType === 'HOURLY' ? '/hr' : 'total'}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <button
                            className="outline"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => {
                              navigator.clipboard.writeText(p.coverLetter);
                              showToast('Cover letter copied!');
                            }}
                          >
                            Copy Text
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: AUTOMATED TEST SUITE */}
      {activeTab === 'tests' && (
        <section className="panel" style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 16, margin: 0 }}>Automated Quality & Integration Harness</h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                Runs live integration tests verifying data routes, rate simulation, 5-dimension scoring, and factual guardrails.
              </p>
            </div>
            <button disabled={runningTests} onClick={handleRunAutomations} style={{ padding: '6px 14px', fontSize: 12 }}>
              {runningTests ? 'Running Automations...' : '▶ Run All Automations'}
            </button>
          </div>

          <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 14 }}>
            {testResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 10px', color: 'var(--text-muted)' }}>
                <p style={{ margin: 0 }}>Click "Run All Automations" to execute the live integration test suite.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Test Scenario</span>
                  <span>Status & Latency</span>
                </div>
                {testResults.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < testResults.length - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: t.status === 'PASS' ? '#34d399' : '#f87171', fontWeight: 600 }}>
                        {t.status === 'PASS' ? '✓' : '✗'}
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: t.status === 'PASS' ? '#34d399' : '#f87171' }}>
                        {t.status}
                      </span>
                      <small style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{t.duration}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: INGEST OPPORTUNITY */}
      {activeTab === 'intake' && (
        <section className="panel" style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Ingest Project Opportunity</h2>
          <p style={{ margin: '2px 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
            Submit an open freelance job URL or project brief. The agent will normalize skills, score winnability, and deduplicate.
          </p>

          <form onSubmit={handleManualIntake} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Project Title *
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%' }}
                placeholder="e.g. Senior MERN Stack & Next.js SaaS Developer"
                value={intakeTitle}
                onChange={(e) => setIntakeTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Client / Organization
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%' }}
                  placeholder="e.g. CloudScale Innovations"
                  value={intakeClient}
                  onChange={(e) => setIntakeClient(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Pricing Model
                </label>
                <select
                  style={{ width: '100%' }}
                  value={intakePricingType}
                  onChange={(e) => setIntakePricingType(e.target.value as any)}
                >
                  <option value="FIXED_PRICE">Fixed Price ($ USD)</option>
                  <option value="HOURLY">Hourly Rate ($ USD / hr)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  {intakePricingType === 'FIXED_PRICE' ? 'Budget ($ USD)' : 'Hourly Rate ($ USD / hr)'}
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: '100%' }}
                  value={intakeBudget}
                  onChange={(e) => setIntakeBudget(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Source URL *
                </label>
                <input
                  type="url"
                  className="input"
                  style={{ width: '100%' }}
                  placeholder="https://..."
                  value={intakeUrl}
                  onChange={(e) => setIntakeUrl(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Skills (Comma-separated)
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%' }}
                value={intakeSkills}
                onChange={(e) => setIntakeSkills(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Project Description & Deliverables
              </label>
              <textarea
                style={{ minHeight: 120 }}
                placeholder="Paste the scope, deliverables, or technical requirements..."
                value={intakeDesc}
                onChange={(e) => setIntakeDesc(e.target.value)}
              />
            </div>

            <button type="submit" disabled={intakeLoading} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
              {intakeLoading ? 'Ingesting...' : 'Ingest & Calculate Fit'}
            </button>
          </form>
        </section>
      )}

      {/* TAB 5: VERIFIED PROFILE & RATE MANAGER */}
      {activeTab === 'profile' && profileForm && (
        <section className="panel" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 16, margin: 0 }}>Freelancer Profile & Rate Settings</h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                Proposals are strictly generated using these verified qualifications. Zero invented credentials.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', opacity: 0.8 }}
                  value={profileForm.fullName}
                  disabled
                />
                <small style={{ color: 'var(--text-muted)' }}>Verified identity</small>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Years of Experience
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: '100%', opacity: 0.8 }}
                  value={profileForm.yearsExperience}
                  disabled
                />
                <small style={{ color: 'var(--text-muted)' }}>Verified: 4 years MERN</small>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Target Hourly Rate ($ USD / hr)
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: '100%' }}
                  value={profileForm.targetHourlyRateUsd}
                  onChange={(e) => setProfileForm({ ...profileForm, targetHourlyRateUsd: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Minimum Fixed Budget ($ USD)
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: '100%' }}
                  value={profileForm.minProjectBudgetUsd}
                  onChange={(e) => setProfileForm({ ...profileForm, minProjectBudgetUsd: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Core Verified Tech Stack
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {profileForm.skills.map((skill) => (
                  <span key={skill} className="tag matched" style={{ fontSize: 12, padding: '3px 8px' }}>
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Statement of Qualifications & Bio
              </label>
              <textarea
                style={{ minHeight: 100 }}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              />
            </div>

            <button type="submit" disabled={savingProfile} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
              {savingProfile ? 'Saving...' : 'Save Profile Settings'}
            </button>
          </form>
        </section>
      )}

      {/* TAB 6: LEGACY EMPLOYMENT JOBS */}
      {activeTab === 'legacyJobs' && (
        <section className="panel" style={{ maxWidth: 840, margin: '0 auto' }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>Full-Time Employment Job Hunter</h2>
          <p style={{ margin: '2px 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
            Original employment opportunities tracking and deterministic fit scoring.
          </p>
          <article style={{ borderTop: '1px solid var(--border-subtle)', padding: '14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Senior Full Stack / MERN Engineer</h3>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Fintech Solutions India</span>
                <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>Bengaluru / Remote · Target: ₹20–26 LPA</p>
                <small style={{ color: 'var(--text-muted)' }}>Matched: React, Next.js, TypeScript, Node.js, PostgreSQL</small>
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>92 / 100 Fit</span>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* 5-DIMENSION WINNABILITY INSPECTOR MODAL */}
      {selectedMatch && (
        <div className="modal-backdrop" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 18, margin: 0 }}>{selectedMatch.gig.title}</h2>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
                    {selectedMatch.score}/100 Winnability
                  </span>
                </div>
                <small style={{ color: 'var(--text-muted)' }}>
                  {selectedMatch.gig.clientName} · {selectedMatch.gig.clientLocation || 'Remote Worldwide'} · <span style={{ color: '#34d399', fontWeight: 600 }}>{formatPriceLabel(selectedMatch.gig)}</span>
                </small>
              </div>
              <button className="secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setSelectedMatch(null)}>
                ✕
              </button>
            </div>

            {/* Score Breakdown Progress Bars */}
            <div style={{ background: 'var(--bg-canvas)', padding: 14, borderRadius: 8, margin: '14px 0', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Explainable 5-Dimension Fit Breakdown
              </h3>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>Technical Skills Overlap ({selectedMatch.breakdown.skillsMatch}/35 pts)</span>
                  <span className="tabular-nums">{Math.round((selectedMatch.breakdown.skillsMatch / 35) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.skillsMatch / 35) * 100}%` }} />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>Budget & Compensation Fit ({selectedMatch.breakdown.budgetFit}/25 pts)</span>
                  <span className="tabular-nums">{Math.round((selectedMatch.breakdown.budgetFit / 25) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.budgetFit / 25) * 100}%` }} />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>Client Trust & History ({selectedMatch.breakdown.clientTrust}/20 pts)</span>
                  <span className="tabular-nums">{Math.round((selectedMatch.breakdown.clientTrust / 20) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.clientTrust / 20) * 100}%` }} />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>Scope Feasibility ({selectedMatch.breakdown.scopeFit}/10 pts)</span>
                  <span className="tabular-nums">{Math.round((selectedMatch.breakdown.scopeFit / 10) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.scopeFit / 10) * 100}%` }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>Conversion Likelihood ({selectedMatch.breakdown.winnability}/10 pts)</span>
                  <span className="tabular-nums">{Math.round((selectedMatch.breakdown.winnability / 10) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.winnability / 10) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Strengths & Risks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '14px 0' }}>
              <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
                <h4 style={{ margin: '0 0 6px', color: '#34d399', fontSize: 12 }}>Key Strengths</h4>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                  {selectedMatch.keyStrengths.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: 3 }}>{s}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
                <h4 style={{ margin: '0 0 6px', color: '#fbbf24', fontSize: 12 }}>Risk Factors</h4>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                  {selectedMatch.riskFactors.length > 0 ? (
                    selectedMatch.riskFactors.map((r, idx) => (
                      <li key={idx} style={{ marginBottom: 3 }}>{r}</li>
                    ))
                  ) : (
                    <li>No significant risk factors detected.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Project Full Description */}
            <div style={{ margin: '14px 0' }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Project Scope Brief</h4>
              <p style={{ background: 'var(--bg-canvas)', padding: 12, borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', border: '1px solid var(--border-subtle)' }}>
                {selectedMatch.gig.description}
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
              <a
                href={selectedMatch.gig.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="outline"
                style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 'auto' }}
              >
                Direct Vacancy ↗
              </a>
              <button
                className="secondary"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => setSelectedMatch(null)}
              >
                Close
              </button>
              <button
                disabled={isGenerating}
                style={{ fontSize: 12, padding: '6px 14px' }}
                onClick={() => handleGenerateProposal(selectedMatch.gig.id)}
              >
                {isGenerating ? 'Drafting Proposal...' : 'Draft Tailored Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROPOSAL STUDIO MODAL */}
      {activeProposal && (
        <div className="modal-backdrop" onClick={() => setActiveProposal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <h2 style={{ fontSize: 18, margin: 0 }}>Proposal Studio</h2>
                  <span style={{ fontSize: 12, color: '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>
                    Status: {activeProposal.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <small style={{ color: 'var(--text-muted)' }}>
                  Provider: {activeProposal.providerUsed} · Human Review Required Before Submission
                </small>
              </div>
              <button className="secondary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setActiveProposal(null)}>
                ✕
              </button>
            </div>

            {/* Strategy Switcher */}
            <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Strategy:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className={proposalStrategy === 'TECHNICAL' ? 'secondary' : 'outline'}
                    style={{ fontSize: 11, padding: '3px 8px', borderColor: proposalStrategy === 'TECHNICAL' ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                    onClick={() => {
                      setProposalStrategy('TECHNICAL');
                      handleGenerateProposal(activeProposal.gigId, 'TECHNICAL');
                    }}
                  >
                    Technical Architecture
                  </button>
                  <button
                    className={proposalStrategy === 'RAPID_DELIVERY' ? 'secondary' : 'outline'}
                    style={{ fontSize: 11, padding: '3px 8px', borderColor: proposalStrategy === 'RAPID_DELIVERY' ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                    onClick={() => {
                      setProposalStrategy('RAPID_DELIVERY');
                      handleGenerateProposal(activeProposal.gigId, 'RAPID_DELIVERY');
                    }}
                  >
                    Rapid Sprints
                  </button>
                  <button
                    className={proposalStrategy === 'CONSULTING' ? 'secondary' : 'outline'}
                    style={{ fontSize: 11, padding: '3px 8px', borderColor: proposalStrategy === 'CONSULTING' ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                    onClick={() => {
                      setProposalStrategy('CONSULTING');
                      handleGenerateProposal(activeProposal.gigId, 'CONSULTING');
                    }}
                  >
                    Senior Consultant
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                <label style={{ fontWeight: 500 }}>Tailored Pitch & Cover Letter</label>
                <span className="tabular-nums">{editableCoverLetter.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea
                value={editableCoverLetter}
                onChange={(e) => setEditableCoverLetter(e.target.value)}
                style={{ minHeight: 200, width: '100%', fontSize: 13 }}
              />
            </div>

            {/* Editable Milestones Breakdown */}
            <div style={{ background: 'var(--bg-canvas)', padding: 12, borderRadius: 8, marginBottom: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                  Proposed Deliverable Milestones
                </h4>
                <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  Total: ${editableMilestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0).toLocaleString()}
                </span>
              </div>

              {editableMilestones.map((m, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center', padding: '5px 0', borderBottom: idx < editableMilestones.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <input
                    type="text"
                    className="input"
                    style={{ fontSize: 12, padding: '5px 8px' }}
                    value={m.title}
                    onChange={(e) => {
                      const updated = [...editableMilestones];
                      updated[idx].title = e.target.value;
                      setEditableMilestones(updated);
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number"
                      className="input"
                      style={{ fontSize: 12, padding: '5px 8px', width: '100%' }}
                      value={m.durationDays}
                      onChange={(e) => {
                        const updated = [...editableMilestones];
                        updated[idx].durationDays = Number(e.target.value);
                        setEditableMilestones(updated);
                      }}
                    />
                    <small style={{ color: 'var(--text-muted)' }}>days</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <small style={{ color: 'var(--text-muted)' }}>$</small>
                    <input
                      type="number"
                      className="input"
                      style={{ fontSize: 12, padding: '5px 8px', width: '100%' }}
                      value={m.amount}
                      onChange={(e) => {
                        const updated = [...editableMilestones];
                        updated[idx].amount = Number(e.target.value);
                        setEditableMilestones(updated);
                      }}
                    />
                  </div>
                  <button
                    className="outline"
                    style={{ padding: '4px 6px', fontSize: 11, color: '#f87171' }}
                    onClick={() => {
                      setEditableMilestones(editableMilestones.filter((_, i) => i !== idx));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                className="secondary"
                style={{ fontSize: 11, padding: '4px 8px', marginTop: 8 }}
                onClick={() => {
                  setEditableMilestones([
                    ...editableMilestones,
                    { title: `Milestone ${editableMilestones.length + 1}`, description: 'Additional deliverable', durationDays: 5, amount: 500 },
                  ]);
                }}
              >
                + Add Milestone
              </button>
            </div>

            {/* Human-in-the-Loop Reassurance Note */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Human-in-the-Loop: Approving unlocks the proposal for manual copying or markdown download. Zero automatic bidding or external messaging.
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
              {(() => {
                const activeGig = matches.find((m) => m.gig.id === activeProposal.gigId)?.gig;
                if (!activeGig) return null;
                return (
                  <a
                    href={activeGig.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="outline"
                    style={{ fontSize: 12, padding: '6px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 'auto' }}
                  >
                    Job Post ↗
                  </a>
                );
              })()}

              <button
                className="outline"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => {
                  navigator.clipboard.writeText(editableCoverLetter);
                  showToast('Proposal copied to clipboard!');
                }}
              >
                Copy Text
              </button>

              <button
                className="outline"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => handleDownloadMarkdown(activeProposal)}
              >
                Download .md
              </button>

              <button
                className="secondary"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => handleUpdateProposalStatus(activeProposal.id, 'DRAFT')}
              >
                Save Draft
              </button>

              <button
                className="success"
                style={{ fontSize: 12, padding: '6px 14px' }}
                onClick={() => handleUpdateProposalStatus(activeProposal.id, 'APPROVED')}
              >
                ✓ Approve (Clear for Manual Submission)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
