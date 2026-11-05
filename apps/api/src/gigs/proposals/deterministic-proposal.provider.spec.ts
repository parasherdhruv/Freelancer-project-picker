import { DeterministicProposalProvider } from './deterministic-proposal.provider';
import { VERIFIED_FREELANCER_PROFILE } from '../../freelancer/freelancer.types';
import { GigItem } from '../gigs.types';

describe('DeterministicProposalProvider', () => {
  let provider: DeterministicProposalProvider;

  beforeEach(() => {
    provider = new DeterministicProposalProvider();
  });

  const gig: GigItem = {
    id: 'gig_test_1',
    title: 'Full Stack Next.js & NestJS Developer',
    clientName: 'Acme Corp',
    clientRating: 4.9,
    clientReviewCount: 15,
    clientTotalSpent: 20000,
    paymentVerified: true,
    pricingType: 'FIXED_PRICE',
    budgetMin: 2000,
    budgetMax: 2000,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    description: 'Build a customer portal using Next.js and NestJS with PostgreSQL database.',
    skills: ['Next.js', 'NestJS', 'PostgreSQL', 'TypeScript'],
    source: 'API',
    sourceUrl: 'https://example.com/gig-test',
    status: 'DISCOVERED',
    postedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('generates proposal strictly adhering to verified profile credentials', async () => {
    const result = await provider.generateProposal({
      freelancer: VERIFIED_FREELANCER_PROFILE,
      gig,
    });

    expect(result.providerUsed).toBe('deterministic');
    expect(result.coverLetter).toContain('4 years of verified hands-on experience');
    expect(result.coverLetter).toContain('MERN stack');
    expect(result.coverLetter).toContain('Immediate availability');
    expect(result.coverLetter).toContain('Dhruv Parasher');
    expect(result.coverLetter).toContain('https://github.com/parasherdhruv');

    // Milestones check
    expect(result.milestones.length).toBe(3);
    const totalMilestonesAmount = result.milestones.reduce((acc, m) => acc + m.amount, 0);
    expect(totalMilestonesAmount).toBe(2000);
  });
});
