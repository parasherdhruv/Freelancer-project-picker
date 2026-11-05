import { GigScoringService } from './gig-scoring.service';
import { VERIFIED_FREELANCER_PROFILE } from '../../freelancer/freelancer.types';
import { GigItem } from '../gigs.types';

describe('GigScoringService', () => {
  let service: GigScoringService;

  beforeEach(() => {
    service = new GigScoringService();
  });

  const baseGig: GigItem = {
    id: 'test_gig_1',
    title: 'Senior MERN & Next.js Full Stack Engineer',
    clientName: 'Enterprise Client',
    clientLocation: 'Remote Worldwide',
    clientRating: 5.0,
    clientReviewCount: 20,
    clientTotalSpent: 50000,
    paymentVerified: true,
    pricingType: 'HOURLY',
    hourlyRateMin: 45,
    hourlyRateMax: 60,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    description: 'We need an expert to build high-scale React and Next.js applications with NestJS and PostgreSQL backend.',
    skills: ['React', 'Next.js', 'NestJS', 'PostgreSQL', 'TypeScript'],
    source: 'API',
    sourceUrl: 'https://example.com/gig-1',
    status: 'DISCOVERED',
    postedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('calculates high winnability score for a matching high-rate contract', () => {
    const result = service.calculateWinnability(VERIFIED_FREELANCER_PROFILE, baseGig);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.breakdown.skillsMatch).toBeGreaterThan(25);
    expect(result.breakdown.budgetFit).toBe(25); // Meets target hourly rate
    expect(result.breakdown.clientTrust).toBe(20); // Verified, 5.0 rating, >10k spent
    expect(result.matchedSkills.length).toBeGreaterThanOrEqual(4);
    expect(result.keyStrengths.length).toBeGreaterThan(0);
  });

  it('penalizes unverified client payment method and low rating', () => {
    const lowTrustGig: GigItem = {
      ...baseGig,
      clientRating: 3.2,
      clientTotalSpent: 0,
      paymentVerified: false,
    };

    const result = service.calculateWinnability(VERIFIED_FREELANCER_PROFILE, lowTrustGig);
    expect(result.breakdown.clientTrust).toBe(0);
    expect(result.riskFactors).toContain('Client payment method is unverified.');
  });

  it('scores fixed-price gigs appropriately against minimum project budget', () => {
    const fixedGig: GigItem = {
      ...baseGig,
      pricingType: 'FIXED_PRICE',
      budgetMin: 2000,
      budgetMax: 2500,
      hourlyRateMin: undefined,
      hourlyRateMax: undefined,
    };

    const result = service.calculateWinnability(VERIFIED_FREELANCER_PROFILE, fixedGig);
    expect(result.breakdown.budgetFit).toBe(25);
  });
});
