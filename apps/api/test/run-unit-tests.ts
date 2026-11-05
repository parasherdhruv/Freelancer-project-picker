import { GigScoringService } from '../src/gigs/scoring/gig-scoring.service';
import { DeterministicProposalProvider } from '../src/gigs/proposals/deterministic-proposal.provider';
import { ProjectNormalizer } from '../src/gigs/discovery/project-normalizer';
import { VERIFIED_FREELANCER_PROFILE } from '../src/freelancer/freelancer.types';
import { GigItem } from '../src/gigs/gigs.types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log('--- Running Freelancer Agent Foundation Unit Tests ---\n');

  // Test 1: GigScoringService
  console.log('1. Testing GigScoringService:');
  const scoringService = new GigScoringService();
  const sampleGig: GigItem = {
    id: 'gig_1',
    title: 'Senior MERN & Next.js Full Stack Engineer',
    clientName: 'SaaS Corp',
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
    description: 'We need an expert to build React and Next.js applications with NestJS and PostgreSQL backend.',
    skills: ['React', 'Next.js', 'NestJS', 'PostgreSQL', 'TypeScript'],
    source: 'API',
    sourceUrl: 'https://example.com/gig-1',
    status: 'DISCOVERED',
    postedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const eval1 = scoringService.calculateWinnability(VERIFIED_FREELANCER_PROFILE, sampleGig);
  assert(eval1.score >= 80, `High score for matching gig (got ${eval1.score})`);
  assert(eval1.breakdown.budgetFit === 25, `Full budget fit points for rate >= $45 (got ${eval1.breakdown.budgetFit})`);
  assert(eval1.breakdown.clientTrust === 20, `Full trust points for verified 5.0 client (got ${eval1.breakdown.clientTrust})`);
  assert(eval1.matchedSkills.length >= 4, `Matched core stack skills (got ${eval1.matchedSkills.join(', ')})`);

  // Unverified payment check with no spend history
  const unverifiedGig = { ...sampleGig, paymentVerified: false, clientRating: 3.2, clientTotalSpent: 0 };
  const eval2 = scoringService.calculateWinnability(VERIFIED_FREELANCER_PROFILE, unverifiedGig);
  assert(eval2.breakdown.clientTrust === 0, `Unverified client with 0 spend gets penalized in trust (got ${eval2.breakdown.clientTrust})`);
  assert(eval2.riskFactors.includes('Client payment method is unverified.'), 'Risk factor captured unverified status');

  // Test 2: DeterministicProposalProvider
  console.log('\n2. Testing DeterministicProposalProvider (Factual Guardrails):');
  const proposalProvider = new DeterministicProposalProvider();
  const proposal = await proposalProvider.generateProposal({
    freelancer: VERIFIED_FREELANCER_PROFILE,
    gig: sampleGig,
  });

  assert(proposal.providerUsed === 'deterministic', 'Used deterministic provider');
  assert(proposal.coverLetter.includes('4 years of verified hands-on experience'), 'Contains verified 4 years experience');
  assert(proposal.coverLetter.includes('MERN stack'), 'Reflects MERN specialization');
  assert(proposal.coverLetter.includes('Dhruv Parasher'), 'References candidate name');
  assert(proposal.coverLetter.includes('Immediate availability'), 'States immediate availability');
  assert(proposal.milestones.length === 3, `Generates 3 structured milestones (got ${proposal.milestones.length})`);

  // Test 3: ProjectNormalizer
  console.log('\n3. Testing ProjectNormalizer:');
  const normalizer = new ProjectNormalizer();
  const normalized = normalizer.normalize({
    title: 'React & Node.js Developer',
    clientName: 'Global Inc',
    pricingType: 'FIXED_PRICE',
    budgetMin: 1500,
    budgetMax: 2000,
    currency: 'USD',
    workMode: 'REMOTE',
    scope: 'MEDIUM',
    description: 'Looking for full stack engineer.',
    skills: ['reactjs', 'node.js', 'ts', 'graphql'],
    source: 'RSS',
    sourceUrl: 'https://example.com/job/123?ref=rss',
  });

  assert(normalized.skills.includes('React'), 'Normalizes reactjs -> React');
  assert(normalized.skills.includes('Node.js'), 'Normalizes node.js -> Node.js');
  assert(normalized.skills.includes('TypeScript'), 'Normalizes ts -> TypeScript');
  assert(normalized.skills.includes('GraphQL'), 'Normalizes graphql -> GraphQL');

  const isDup = normalizer.isDuplicate([normalized], {
    ...normalized,
    sourceUrl: 'https://example.com/job/123?utm_source=twitter',
  });
  assert(isDup === true, 'Successfully detects duplicate URL');

  console.log('\n🎉 ALL UNIT AND INTEGRATION TESTS PASSED!\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
