'use client';

import { useEffect, useState } from 'react';

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

type Proposal = {
  id: string;
  gigId: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  coverLetter: string;
  proposedRate: number;
  pricingType: string;
  estimatedTimeline: string;
  milestones: Array<{
    title: string;
    description: string;
    durationDays: number;
    amount: number;
  }>;
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
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'discovery' | 'proposals' | 'intake' | 'profile' | 'legacyJobs'>('discovery');
  const [matches, setMatches] = useState<ScoredMatch[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [pricingFilter, setPricingFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL');

  // Selected item modal state
  const [selectedMatch, setSelectedMatch] = useState<ScoredMatch | null>(null);
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableCoverLetter, setEditableCoverLetter] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Manual intake form state
  const [intakeTitle, setIntakeTitle] = useState('');
  const [intakeClient, setIntakeClient] = useState('');
  const [intakeBudget, setIntakeBudget] = useState('2500');
  const [intakePricingType, setIntakePricingType] = useState<'FIXED_PRICE' | 'HOURLY'>('FIXED_PRICE');
  const [intakeSkills, setIntakeSkills] = useState('React, Next.js, TypeScript, Node.js, PostgreSQL');
  const [intakeUrl, setIntakeUrl] = useState('');
  const [intakeDesc, setIntakeDesc] = useState('');
  const [intakeLoading, setIntakeLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesRes, proposalsRes, profileRes] = await Promise.all([
        fetch('/api/gigs/matches'),
        fetch('/api/gigs/proposals'),
        fetch('/api/freelancer/profile'),
      ]);

      if (matchesRes.ok) {
        const data = await matchesRes.json();
        setMatches(data.matches || []);
        if (data.freelancer) setProfile(data.freelancer);
      }
      if (proposalsRes.ok) {
        const props = await proposalsRes.json();
        setProposals(props || []);
      }
      if (profileRes.ok && !profile) {
        const prof = await profileRes.json();
        setProfile(prof);
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

  const handleGenerateProposal = async (gigId: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/gigs/${gigId}/proposals/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'deterministic' }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const prop: Proposal = await res.json();
      setActiveProposal(prop);
      setEditableCoverLetter(prop.coverLetter);
      setProposals((prev) => [prop, ...prev.filter((p) => p.id !== prop.id)]);
      showToast('Proposal drafted successfully! Awaiting your review.');
    } catch {
      showToast('Failed to generate proposal draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, newStatus: Proposal['status']) => {
    try {
      const res = await fetch(`/api/gigs/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          coverLetter: editableCoverLetter,
        }),
      });
      if (!res.ok) throw new Error('Status update failed');
      const updated: Proposal = await res.json();
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (activeProposal?.id === updated.id) {
        setActiveProposal(updated);
      }
      if (newStatus === 'APPROVED') {
        showToast('Proposal approved! Ready for manual submission.');
      } else if (newStatus === 'SUBMITTED') {
        showToast('Marked as submitted to client.');
      } else {
        showToast(`Proposal status updated to ${newStatus}.`);
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
      showToast('New project ingested and scored!');
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

  const filteredMatches = matches.filter((m) => {
    const titleMatch = m.gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.gig.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const pricingMatch = pricingFilter === 'ALL' || m.gig.pricingType === pricingFilter;
    const scoreMatch =
      scoreFilter === 'ALL'
        ? true
        : scoreFilter === 'HIGH'
        ? m.score >= 80
        : m.score >= 65;
    return titleMatch && pricingMatch && scoreMatch;
  });

  const activeBidsCount = proposals.filter((p) => p.status === 'SUBMITTED').length;
  const readyReviewCount = proposals.filter((p) => p.status === 'READY_FOR_REVIEW').length;
  const approvedCount = proposals.filter((p) => p.status === 'APPROVED').length;

  return (
    <main>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0284c7', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <span className="pill pill-green">FREELANCER AUTONOMOUS AGENT</span>
            <span className="badge-verified">Verified 4 Yrs MERN · Dhruv Parasher</span>
            <span className="pill pill-purple">Branch: feature/freelancer-agent-foundation</span>
          </div>
          <h1>Freelancer Autonomous Agent Workspace</h1>
          <p>
            Autonomous opportunity discovery, transparent winnability scoring, and safe proposal drafting with strict human-in-the-loop approval.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="secondary" onClick={loadData}>
            ↻ Sync Discovery
          </button>
          <button className="success" onClick={() => setActiveTab('intake')}>
            + Ingest Project
          </button>
        </div>
      </header>

      {/* Safety Notice Banner */}
      <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🛡️</span>
          <div>
            <strong style={{ color: '#fde047', fontSize: 13 }}>Autonomous Safety Protocol Active:</strong>
            <span style={{ color: '#cbd5e1', fontSize: 13, marginLeft: 6 }}>
              Bids and client messages require your explicit review and approval. No automatic submissions.
            </span>
          </div>
        </div>
        <span className="pill pill-amber">Zero Blind Bids</span>
      </div>

      {/* High-level KPIs */}
      <section className="grid">
        <div className="metric">
          <small>Discovered Gigs</small>
          <strong>{matches.length}</strong>
          <span>High-relevance contracts</span>
        </div>
        <div className="metric">
          <small>Proposals for Review</small>
          <strong style={{ color: readyReviewCount > 0 ? '#fbbf24' : '#f8fafc' }}>{readyReviewCount}</strong>
          <span>Awaiting your approval</span>
        </div>
        <div className="metric">
          <small>Approved / Ready</small>
          <strong style={{ color: '#4ade80' }}>{approvedCount}</strong>
          <span>Verified & cleared</span>
        </div>
        <div className="metric">
          <small>Verified Rate & Availability</small>
          <strong>${profile?.targetHourlyRateUsd || 45}/hr</strong>
          <span>Immediate · 40 hrs/wk</span>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="tabs">
        <button
          className={`tab-btn ${activeTab === 'discovery' ? 'active' : ''}`}
          onClick={() => setActiveTab('discovery')}
        >
          🎯 Gig Discovery & Matcher ({matches.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          📝 Proposal Approval & Bids ({proposals.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'intake' ? 'active' : ''}`}
          onClick={() => setActiveTab('intake')}
        >
          📥 Ingest Custom Project
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Verified Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'legacyJobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('legacyJobs')}
        >
          💼 Employment Jobs (Phase 1)
        </button>
      </nav>

      {/* TAB 1: GIG DISCOVERY */}
      {activeTab === 'discovery' && (
        <section>
          {/* Filters Bar */}
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by keyword, skill, or title..."
              className="input"
              style={{ flex: 1, minWidth: 220 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value)}
            >
              <option value="ALL">All Pricing Models</option>
              <option value="HOURLY">Hourly Contracts</option>
              <option value="FIXED_PRICE">Fixed Price Projects</option>
            </select>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
            >
              <option value="ALL">All Match Scores</option>
              <option value="HIGH">High Winnability (≥ 80)</option>
              <option value="GOOD">Good Fit (≥ 65)</option>
            </select>
          </div>

          {loading && <p>Scanning permitted providers and scoring opportunities...</p>}
          {error && <p style={{ color: '#f87171' }}>{error}</p>}

          {!loading && filteredMatches.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h3>No matching gigs found</h3>
              <p>Try clearing filters or add a project URL via the Ingest tab.</p>
            </div>
          )}

          {filteredMatches.map((m) => {
            const gig = m.gig;
            const scoreClass =
              m.score >= 80 ? 'score-high' : m.score >= 65 ? 'score-mid' : 'score-low';
            const priceLabel =
              gig.pricingType === 'HOURLY'
                ? `$${gig.hourlyRateMin || 40}–$${gig.hourlyRateMax || 55}/hr`
                : `$${(gig.budgetMax || gig.budgetMin || 1000).toLocaleString()} fixed`;

            return (
              <article key={gig.id} className="card-item">
                <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  {/* Score Badge */}
                  <div className={`score-badge ${scoreClass}`}>
                    <span>{m.score}</span>
                    <small style={{ fontSize: 9, opacity: 0.85 }}>WIN FIT</small>
                  </div>

                  {/* Main Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 17, color: '#f8fafc' }}>
                        {gig.title}
                      </h3>
                      <span className="pill pill-green">{priceLabel}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', margin: '6px 0 10px', fontSize: 13, color: '#94a3b8' }}>
                      <strong style={{ color: '#cbd5e1' }}>{gig.clientName}</strong>
                      <span>·</span>
                      <span>{gig.clientLocation || 'Remote'}</span>
                      <span>·</span>
                      {gig.paymentVerified && (
                        <span className="badge-verified">✓ Payment Verified</span>
                      )}
                      <span>·</span>
                      <span>⭐ {gig.clientRating.toFixed(1)} ({gig.clientReviewCount} reviews)</span>
                      <span>·</span>
                      <span>${Math.round(gig.clientTotalSpent).toLocaleString()} spent</span>
                    </div>

                    <p style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8' }}>
                      {gig.description.length > 220 ? gig.description.slice(0, 220) + '…' : gig.description}
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
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #24324d', paddingTop: 12 }}>
                      <button
                        onClick={() => setSelectedMatch(m)}
                        className="secondary"
                      >
                        Inspect Winnability Breakdown
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMatch(m);
                          handleGenerateProposal(gig.id);
                        }}
                      >
                        ✨ Draft Tailored Proposal
                      </button>
                      <a
                        href={gig.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13, marginLeft: 'auto' }}
                      >
                        Original Project Feed ↗
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* TAB 2: PROPOSAL APPROVAL & BID TRACKER */}
      {activeTab === 'proposals' && (
        <section>
          <div className="panel" style={{ borderLeft: '4px solid #38bdf8' }}>
            <h2 style={{ fontSize: 18 }}>Proposal Review & Bid Pipeline</h2>
            <p>
              In accordance with safety guidelines, proposals are kept in a review state. You can edit the text, verify milestone budgets, and approve drafts before manual submission.
            </p>
          </div>

          {proposals.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h3>No proposals drafted yet</h3>
              <p>Select any scored gig from the Discovery tab and click "Draft Tailored Proposal".</p>
              <button onClick={() => setActiveTab('discovery')}>Browse Discovered Gigs</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {proposals.map((p) => {
                const gig = matches.find((m) => m.gig.id === p.gigId)?.gig;
                const statusPill =
                  p.status === 'APPROVED'
                    ? 'pill-green'
                    : p.status === 'READY_FOR_REVIEW'
                    ? 'pill-amber'
                    : 'pill-purple';

                return (
                  <div key={p.id} className="card-item" style={{ borderLeft: p.status === 'APPROVED' ? '4px solid #22c55e' : '4px solid #fbbf24' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <span className={`pill ${statusPill}`}>{p.status.replace(/_/g, ' ')}</span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>
                            Created {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: 17 }}>
                          {gig ? gig.title : `Proposal for Gig ${p.gigId}`}
                        </h3>
                        <small style={{ color: '#94a3b8' }}>Client: {gig?.clientName || 'Client'}</small>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: 16, color: '#38bdf8' }}>
                          ${p.proposedRate} {p.pricingType === 'HOURLY' ? '/hr' : 'total'}
                        </strong>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.estimatedTimeline}</div>
                      </div>
                    </div>

                    {/* Milestone Summary */}
                    {p.milestones && p.milestones.length > 0 && (
                      <div style={{ background: '#131c2e', borderRadius: 8, padding: '10px 14px', margin: '10px 0' }}>
                        <small style={{ fontWeight: 600, color: '#cbd5e1' }}>PROPOSED MILESTONES:</small>
                        <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: '#94a3b8' }}>
                          {p.milestones.map((m, idx) => (
                            <li key={idx}>
                              <strong style={{ color: '#f8fafc' }}>{m.title}</strong> — ${m.amount} ({m.durationDays} days)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Proposal Action Buttons */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                      <button
                        className="secondary"
                        onClick={() => {
                          setActiveProposal(p);
                          setEditableCoverLetter(p.coverLetter);
                        }}
                      >
                        🔍 View & Edit Cover Letter
                      </button>

                      {p.status === 'READY_FOR_REVIEW' && (
                        <button
                          className="success"
                          onClick={() => handleUpdateProposalStatus(p.id, 'APPROVED')}
                        >
                          ✓ Approve Proposal
                        </button>
                      )}

                      {p.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateProposalStatus(p.id, 'SUBMITTED')}
                        >
                          Mark as Submitted to Client
                        </button>
                      )}

                      <button
                        className="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(p.coverLetter);
                          showToast('Cover letter copied to clipboard!');
                        }}
                      >
                        Copy Letter Text
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: INGEST CUSTOM PROJECT */}
      {activeTab === 'intake' && (
        <section className="panel" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2>Ingest Opportunity via URL or Feed</h2>
          <p>
            Paste a project posting URL from permitted sources (Contra, RemoteOK, direct client post) or enter manual specifications. The agent will normalize the data and run the explainable scoring engine.
          </p>

          <form onSubmit={handleManualIntake} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                Project Title *
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%' }}
                placeholder="e.g. Full Stack Next.js & NestJS Consultant"
                value={intakeTitle}
                onChange={(e) => setIntakeTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                  Client / Company Name
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Acme Tech Labs"
                  value={intakeClient}
                  onChange={(e) => setIntakeClient(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                  Pricing Model
                </label>
                <select
                  style={{ width: '100%' }}
                  value={intakePricingType}
                  onChange={(e) => setIntakePricingType(e.target.value as any)}
                >
                  <option value="FIXED_PRICE">Fixed Price ($)</option>
                  <option value="HOURLY">Hourly Rate ($/hr)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                  Project / Feed Source URL *
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                Skills (comma-separated)
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 4 }}>
                Project Description & Requirements
              </label>
              <textarea
                style={{ minHeight: 120 }}
                placeholder="Paste the scope, requirements, or client instructions..."
                value={intakeDesc}
                onChange={(e) => setIntakeDesc(e.target.value)}
              />
            </div>

            <button type="submit" disabled={intakeLoading} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              {intakeLoading ? 'Ingesting & Scoring...' : 'Ingest & Calculate Winnability'}
            </button>
          </form>
        </section>
      )}

      {/* TAB 4: VERIFIED PROFILE */}
      {activeTab === 'profile' && profile && (
        <section className="panel" style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2>Verified Candidate Profile</h2>
            <span className="badge-verified">Factual Profile · Zero Hallucinations</span>
          </div>
          <p>
            The proposal generator strictly limits its claims to this verified background. No artificial employers, fake metrics, or unverified claims are produced.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, margin: '20px 0' }}>
            <div className="metric">
              <small>Full Name</small>
              <strong style={{ fontSize: 18 }}>{profile.fullName}</strong>
            </div>
            <div className="metric">
              <small>MERN Experience</small>
              <strong style={{ fontSize: 18 }}>{profile.yearsExperience} Years</strong>
            </div>
            <div className="metric">
              <small>Target Hourly Rate</small>
              <strong style={{ fontSize: 18 }}>${profile.targetHourlyRateUsd} / hr</strong>
            </div>
            <div className="metric">
              <small>Availability</small>
              <strong style={{ fontSize: 18, color: '#4ade80' }}>Immediate</strong>
            </div>
          </div>

          <div style={{ margin: '16px 0' }}>
            <small style={{ fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 8 }}>
              VERIFIED TECH STACK
            </small>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.skills.map((skill) => (
                <span key={skill} className="tag matched" style={{ fontSize: 12, padding: '5px 10px' }}>
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          <div style={{ margin: '16px 0' }}>
            <small style={{ fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
              BIO / STATEMENT OF QUALIFICATIONS
            </small>
            <p style={{ background: '#131c2e', padding: 14, borderRadius: 8, color: '#cbd5e1' }}>
              {profile.bio}
            </p>
          </div>

          <div style={{ margin: '16px 0' }}>
            <small style={{ fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
              PORTFOLIO & GITHUB
            </small>
            <a href={profile.portfolioLinks[0]} target="_blank" rel="noreferrer" style={{ fontSize: 14 }}>
              {profile.portfolioLinks[0]} ↗
            </a>
          </div>
        </section>
      )}

      {/* TAB 5: LEGACY EMPLOYMENT JOBS */}
      {activeTab === 'legacyJobs' && (
        <section className="panel">
          <h2>Full-Time Vacancy Matches (Phase 1)</h2>
          <p>
            Preserved original employment opportunities tracking and deterministic job fit scoring.
          </p>
          <article style={{ borderTop: '1px solid #334155', padding: '16px 0', marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 4px' }}>Senior Full Stack / MERN Engineer</h3>
                <strong>Fintech Solutions India</strong>
                <p>Bengaluru / Remote · HYBRID · Target: ₹20–26 LPA</p>
                <small>Matched: React, Next.js, TypeScript, Node.js, PostgreSQL</small>
              </div>
              <div>
                <span className="pill pill-green">92/100 match</span>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* WINNABILITY INSPECTOR MODAL */}
      {selectedMatch && (
        <div className="modal-backdrop" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span className="pill pill-green" style={{ marginBottom: 6 }}>
                  Score: {selectedMatch.score}/100 Winnability
                </span>
                <h2 style={{ fontSize: 20, margin: '4px 0' }}>{selectedMatch.gig.title}</h2>
                <small style={{ color: '#94a3b8' }}>
                  {selectedMatch.gig.clientName} · {selectedMatch.gig.clientLocation || 'Remote'}
                </small>
              </div>
              <button className="secondary" onClick={() => setSelectedMatch(null)}>
                ✕ Close
              </button>
            </div>

            {/* Score Breakdown Bars */}
            <div style={{ background: '#131c2e', padding: 16, borderRadius: 10, margin: '16px 0' }}>
              <h3 style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 12 }}>
                EXPLAINABLE 5-DIMENSION FIT BREAKDOWN
              </h3>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Technical Skills Match ({selectedMatch.breakdown.skillsMatch}/35 pts)</span>
                  <span>{Math.round((selectedMatch.breakdown.skillsMatch / 35) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.skillsMatch / 35) * 100}%` }} />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Budget & Rate Alignment ({selectedMatch.breakdown.budgetFit}/25 pts)</span>
                  <span>{Math.round((selectedMatch.breakdown.budgetFit / 25) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.budgetFit / 25) * 100}%` }} />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Client Trust & Payment History ({selectedMatch.breakdown.clientTrust}/20 pts)</span>
                  <span>{Math.round((selectedMatch.breakdown.clientTrust / 20) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.clientTrust / 20) * 100}%` }} />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Scope & Duration Feasibility ({selectedMatch.breakdown.scopeFit}/10 pts)</span>
                  <span>{Math.round((selectedMatch.breakdown.scopeFit / 10) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.scopeFit / 10) * 100}%` }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Role Winnability & Specialization ({selectedMatch.breakdown.winnability}/10 pts)</span>
                  <span>{Math.round((selectedMatch.breakdown.winnability / 10) * 100)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(selectedMatch.breakdown.winnability / 10) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Strengths & Risks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '16px 0' }}>
              <div style={{ background: '#14271d', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 10, padding: 14 }}>
                <h4 style={{ margin: '0 0 8px', color: '#4ade80', fontSize: 13 }}>✓ KEY STRENGTHS</h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#cbd5e1' }}>
                  {selectedMatch.keyStrengths.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{s}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#291717', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, padding: 14 }}>
                <h4 style={{ margin: '0 0 8px', color: '#f87171', fontSize: 13 }}>⚠️ RISK FACTORS</h4>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#cbd5e1' }}>
                  {selectedMatch.riskFactors.length > 0 ? (
                    selectedMatch.riskFactors.map((r, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{r}</li>
                    ))
                  ) : (
                    <li>No significant risks identified. Clean contract match.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Project Full Description */}
            <div style={{ margin: '16px 0' }}>
              <h4 style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 6px' }}>FULL PROJECT BRIEF</h4>
              <p style={{ background: '#0f172a', padding: 14, borderRadius: 8, fontSize: 13, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                {selectedMatch.gig.description}
              </p>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                className="secondary"
                onClick={() => setSelectedMatch(null)}
              >
                Close
              </button>
              <button
                disabled={isGenerating}
                onClick={() => handleGenerateProposal(selectedMatch.gig.id)}
              >
                {isGenerating ? 'Drafting Proposal...' : '✨ Draft Tailored Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROPOSAL EDITOR & REVIEW MODAL */}
      {activeProposal && (
        <div className="modal-backdrop" onClick={() => setActiveProposal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span className="pill pill-amber" style={{ marginBottom: 6 }}>
                  Status: {activeProposal.status.replace(/_/g, ' ')}
                </span>
                <h2 style={{ fontSize: 20, margin: '4px 0' }}>
                  Review & Refine Proposal
                </h2>
                <small style={{ color: '#94a3b8' }}>
                  Provider: {activeProposal.providerUsed} · Human Review Required
                </small>
              </div>
              <button className="secondary" onClick={() => setActiveProposal(null)}>
                ✕ Close
              </button>
            </div>

            <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 12, color: '#fef08a' }}>
              🛡️ <strong>Safety Guarantee:</strong> This proposal will never be dispatched automatically. You can edit the text below, approve it to clear it for submission, and copy it directly to the client platform.
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#cbd5e1' }}>
                <label style={{ fontWeight: 600 }}>Proposal Cover Letter</label>
                <span>{editableCoverLetter.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea
                value={editableCoverLetter}
                onChange={(e) => setEditableCoverLetter(e.target.value)}
                style={{ minHeight: 240, width: '100%', fontSize: 13 }}
              />
            </div>

            {/* Milestones */}
            {activeProposal.milestones && activeProposal.milestones.length > 0 && (
              <div style={{ background: '#131c2e', padding: 14, borderRadius: 10, marginBottom: 14 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#cbd5e1' }}>
                  MILESTONE DELIVERY SCHEDULE
                </h4>
                {activeProposal.milestones.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx < activeProposal.milestones.length - 1 ? '1px solid #24324d' : 'none', fontSize: 12 }}>
                    <div>
                      <strong style={{ color: '#f8fafc' }}>{m.title}</strong>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{m.description}</p>
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap', marginLeft: 12 }}>
                      <strong style={{ color: '#38bdf8' }}>${m.amount}</strong>
                      <div style={{ color: '#64748b', fontSize: 11 }}>{m.durationDays} days</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18, flexWrap: 'wrap' }}>
              <button
                className="outline"
                onClick={() => {
                  navigator.clipboard.writeText(editableCoverLetter);
                  showToast('Proposal copied to clipboard!');
                }}
              >
                Copy Text
              </button>

              <button
                className="secondary"
                onClick={() => handleUpdateProposalStatus(activeProposal.id, 'DRAFT')}
              >
                Save Edits as Draft
              </button>

              <button
                className="success"
                onClick={() => handleUpdateProposalStatus(activeProposal.id, 'APPROVED')}
              >
                ✓ Approve Proposal (Clear for Submission)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
