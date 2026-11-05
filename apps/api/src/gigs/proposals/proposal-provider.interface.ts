import { VerifiedFreelancerProfile } from '../../freelancer/freelancer.types';
import { GigItem, PricingType } from '../gigs.types';

export interface MilestoneDraft {
  title: string;
  description: string;
  durationDays: number;
  amount: number;
}

export interface ProposalContext {
  freelancer: VerifiedFreelancerProfile;
  gig: GigItem;
  clientRequestedRate?: number;
  customInstructions?: string;
}

export interface GeneratedProposalResult {
  coverLetter: string;
  proposedRate: number;
  pricingType: PricingType;
  estimatedTimeline: string;
  milestones: MilestoneDraft[];
  providerUsed: 'deterministic' | 'gemini';
  notes?: string;
}

export interface ProposalAiProvider {
  readonly name: 'deterministic' | 'gemini';
  generateProposal(context: ProposalContext): Promise<GeneratedProposalResult>;
}
