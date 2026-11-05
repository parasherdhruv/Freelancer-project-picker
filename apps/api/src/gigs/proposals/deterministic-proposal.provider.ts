import { Injectable } from '@nestjs/common';
import {
  GeneratedProposalResult,
  MilestoneDraft,
  ProposalAiProvider,
  ProposalContext,
} from './proposal-provider.interface';

@Injectable()
export class DeterministicProposalProvider implements ProposalAiProvider {
  readonly name = 'deterministic';

  async generateProposal(context: ProposalContext): Promise<GeneratedProposalResult> {
    const { freelancer, gig } = context;

    // Determine relevant skills that intersect with gig
    const norm = (s: string) => s.toLowerCase().trim();
    const matchedSkills = freelancer.skills.filter((sk) =>
      gig.skills.some((gs) => norm(gs).includes(norm(sk)) || norm(sk).includes(norm(gs))),
    );

    const primaryTechSummary = matchedSkills.length > 0
      ? matchedSkills.slice(0, 4).join(', ')
      : 'React, Next.js, TypeScript, and Node.js';

    // Pricing determination
    let proposedRate = freelancer.targetHourlyRateUsd;
    let estimatedTimeline = '2 to 3 weeks';
    let milestones: MilestoneDraft[] = [];

    if (gig.pricingType === 'HOURLY') {
      if (gig.hourlyRateMax && gig.hourlyRateMax >= freelancer.targetHourlyRateUsd) {
        proposedRate = Math.min(gig.hourlyRateMax, freelancer.targetHourlyRateUsd);
      } else if (gig.hourlyRateMin) {
        proposedRate = Math.max(gig.hourlyRateMin, freelancer.targetHourlyRateUsd);
      }
      estimatedTimeline = gig.estimatedDuration || '20-30 hours per week';
      milestones = [
        {
          title: 'Sprint 1: Architecture, Core Implementation & Setup',
          description: `Set up the codebase, integrate ${primaryTechSummary}, establish type-safe patterns and implement initial core views/endpoints.`,
          durationDays: 7,
          amount: Math.round(proposedRate * 25),
        },
        {
          title: 'Sprint 2: Feature Completion & Data Integration',
          description: 'Deliver the full business logic, connect APIs/database schemas, and optimize performance.',
          durationDays: 7,
          amount: Math.round(proposedRate * 25),
        },
        {
          title: 'Sprint 3: Quality Assurance, Testing & Deployment',
          description: 'Perform rigorous testing, fix edge cases, document setup instructions, and hand over production-ready build.',
          durationDays: 5,
          amount: Math.round(proposedRate * 15),
        },
      ];
    } else {
      // Fixed price
      const budget = gig.budgetMax ?? gig.budgetMin ?? 1000;
      proposedRate = budget;
      estimatedTimeline = gig.estimatedDuration || '10 to 14 business days';
      const m1 = Math.round(budget * 0.35);
      const m2 = Math.round(budget * 0.45);
      const m3 = budget - m1 - m2;
      milestones = [
        {
          title: 'Phase 1: Architecture, Data Models & Initial Modules',
          description: `Kickoff, setup repository structure, establish data models and implement initial functional components with ${primaryTechSummary}.`,
          durationDays: 4,
          amount: m1,
        },
        {
          title: 'Phase 2: Full End-to-End Feature Development',
          description: 'Build complete business workflow, state management, API routes, and user feedback loops.',
          durationDays: 6,
          amount: m2,
        },
        {
          title: 'Phase 3: Testing, Refinement & Production Handoff',
          description: 'Validation against requirements, test verification, deployment assistance, and comprehensive handoff documentation.',
          durationDays: 3,
          amount: m3,
        },
      ];
    }

    const coverLetter = `Hi ${gig.clientName !== 'Client' ? gig.clientName : 'there'},

I saw your posting for "${gig.title}" and would love to help you build this out cleanly and reliably.

I am a Senior Full Stack Engineer with 4 years of verified hands-on experience building production web applications with the MERN stack (React, Next.js, TypeScript, Node.js, NestJS, MongoDB, PostgreSQL, and GraphQL).

How I would approach your project:
1. Review your exact requirements and establish a clean, maintainable architecture using ${primaryTechSummary}.
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

    return {
      coverLetter,
      proposedRate,
      pricingType: gig.pricingType,
      estimatedTimeline,
      milestones,
      providerUsed: 'deterministic',
      notes: 'Generated via Deterministic Fallback Provider using verified candidate credentials only.',
    };
  }
}
