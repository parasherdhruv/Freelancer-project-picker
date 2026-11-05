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
  coverLetter: string;
  proposedRate: number;
  pricingType: 'HOURLY' | 'FIXED_PRICE' | 'RETAINER';
  estimatedTimeline: string;
  milestones: Array<{
    title: string;
    description: string;
    durationDays: number;
    amount: number;
  }>;
  providerUsed: 'deterministic' | 'gemini';
  notes?: string;
  approvedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_GIGS: GigItem[] = [
  {
    id: 'gig_mern_saas',
    title: 'Full Stack MERN Engineer - SaaS Dashboard & Billing Integration',
    clientName: 'SaaSFlow Technologies Inc.',
    clientLocation: 'Remote (US / Worldwide)',
    clientRating: 4.95,
    clientReviewCount: 24,
    clientTotalSpent: 48000,
    paymentVerified: true,
    pricingType: 'FIXED_PRICE',
    budgetMin: 2200,
    budgetMax: 3000,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    estimatedDuration: '3-4 weeks',
    description: 'We need an experienced Senior Full Stack Engineer (MERN / Next.js) to revamp our customer analytics dashboard, migrate REST endpoints to NestJS, and integrate Stripe subscription webhooks with PostgreSQL data models.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'NestJS', 'PostgreSQL'],
    source: 'RSS',
    sourceUrl: 'https://contra.com/opportunity/saasflow-mern-billing-migration',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'gig_react_nestjs_realtime',
    title: 'React & NestJS Contract - Real-Time Collaboration Workspace',
    clientName: 'Kite Digital Labs',
    clientLocation: 'Bengaluru / Remote India',
    clientRating: 5.0,
    clientReviewCount: 16,
    clientTotalSpent: 32000,
    paymentVerified: true,
    pricingType: 'HOURLY',
    hourlyRateMin: 45,
    hourlyRateMax: 55,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    estimatedDuration: '2 months (20-30 hrs/week)',
    description: 'Seeking a seasoned TypeScript engineer with 4+ years in React and NestJS to build real-time project management workspaces. Must have strong MongoDB and GraphQL experience for our activity stream feeds.',
    skills: ['React', 'NestJS', 'TypeScript', 'MongoDB', 'GraphQL', 'Node.js'],
    source: 'API',
    sourceUrl: 'https://weworkremotely.com/remote-jobs/kite-digital-react-nestjs-contract',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
  },
  {
    id: 'gig_graphql_ecommerce',
    title: 'GraphQL API & Next.js Headless E-Commerce Refactor',
    clientName: 'Nordic Retail Group',
    clientLocation: 'Remote Worldwide',
    clientRating: 4.88,
    clientReviewCount: 31,
    clientTotalSpent: 65000,
    paymentVerified: true,
    pricingType: 'FIXED_PRICE',
    budgetMin: 1800,
    budgetMax: 2500,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'SMALL',
    estimatedDuration: '2 weeks',
    description: 'Looking for a skilled frontend and API developer to connect our Next.js App Router store to our Apollo GraphQL backend, implement static generation with ISR, and optimize Core Web Vitals.',
    skills: ['Next.js', 'React', 'GraphQL', 'TypeScript', 'Tailwind CSS'],
    source: 'RSS',
    sourceUrl: 'https://remoteok.com/remote-jobs/nordic-retail-nextjs-graphql-storefront',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'gig_nodejs_prisma_consultant',
    title: 'Senior Node.js / Express Backend Consultant - High-Throughput Auth & Prisma',
    clientName: 'Apex Health Systems',
    clientLocation: 'Remote (India/US)',
    clientRating: 4.9,
    clientReviewCount: 9,
    clientTotalSpent: 18000,
    paymentVerified: true,
    pricingType: 'HOURLY',
    hourlyRateMin: 45,
    hourlyRateMax: 60,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    estimatedDuration: '1 month',
    description: 'Consultant required to review our Express/PostgreSQL backend, optimize complex Prisma queries, refactor schema indexes, and implement rate limiting and JWT session rotation.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'Docker'],
    source: 'API',
    sourceUrl: 'https://remoteok.com/remote-jobs/apex-health-nodejs-consultant',
    status: 'DISCOVERED',
    postedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
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

export function addGig(gig: GigItem): GigItem {
  const current = getGigs();
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
      updateGigStatus(item.gigId, 'PROPOSAL_SUBMITTED');
    }
  }
  return item || null;
}

export function scoreGig(freelancer: VerifiedFreelancerProfile, gig: GigItem) {
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

  if (gig.pricingType === 'HOURLY') {
    const rate = gig.hourlyRateMax ?? gig.hourlyRateMin ?? 0;
    if (rate >= freelancer.targetHourlyRateUsd) {
      budgetFit = 25;
      keyStrengths.push(`Client rate ($${rate}/hr) meets your $${freelancer.targetHourlyRateUsd}/hr target.`);
    } else if (rate >= freelancer.targetHourlyRateUsd * 0.8) {
      budgetFit = 19;
      keyStrengths.push(`Client rate ($${rate}/hr) is competitive.`);
    } else {
      budgetFit = 10;
      riskFactors.push(`Hourly rate ($${rate}/hr) is below target.`);
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

export function generateDeterministicProposal(freelancer: VerifiedFreelancerProfile, gig: GigItem): ProposalItem {
  const norm = (s: string) => s.toLowerCase().trim();
  const matchedSkills = freelancer.skills.filter((sk) =>
    gig.skills.some((gs) => norm(gs).includes(norm(sk)) || norm(sk).includes(norm(gs))),
  );
  const primaryTech = matchedSkills.length > 0 ? matchedSkills.slice(0, 4).join(', ') : 'React, Next.js, TypeScript, and Node.js';

  let proposedRate = freelancer.targetHourlyRateUsd;
  let estimatedTimeline = '2 to 3 weeks';
  let milestones: any[] = [];

  if (gig.pricingType === 'HOURLY') {
    if (gig.hourlyRateMax && gig.hourlyRateMax >= freelancer.targetHourlyRateUsd) {
      proposedRate = Math.min(gig.hourlyRateMax, freelancer.targetHourlyRateUsd);
    } else if (gig.hourlyRateMin) {
      proposedRate = Math.max(gig.hourlyRateMin, freelancer.targetHourlyRateUsd);
    }
    estimatedTimeline = gig.estimatedDuration || '20-30 hours per week';
    milestones = [
      {
        title: 'Phase 1: Architecture, Core Setup & Type-Safe Models',
        description: `Set up the repository, configure ${primaryTech}, and implement foundational schemas and views.`,
        durationDays: 7,
        amount: Math.round(proposedRate * 25),
      },
      {
        title: 'Phase 2: Core Feature Implementation & API Integration',
        description: 'Implement full application logic, integrate endpoints/database layers, and handle edge cases.',
        durationDays: 7,
        amount: Math.round(proposedRate * 25),
      },
      {
        title: 'Phase 3: QA, Automated Tests & Deployment',
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

  const coverLetter = `Hi ${gig.clientName !== 'Client' ? gig.clientName : 'there'},

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

  const now = new Date().toISOString();
  return {
    id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    gigId: gig.id,
    freelancerId: freelancer.id,
    status: 'READY_FOR_REVIEW',
    coverLetter,
    proposedRate,
    pricingType: gig.pricingType,
    estimatedTimeline,
    milestones,
    providerUsed: 'deterministic',
    notes: 'Generated via Deterministic Fallback Provider using verified candidate credentials only.',
    createdAt: now,
    updatedAt: now,
  };
}
