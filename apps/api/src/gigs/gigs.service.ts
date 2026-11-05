import { Injectable, NotFoundException } from '@nestjs/common';
import { FreelancerService } from '../freelancer/freelancer.service';
import { ProjectDiscoveryService } from './discovery/project-discovery.service';
import { GigScoringService } from './scoring/gig-scoring.service';
import { ProposalDraftService } from './proposals/proposal-draft.service';
import { CreateGigDto } from './dto/create-gig.dto';
import { GigItem, ProposalItem, ProposalStatus } from './gigs.types';

@Injectable()
export class GigsService {
  constructor(
    private readonly freelancerService: FreelancerService,
    private readonly discoveryService: ProjectDiscoveryService,
    private readonly scoringService: GigScoringService,
    private readonly proposalDraftService: ProposalDraftService,
  ) {}

  async create(dto: CreateGigDto): Promise<GigItem> {
    return this.discoveryService.addManualProject({
      title: dto.title,
      clientName: dto.clientName || 'Client',
      clientLocation: dto.clientLocation || 'Remote',
      clientRating: dto.clientRating ?? 4.9,
      clientTotalSpent: dto.clientTotalSpent ?? 5000,
      paymentVerified: dto.paymentVerified ?? true,
      pricingType: dto.pricingType ?? 'FIXED_PRICE',
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      hourlyRateMin: dto.hourlyRateMin,
      hourlyRateMax: dto.hourlyRateMax,
      currency: dto.currency || 'USD',
      workMode: dto.workMode || 'REMOTE',
      scope: dto.scope || 'MEDIUM',
      estimatedDuration: dto.estimatedDuration || '2-4 weeks',
      description: dto.description,
      skills: dto.skills || [],
      source: dto.source || 'MANUAL',
      sourceUrl: dto.sourceUrl,
    });
  }

  async list(filters?: { minScore?: number; pricingType?: string; workMode?: string }): Promise<GigItem[]> {
    const all = await this.discoveryService.getAllGigs();
    let result = all;

    if (filters?.pricingType) {
      result = result.filter((g) => g.pricingType === filters.pricingType);
    }
    if (filters?.workMode) {
      result = result.filter((g) => g.workMode === filters.workMode);
    }

    return result;
  }

  async getById(id: string): Promise<GigItem> {
    const gig = await this.discoveryService.getGigById(id);
    if (!gig) throw new NotFoundException(`Gig ${id} not found`);
    return gig;
  }

  async matches() {
    const [freelancer, gigs] = await Promise.all([
      this.freelancerService.getProfile(),
      this.discoveryService.getAllGigs(),
    ]);

    const scoredMatches = gigs.map((gig) => {
      const evaluation = this.scoringService.calculateWinnability(freelancer, gig);
      return {
        gig: {
          ...gig,
          winnabilityScore: evaluation.score,
          scoringBreakdown: evaluation.breakdown,
        },
        score: evaluation.score,
        breakdown: evaluation.breakdown,
        matchedSkills: evaluation.matchedSkills,
        missingSkills: evaluation.missingSkills,
        keyStrengths: evaluation.keyStrengths,
        riskFactors: evaluation.riskFactors,
      };
    });

    // Sort by winnability score descending
    scoredMatches.sort((a, b) => b.score - a.score);

    return {
      freelancer,
      totalGigs: gigs.length,
      matches: scoredMatches,
    };
  }

  async generateProposal(gigId: string, provider?: string): Promise<ProposalItem> {
    const [freelancer, gig] = await Promise.all([
      this.freelancerService.getProfile(),
      this.getById(gigId),
    ]);

    // Update gig status to PROPOSAL_GENERATED
    await this.discoveryService.updateGigStatus(gigId, 'PROPOSAL_GENERATED');

    return this.proposalDraftService.createDraft(freelancer, gig, provider);
  }

  async getProposalsForGig(gigId: string): Promise<ProposalItem[]> {
    return this.proposalDraftService.listForGig(gigId);
  }

  async getAllProposals(): Promise<ProposalItem[]> {
    return this.proposalDraftService.listAll();
  }

  async updateProposalStatus(
    id: string,
    status: ProposalStatus,
    coverLetter?: string,
    notes?: string,
  ): Promise<ProposalItem> {
    const updated = await this.proposalDraftService.updateStatus(id, status, coverLetter, notes);

    // If proposal was approved or submitted, sync gig status
    if (status === 'APPROVED') {
      await this.discoveryService.updateGigStatus(updated.gigId, 'PROPOSAL_APPROVED');
    } else if (status === 'SUBMITTED') {
      await this.discoveryService.updateGigStatus(updated.gigId, 'PROPOSAL_SUBMITTED');
    }

    return updated;
  }

  async syncDiscovery() {
    return this.discoveryService.syncDiscoveredGigs();
  }
}
