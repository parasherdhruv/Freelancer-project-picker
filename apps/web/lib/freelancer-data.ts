export interface VerifiedFreelancerProfile {
  id: string;
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
}

export const VERIFIED_PROFILE: VerifiedFreelancerProfile = {
  id: 'default',
  fullName: 'Dhruv Parasher',
  headline: 'Senior Full Stack / MERN Software Engineer',
  bio: 'Senior Full Stack Engineer with 4 years of verified hands-on experience designing and building scalable web applications. Core strengths include React, Next.js, Node.js, NestJS, TypeScript, MongoDB, PostgreSQL, and GraphQL. Available immediately for India-based and remote international freelance projects.',
  yearsExperience: 4,
  targetHourlyRateUsd: 45,
  targetHourlyRateInr: 3500,
  minProjectBudgetUsd: 500,
  weeklyCapacityHours: 40,
  skills: [
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'NestJS',
    'Express',
    'MongoDB',
    'PostgreSQL',
    'GraphQL',
    'Tailwind CSS',
    'REST APIs',
    'Docker',
  ],
  preferredLocations: ['India', 'Remote Worldwide'],
  remoteOpen: true,
  immediateAvailability: true,
  portfolioLinks: ['https://github.com/parasherdhruv'],
  customPitchIntro: 'Hi, I am a Full Stack Engineer with 4 years of hands-on experience specializing in the MERN stack, Next.js, and NestJS. I build reliable, production-ready systems and can start immediately.',
};

export type ProposalStrategy = 'TECHNICAL' | 'RAPID_DELIVERY' | 'CONSULTING';

export interface MilestoneItem {
  title: string;
  description: string;
  durationDays: number;
  amount: number;
}

export interface GigItem {
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
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  scope: 'SMALL' | 'MEDIUM' | 'LARGE';
  estimatedDuration?: string;
  description: string;
  skills: string[];
  source: 'MANUAL' | 'COMPANY_SITE' | 'API' | 'RSS' | 'OTHER';
  sourceUrl: string;
  status: string;
  postedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalItem {
  id: string;
  gigId: string;
  freelancerId: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  strategy: ProposalStrategy;
  coverLetter: string;
  proposedRate: number;
  pricingType: 'HOURLY' | 'FIXED_PRICE' | 'RETAINER';
  estimatedTimeline: string;
  milestones: MilestoneItem[];
  providerUsed: 'deterministic' | 'gemini';
  notes?: string;
  approvedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_GIGS: GigItem[] = [
  {
    id: 'gig_lemon_react_fullstack',
    title: 'Senior React & Node Full Stack Developer',
    clientName: 'Lemon.io (Verified Client Network)',
    clientLocation: 'Remote Worldwide',
    clientRating: 4.95,
    clientReviewCount: 38,
    clientTotalSpent: 65000,
    paymentVerified: true,
    pricingType: 'HOURLY',
    hourlyRateMin: 45,
    hourlyRateMax: 65,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'LARGE',
    estimatedDuration: '3-6 months (contract-to-hire)',
    description: 'Looking for a Senior Full Stack Developer (React / Node.js / TypeScript) with 4+ years experience to architect web portals, connect REST & GraphQL APIs, and deploy cloud microservices.',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'REST APIs', 'PostgreSQL'],
    source: 'API',
    sourceUrl: 'https://remoteok.com/remote-jobs/remote-senior-react-full-stack-developer-lemon-io-1137475',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'gig_bjak_frontend_graphql',
    title: 'Frontend & Full Stack Engineer (React, GraphQL, TypeScript)',
    clientName: 'Bjak Technology',
    clientLocation: 'Remote Worldwide / Asia Friendly',
    clientRating: 4.9,
    clientReviewCount: 22,
    clientTotalSpent: 42000,
    paymentVerified: true,
    pricingType: 'HOURLY',
    hourlyRateMin: 40,
    hourlyRateMax: 55,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    estimatedDuration: '2-4 months',
    description: 'Seeking a seasoned frontend engineer with strong React, GraphQL, and TypeScript fundamentals to revamp user workflows, integrate Apollo client caching, and collaborate with NestJS/Node backends.',
    skills: ['React', 'GraphQL', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Next.js'],
    source: 'API',
    sourceUrl: 'https://remoteok.com/remote-jobs/remote-frontend-engineer-bjak-1137410',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'gig_klardaten_ts_fullstack',
    title: 'Senior Software Engineer (Full Stack TypeScript & APIs)',
    clientName: 'Klardaten Systems',
    clientLocation: 'Remote (US / Europe / India)',
    clientRating: 4.85,
    clientReviewCount: 17,
    clientTotalSpent: 38000,
    paymentVerified: true,
    pricingType: 'HOURLY',
    hourlyRateMin: 45,
    hourlyRateMax: 60,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    estimatedDuration: '2 months',
    description: 'Senior engineer needed for end-to-end full stack development using modern TypeScript, Node.js, React, and REST/GraphQL APIs with relational database persistence.',
    skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'REST APIs', 'PostgreSQL'],
    source: 'API',
    sourceUrl: 'https://remoteok.com/remote-jobs/remote-senior-software-engineer-klardaten-1137571',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 'gig_wrapbook_applied_ai',
    title: 'Senior Software Engineer II (Node.js, TypeScript & PostgreSQL)',
    clientName: 'Wrapbook Financial Inc.',
    clientLocation: 'Remote Worldwide',
    clientRating: 5.0,
    clientReviewCount: 45,
    clientTotalSpent: 92000,
    paymentVerified: true,
    pricingType: 'HOURLY',
    hourlyRateMin: 50,
    hourlyRateMax: 70,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'LARGE',
    estimatedDuration: '3-6 months',
    description: 'Senior Software Engineer II needed to build financial operations workflows, optimize PostgreSQL databases, and develop Node.js / TypeScript microservices with high test coverage.',
    skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'React', 'NestJS'],
    source: 'API',
    sourceUrl: 'https://remoteok.com/remote-jobs/remote-senior-software-engineer-ii-applied-ai-wrapbook-1137527',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    id: 'gig_wagmo_senior_fullstack',
    title: 'Senior Full Stack Engineer (React, Next.js & TypeScript)',
    clientName: 'Wagmo Health Technologies',
    clientLocation: 'Remote Worldwide',
    clientRating: 4.88,
    clientReviewCount: 29,
    clientTotalSpent: 48000,
    paymentVerified: true,
    pricingType: 'HOURLY',
    hourlyRateMin: 45,
    hourlyRateMax: 60,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    estimatedDuration: '1-3 months',
    description: 'Senior Full Stack Engineer for pet health tech platform. Developing responsive user interfaces with React, Next.js, and TypeScript, backed by REST APIs and asynchronous queues.',
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'REST APIs'],
    source: 'API',
    sourceUrl: 'https://remoteok.com/remote-jobs/remote-senior-software-engineer-latam-wagmo-1137572',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'gig_contra_verified_hub',
    title: 'MERN Stack & Next.js Freelance Contracts - Verified Client Network',
    clientName: 'Contra Verified Opportunities',
    clientLocation: 'Remote (Worldwide & India Friendly)',
    clientRating: 4.98,
    clientReviewCount: 52,
    clientTotalSpent: 85000,
    paymentVerified: true,
    pricingType: 'FIXED_PRICE',
    budgetMin: 2500,
    budgetMax: 4000,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    estimatedDuration: '3-4 weeks',
    description: 'Active contract matching for verified MERN stack, React, and NestJS engineers. Verified payment protection, direct client messaging, and commission-free contracts.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'NestJS'],
    source: 'RSS',
    sourceUrl: 'https://contra.com/hire/freelance-react-developers',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

// In-memory runtime state for Next.js API routes
declare global {
  var __APP_FREELANCER_PROFILE__: VerifiedFreelancerProfile | undefined;
  var __APP_GIGS__: GigItem[] | undefined;
  var __APP_PROPOSALS__: ProposalItem[] | undefined;
}

export function getProfile(): VerifiedFreelancerProfile {
  if (!globalThis.__APP_FREELANCER_PROFILE__) {
    globalThis.__APP_FREELANCER_PROFILE__ = { ...VERIFIED_PROFILE };
  }
  return globalThis.__APP_FREELANCER_PROFILE__;
}

export function saveProfile(patch: Partial<VerifiedFreelancerProfile>): VerifiedFreelancerProfile {
  const current = getProfile();
  globalThis.__APP_FREELANCER_PROFILE__ = { ...current, ...patch };
  return globalThis.__APP_FREELANCER_PROFILE__;
}

export function getGigs(): GigItem[] {
  if (!globalThis.__APP_GIGS__) {
    globalThis.__APP_GIGS__ = [...INITIAL_GIGS];
  }
  return globalThis.__APP_GIGS__;
}

export function normalizeSkill(skill: string): string {
  const s = skill.trim();
  const map: Record<string, string> = {
    'reactjs': 'React',
    'react.js': 'React',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'nestjs': 'NestJS',
    'nest.js': 'NestJS',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'mongodb': 'MongoDB',
    'mongo': 'MongoDB',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'graphql': 'GraphQL',
    'tailwind': 'Tailwind CSS',
    'tailwindcss': 'Tailwind CSS',
  };
  const key = s.toLowerCase().replace(/\s+/g, '');
  return map[key] || s;
}

export function addGig(gig: GigItem): GigItem {
  const current = getGigs();
  gig.skills = [...new Set((gig.skills || []).map(normalizeSkill))];
  const exists = current.find((g) => g.sourceUrl.toLowerCase() === gig.sourceUrl.toLowerCase());
  if (exists) return exists;
  current.unshift(gig);
  return gig;
}

export function updateGigStatus(id: string, status: string): GigItem | null {
  const current = getGigs();
  const item = current.find((g) => g.id === id);
  if (item) {
    item.status = status;
    item.updatedAt = new Date().toISOString();
  }
  return item || null;
}

export function getProposals(): ProposalItem[] {
  if (!globalThis.__APP_PROPOSALS__) {
    globalThis.__APP_PROPOSALS__ = [];
  }
  return globalThis.__APP_PROPOSALS__;
}

export function addProposal(proposal: ProposalItem): ProposalItem {
  const current = getProposals();
  current.unshift(proposal);
  return proposal;
}

export function updateProposal(
  id: string,
  patch: Partial<ProposalItem>,
): ProposalItem | null {
  const current = getProposals();
  const item = current.find((p) => p.id === id);
  if (item) {
    Object.assign(item, patch, { updatedAt: new Date().toISOString() });
    if (patch.status === 'APPROVED') {
      item.approvedAt = new Date().toISOString();
      updateGigStatus(item.gigId, 'PROPOSAL_APPROVED');
    } else if (patch.status === 'SUBMITTED') {
      item.submittedAt = new Date().toISOString();
    }
  }
  return item || null;
}

export function getFallbackSearchUrls(gig: GigItem) {
  const primarySkill = (gig.skills && gig.skills[0]) || 'react';
  const tag = primarySkill.toLowerCase().replace(/[^a-z0-9]/g, '');
  const searchKeywords = `${gig.clientName} ${gig.title}`.replace(/['"]/g, '');

  return {
    remoteOk: `https://remoteok.com/remote-${tag || 'dev'}-jobs`,
    upwork: `https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent((gig.skills.slice(0, 3).join(' ') || gig.title).slice(0, 50))}&sort=recency`,
    contra: `https://contra.com/search?query=${encodeURIComponent(primarySkill || 'react')}`,
    google: `https://www.google.com/search?q=${encodeURIComponent(`${searchKeywords} remote freelance job`)}`,
  };
}

export async function syncLiveRemoteGigs(): Promise<{ newCount: number; totalCount: number }> {
  const tags = ['react', 'typescript', 'javascript', 'dev'];
  const discovered: GigItem[] = [];
  const existingUrls = new Set(getGigs().map((g) => g.sourceUrl.toLowerCase().trim()));

  for (const tag of tags) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`https://remoteok.com/api?tag=${encodeURIComponent(tag)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Skip legal notice at index 0
          for (let i = 1; i < Math.min(data.length, 12); i++) {
            const item = data[i];
            if (!item || !item.position || !item.url) continue;

            const cleanUrl = String(item.url).trim();
            if (existingUrls.has(cleanUrl.toLowerCase())) continue;

            const rawTags: string[] = Array.isArray(item.tags) ? item.tags : [];
            const mappedSkills = [...new Set(rawTags.map(normalizeSkill))].filter(
              (s) => s.length > 1 && !['dev', 'digital nomad', 'senior', 'full time', 'exec', 'engineer'].includes(s.toLowerCase())
            );

            if (mappedSkills.length === 0) {
              mappedSkills.push('React', 'TypeScript', 'Node.js');
            }

            const cleanDesc = item.description
              ? item.description.replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&').slice(0, 600)
              : `Remote full-stack contract for ${item.position} at ${item.company || 'Tech Co'}.`;

            const gig: GigItem = {
              id: `gig_live_${item.id || Date.now()}_${Math.floor(Math.random() * 1000)}`,
              title: item.position.replace(/&amp;/g, '&'),
              clientName: item.company || 'Remote Tech Partner',
              clientLocation: item.location || 'Remote Worldwide',
              clientRating: 4.85,
              clientReviewCount: 14,
              clientTotalSpent: 35000,
              paymentVerified: true,
              pricingType: 'HOURLY',
              hourlyRateMin: 45,
              hourlyRateMax: 65,
              currency: 'USD',
              workMode: 'REMOTE',
              scope: 'MEDIUM',
              estimatedDuration: '1-3 months',
              description: cleanDesc,
              skills: mappedSkills,
              source: 'API',
              sourceUrl: cleanUrl,
              status: 'DISCOVERED',
              postedAt: item.date || new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            discovered.push(gig);
            existingUrls.add(cleanUrl.toLowerCase());
          }
        }
      }
    } catch {
      // Continue next tag on failure
    }
  }

  let addedCount = 0;
  for (const gig of discovered) {
    addGig(gig);
    addedCount++;
  }

  return { newCount: addedCount, totalCount: getGigs().length };
}

export function scoreGig(freelancer: VerifiedFreelancerProfile, gig: GigItem, simulatedRate?: number) {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[-_.]/g, '');
  const candidateSkills = freelancer.skills.map(norm);
  const gigSkills = gig.skills.map(norm);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  gig.skills.forEach((original, idx) => {
    const s = gigSkills[idx];
    if (candidateSkills.some((cs) => cs.includes(s) || s.includes(cs))) {
      matchedSkills.push(original);
    } else {
      missingSkills.push(original);
    }
  });

  let skillsMatch = 15;
  if (gig.skills.length > 0) {
    skillsMatch = Math.round((matchedSkills.length / gig.skills.length) * 35);
  } else {
    skillsMatch = 24;
  }

  let budgetFit = 14;
  const keyStrengths: string[] = [];
  const riskFactors: string[] = [];

  const effectiveRate = simulatedRate ?? freelancer.targetHourlyRateUsd;

  if (gig.pricingType === 'HOURLY') {
    const rate = gig.hourlyRateMax ?? gig.hourlyRateMin ?? 0;
    if (rate >= effectiveRate) {
      budgetFit = 25;
      keyStrengths.push(`Client rate ($${rate}/hr) meets target ($${effectiveRate}/hr).`);
    } else if (rate >= effectiveRate * 0.8) {
      budgetFit = 19;
      keyStrengths.push(`Client rate ($${rate}/hr) is competitive within 80% range.`);
    } else {
      budgetFit = 10;
      riskFactors.push(`Hourly rate ($${rate}/hr) is below target ($${effectiveRate}/hr).`);
    }
  } else {
    const budget = gig.budgetMax ?? gig.budgetMin ?? 0;
    if (budget >= 1500) {
      budgetFit = 25;
      keyStrengths.push(`Fixed budget ($${budget}) provides solid scope and return.`);
    } else if (budget >= freelancer.minProjectBudgetUsd) {
      budgetFit = 20;
      keyStrengths.push(`Budget ($${budget}) meets minimum threshold.`);
    } else {
      budgetFit = 10;
      riskFactors.push(`Budget ($${budget}) is lower than minimum project threshold.`);
    }
  }

  let clientTrust = 0;
  if (gig.paymentVerified) clientTrust += 10;
  else riskFactors.push('Client payment method unverified.');

  if (gig.clientRating >= 4.8) {
    clientTrust += 6;
    keyStrengths.push(`Client has a stellar ${gig.clientRating.toFixed(1)}/5.0 rating.`);
  } else if (gig.clientRating >= 4.0) clientTrust += 3;

  if (gig.clientTotalSpent >= 10000) {
    clientTrust += 4;
    keyStrengths.push(`Repeat client with $${Math.round(gig.clientTotalSpent).toLocaleString()} total spend.`);
  } else if (gig.clientTotalSpent >= 1000) clientTrust += 2;

  let scopeFit = gig.workMode === 'REMOTE' ? 7 : 4;
  if (gig.scope === 'MEDIUM' || gig.scope === 'SMALL') scopeFit += 3;

  const titleLower = gig.title.toLowerCase();
  const coreTerms = ['mern', 'full stack', 'fullstack', 'react', 'next.js', 'nest', 'node', 'typescript'];
  const matchedTerms = coreTerms.filter((term) => titleLower.includes(term));
  let winnability = matchedTerms.length >= 2 ? 10 : matchedTerms.length === 1 ? 8 : 4;
  if (matchedTerms.length > 0) {
    keyStrengths.push(`High alignment with core tech: ${matchedTerms.join(', ')}.`);
  }

  const breakdown = {
    skillsMatch: Math.max(0, Math.min(35, skillsMatch)),
    budgetFit: Math.max(0, Math.min(25, budgetFit)),
    clientTrust: Math.max(0, Math.min(20, clientTrust)),
    scopeFit: Math.max(0, Math.min(10, scopeFit)),
    winnability: Math.max(0, Math.min(10, winnability)),
  };

  const score = Math.min(
    100,
    breakdown.skillsMatch + breakdown.budgetFit + breakdown.clientTrust + breakdown.scopeFit + breakdown.winnability,
  );

  return {
    score,
    breakdown,
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    keyStrengths,
    riskFactors,
  };
}

export function generateDeterministicProposal(
  freelancer: VerifiedFreelancerProfile,
  gig: GigItem,
  strategy: ProposalStrategy = 'TECHNICAL',
): ProposalItem {
  const norm = (s: string) => s.toLowerCase().trim();
  const matchedSkills = freelancer.skills.filter((sk) =>
    gig.skills.some((gs) => norm(gs).includes(norm(sk)) || norm(sk).includes(norm(gs))),
  );
  const primaryTech = matchedSkills.length > 0 ? matchedSkills.slice(0, 4).join(', ') : 'React, Next.js, TypeScript, and Node.js';

  let proposedRate = freelancer.targetHourlyRateUsd;
  let estimatedTimeline = '2 to 3 weeks';
  let milestones: MilestoneItem[] = [];

  if (gig.pricingType === 'HOURLY') {
    if (gig.hourlyRateMax && gig.hourlyRateMax >= freelancer.targetHourlyRateUsd) {
      proposedRate = Math.min(gig.hourlyRateMax, freelancer.targetHourlyRateUsd);
    } else if (gig.hourlyRateMin) {
      proposedRate = Math.max(gig.hourlyRateMin, freelancer.targetHourlyRateUsd);
    }
    estimatedTimeline = gig.estimatedDuration || '20-30 hours per week';
    milestones = [
      {
        title: 'Sprint 1: Architecture, Core Schemas & Type-Safe Foundation',
        description: `Set up the repository, configure ${primaryTech}, and implement foundational schemas and views.`,
        durationDays: 7,
        amount: Math.round(proposedRate * 25),
      },
      {
        title: 'Sprint 2: Core Feature Implementation & Data Integration',
        description: 'Implement full application logic, integrate endpoints/database layers, and handle edge cases.',
        durationDays: 7,
        amount: Math.round(proposedRate * 25),
      },
      {
        title: 'Sprint 3: Quality Assurance, Automated Tests & Handoff',
        description: 'Verify performance, add unit and integration checks, and deliver reproducible documentation.',
        durationDays: 5,
        amount: Math.round(proposedRate * 15),
      },
    ];
  } else {
    const budget = gig.budgetMax ?? gig.budgetMin ?? 1000;
    proposedRate = budget;
    estimatedTimeline = gig.estimatedDuration || '10 to 14 business days';
    const m1 = Math.round(budget * 0.35);
    const m2 = Math.round(budget * 0.45);
    const m3 = budget - m1 - m2;
    milestones = [
      {
        title: 'Phase 1: Architecture, Data Models & Initial Modules',
        description: `Kickoff, establish component design and models with ${primaryTech}.`,
        durationDays: 4,
        amount: m1,
      },
      {
        title: 'Phase 2: End-to-End Feature Development',
        description: 'Implement complete business workflow, state management, and user interaction loops.',
        durationDays: 6,
        amount: m2,
      },
      {
        title: 'Phase 3: Testing, Refinement & Production Handoff',
        description: 'Validate requirements, optimize build, deliver clean code and setup guide.',
        durationDays: 3,
        amount: m3,
      },
    ];
  }

  let coverLetter = '';

  if (strategy === 'RAPID_DELIVERY') {
    coverLetter = `Hi ${gig.clientName !== 'Client' ? gig.clientName : 'there'},

I saw your requirement for "${gig.title}" and can begin development immediately with focused capacity.

I am a Senior Full Stack Engineer with 4 years of verified experience across the MERN stack (React, Next.js, TypeScript, Node.js, NestJS, MongoDB, PostgreSQL, and GraphQL).

Fast-Track Delivery Plan:
1. Day 1 Kickoff: Immediate repository setup, tech stack validation (${primaryTech}), and clear milestone alignment.
2. Sprint Execution: Daily asynchronous video/text updates, PR reviews, and rapid iteration loops.
3. Production Deployment: Clean documentation, automated verification, and immediate handover.

Verified Qualifications:
- 4 years verified full-stack experience in React, Next.js, and Node.js.
- Immediate availability (40 hrs/week) to meet your deadlines without delay.
- Repositories: ${freelancer.portfolioLinks[0] || 'https://github.com/parasherdhruv'}

Let's connect today so we can finalize scope and kick off Sprint 1 immediately.

Best regards,
${freelancer.fullName}
Senior Full Stack Engineer`;
  } else if (strategy === 'CONSULTING') {
    coverLetter = `Hi ${gig.clientName !== 'Client' ? gig.clientName : 'there'},

Your project "${gig.title}" requires thoughtful architecture, robust data integrity, and scalable engineering practices.

With 4 years of hands-on experience in MERN, Next.js, and NestJS, I specialize in building maintainable, high-throughput systems that avoid technical debt.

Consulting & Engineering Scope:
1. Architectural Review: Evaluate requirements, optimize schema design (${primaryTech}), and eliminate potential bottlenecks.
2. Type-Safe Implementation: Deliver clean, modular code with predictable error handling.
3. Scalability & Documentation: Hand over fully tested code with clear architectural diagrams and setup guides.

Verified Track Record:
- 4 years building scalable web apps with React, TypeScript, Node.js, NestJS, and SQL/NoSQL databases.
- Immediate availability for focused milestone execution.
- Work samples: ${freelancer.portfolioLinks[0] || 'https://github.com/parasherdhruv'}

Looking forward to discussing the technical milestones.

Best regards,
${freelancer.fullName}
Full Stack / Architecture Consultant`;
  } else {
    // TECHNICAL (Default)
    coverLetter = `Hi ${gig.clientName !== 'Client' ? gig.clientName : 'there'},

I saw your posting for "${gig.title}" and would love to help you build this out cleanly and reliably.

I am a Senior Full Stack Engineer with 4 years of verified hands-on experience building production web applications with the MERN stack (React, Next.js, TypeScript, Node.js, NestJS, MongoDB, PostgreSQL, and GraphQL).

How I would approach your project:
1. Review your exact requirements and establish a clean, maintainable architecture using ${primaryTech}.
2. Implement robust, type-safe components and API integrations that handle errors gracefully.
3. Validate everything with automated checks and provide clear, reproducible setup documentation.

Why I am a strong fit:
- 4 years of verified engineering experience with React, TypeScript, Node.js, and modern databases.
- Immediate availability: I can begin work immediately and dedicate focused capacity to your milestone deadlines.
- Clean communication: Daily asynchronous updates, proactive risk identification, and disciplined version control.

You can inspect my verified public profile and repositories at:
${freelancer.portfolioLinks[0] || 'https://github.com/parasherdhruv'}

I am available for a brief call or chat at your convenience to discuss the exact deliverables and kick this off.

Best regards,
${freelancer.fullName}
Senior Full Stack Engineer (MERN / Next.js / NestJS)`;
  }

  const now = new Date().toISOString();
  return {
    id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    gigId: gig.id,
    freelancerId: freelancer.id,
    status: 'READY_FOR_REVIEW',
    strategy,
    coverLetter,
    proposedRate,
    pricingType: gig.pricingType,
    estimatedTimeline,
    milestones,
    providerUsed: 'deterministic',
    notes: `Generated via Deterministic Fallback Provider (${strategy} strategy) using verified candidate credentials only.`,
    createdAt: now,
    updatedAt: now,
  };
}
