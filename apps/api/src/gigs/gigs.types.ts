export type CompensationPeriod = 'hourly' | 'fixed' | 'yearly' | 'undisclosed';

export type PricingType = 'HOURLY' | 'FIXED_PRICE' | 'RETAINER';

export type ProjectScope = 'SMALL' | 'MEDIUM' | 'LARGE';

export type GigStatus =
  | 'DISCOVERED'
  | 'SAVED'
  | 'EVALUATED'
  | 'PROPOSAL_GENERATED'
  | 'PROPOSAL_APPROVED'
  | 'PROPOSAL_SUBMITTED'
  | 'INTERVIEWING'
  | 'OFFER_RECEIVED'
  | 'CONTRACT_ACTIVE'
  | 'COMPLETED'
  | 'DECLINED'
  | 'ARCHIVED';

export type ProposalStatus =
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ARCHIVED';

export interface WinnabilityBreakdown {
  skillsMatch: number;      // 0-35
  budgetFit: number;        // 0-25
  clientTrust: number;      // 0-20
  scopeFit: number;         // 0-10
  winnability: number;      // 0-10
}

export interface WinnabilityResult {
  score: number;
  breakdown: WinnabilityBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  keyStrengths: string[];
  riskFactors: string[];
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
  pricingType: PricingType;
  compensationPeriod?: CompensationPeriod;
  currencySymbol?: string;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  currency: string;
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  scope: ProjectScope;
  estimatedDuration?: string;
  description: string;
  skills: string[];
  source: 'MANUAL' | 'COMPANY_SITE' | 'API' | 'RSS' | 'OTHER';
  sourceUrl: string;
  externalId?: string;
  status: GigStatus;
  winnabilityScore?: number;
  scoringBreakdown?: WinnabilityBreakdown;
  postedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalItem {
  id: string;
  gigId: string;
  freelancerId: string;
  status: ProposalStatus;
  coverLetter: string;
  proposedRate: number;
  pricingType: PricingType;
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
