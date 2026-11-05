import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VerifiedFreelancerProfile } from '../../freelancer/freelancer.types';
import { GigItem, ProposalItem, ProposalStatus } from '../gigs.types';
import { ProposalAiProvider } from './proposal-provider.interface';
import { DeterministicProposalProvider } from './deterministic-proposal.provider';
import { GeminiProposalProvider } from './gemini-proposal.provider';

@Injectable()
export class ProposalDraftService {
  private readonly logger = new Logger(ProposalDraftService.name);
  private memoryProposals: ProposalItem[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly deterministicProvider: DeterministicProposalProvider,
    private readonly geminiProvider: GeminiProposalProvider,
  ) {}

  private getProvider(requestedProvider?: string): ProposalAiProvider {
    if (requestedProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      return this.geminiProvider;
    }
    return this.deterministicProvider;
  }

  async createDraft(
    freelancer: VerifiedFreelancerProfile,
    gig: GigItem,
    preferredProvider?: string,
  ): Promise<ProposalItem> {
    const provider = this.getProvider(preferredProvider);
    const generated = await provider.generateProposal({ freelancer, gig });

    const newProposal: ProposalItem = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      gigId: gig.id,
      freelancerId: freelancer.id,
      status: 'READY_FOR_REVIEW', // Safety: always awaits human review!
      coverLetter: generated.coverLetter,
      proposedRate: generated.proposedRate,
      pricingType: generated.pricingType,
      estimatedTimeline: generated.estimatedTimeline,
      milestones: generated.milestones,
      providerUsed: generated.providerUsed,
      notes: generated.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if ((this.prisma as any).proposal) {
        const saved = await (this.prisma as any).proposal.create({
          data: {
            id: newProposal.id,
            gigId: gig.id,
            freelancerId: freelancer.id,
            status: 'READY_FOR_REVIEW',
            coverLetter: newProposal.coverLetter,
            proposedRate: newProposal.proposedRate,
            pricingType: newProposal.pricingType,
            estimatedTimeline: newProposal.estimatedTimeline,
            milestones: newProposal.milestones as any,
            providerUsed: newProposal.providerUsed,
            notes: newProposal.notes,
          },
        });
        if (saved) {
          this.memoryProposals.unshift(newProposal);
          return newProposal;
        }
      }
    } catch (err) {
      this.logger.warn(`Could not save proposal to Prisma, persisting in memory: ${err}`);
    }

    this.memoryProposals.unshift(newProposal);
    return newProposal;
  }

  async listForGig(gigId: string): Promise<ProposalItem[]> {
    try {
      if ((this.prisma as any).proposal) {
        const list = await (this.prisma as any).proposal.findMany({
          where: { gigId },
          orderBy: { createdAt: 'desc' },
        });
        if (list && list.length > 0) return list;
      }
    } catch (err) {
      this.logger.warn(`Could not query proposals from DB: ${err}`);
    }
    return this.memoryProposals.filter((p) => p.gigId === gigId);
  }

  async listAll(): Promise<ProposalItem[]> {
    try {
      if ((this.prisma as any).proposal) {
        const list = await (this.prisma as any).proposal.findMany({
          orderBy: { createdAt: 'desc' },
        });
        if (list && list.length > 0) return list;
      }
    } catch (err) {
      this.logger.warn(`Could not query all proposals from DB: ${err}`);
    }
    return this.memoryProposals;
  }

  async updateStatus(
    id: string,
    status: ProposalStatus,
    updatedCoverLetter?: string,
    notes?: string,
  ): Promise<ProposalItem> {
    const memoryIdx = this.memoryProposals.findIndex((p) => p.id === id);
    const existing = memoryIdx !== -1 ? this.memoryProposals[memoryIdx] : null;

    const now = new Date().toISOString();
    const patch: Partial<ProposalItem> = {
      status,
      updatedAt: now,
    };

    if (updatedCoverLetter !== undefined) {
      patch.coverLetter = updatedCoverLetter;
    }
    if (notes !== undefined) {
      patch.notes = notes;
    }
    if (status === 'APPROVED') {
      patch.approvedAt = now;
    }
    if (status === 'SUBMITTED') {
      patch.submittedAt = now;
    }

    try {
      if ((this.prisma as any).proposal) {
        await (this.prisma as any).proposal.update({
          where: { id },
          data: {
            status,
            ...(updatedCoverLetter !== undefined ? { coverLetter: updatedCoverLetter } : {}),
            ...(notes !== undefined ? { notes } : {}),
            ...(status === 'APPROVED' ? { approvedAt: new Date() } : {}),
            ...(status === 'SUBMITTED' ? { submittedAt: new Date() } : {}),
          },
        });
      }
    } catch (err) {
      this.logger.warn(`Could not update proposal in DB: ${err}`);
    }

    if (existing) {
      this.memoryProposals[memoryIdx] = { ...existing, ...patch };
      return this.memoryProposals[memoryIdx];
    }

    if (!existing) {
      throw new NotFoundException(`Proposal with id ${id} not found`);
    }

    return existing;
  }
}
