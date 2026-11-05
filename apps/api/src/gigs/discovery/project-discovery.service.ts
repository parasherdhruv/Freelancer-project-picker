import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectNormalizer } from './project-normalizer';
import { PermittedFeedProvider } from './providers/permitted-feed.provider';
import { DiscoveredProject } from './discovery-provider.interface';
import { GigItem } from '../gigs.types';

@Injectable()
export class ProjectDiscoveryService {
  private readonly logger = new Logger(ProjectDiscoveryService.name);
  private memoryGigs: GigItem[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: ProjectNormalizer,
    private readonly permittedFeedProvider: PermittedFeedProvider,
  ) {}

  async onModuleInit() {
    // Run initial discovery pass on boot
    await this.syncDiscoveredGigs();
  }

  async syncDiscoveredGigs(): Promise<{ added: number; total: number }> {
    this.logger.log('Starting project discovery pass from permitted providers...');
    const rawProjects = await this.permittedFeedProvider.discover();
    let addedCount = 0;

    for (const raw of rawProjects) {
      const normalized = this.normalizer.normalize(raw);
      if (!this.normalizer.isDuplicate(this.memoryGigs, normalized)) {
        this.memoryGigs.push(normalized);
        addedCount++;

        // Persist to Prisma if available
        try {
          if ((this.prisma as any).gig) {
            await (this.prisma as any).gig.upsert({
              where: { sourceUrl: normalized.sourceUrl },
              create: {
                id: normalized.id,
                title: normalized.title,
                clientName: normalized.clientName,
                clientLocation: normalized.clientLocation,
                clientRating: normalized.clientRating,
                clientReviewCount: normalized.clientReviewCount,
                clientTotalSpent: normalized.clientTotalSpent,
                paymentVerified: normalized.paymentVerified,
                pricingType: normalized.pricingType,
                budgetMin: normalized.budgetMin,
                budgetMax: normalized.budgetMax,
                hourlyRateMin: normalized.hourlyRateMin,
                hourlyRateMax: normalized.hourlyRateMax,
                currency: normalized.currency,
                workMode: normalized.workMode,
                scope: normalized.scope,
                estimatedDuration: normalized.estimatedDuration,
                description: normalized.description,
                skills: normalized.skills,
                source: normalized.source,
                sourceUrl: normalized.sourceUrl,
                externalId: normalized.externalId,
                status: normalized.status,
              },
              update: {},
            });
          }
        } catch {
          // DB offline or table not migrated yet; in-memory fallback handles it safely
        }
      }
    }

    this.logger.log(`Discovery sync complete. Added ${addedCount} new projects. Total: ${this.memoryGigs.length}`);
    return { added: addedCount, total: this.memoryGigs.length };
  }

  async addManualProject(input: DiscoveredProject): Promise<GigItem> {
    const normalized = this.normalizer.normalize(input);
    if (this.normalizer.isDuplicate(this.memoryGigs, normalized)) {
      const existing = this.memoryGigs.find((g) => g.sourceUrl === normalized.sourceUrl);
      if (existing) return existing;
    }

    this.memoryGigs.unshift(normalized);

    try {
      if ((this.prisma as any).gig) {
        await (this.prisma as any).gig.create({
          data: {
            id: normalized.id,
            title: normalized.title,
            clientName: normalized.clientName,
            clientLocation: normalized.clientLocation,
            clientRating: normalized.clientRating,
            clientReviewCount: normalized.clientReviewCount,
            clientTotalSpent: normalized.clientTotalSpent,
            paymentVerified: normalized.paymentVerified,
            pricingType: normalized.pricingType,
            budgetMin: normalized.budgetMin,
            budgetMax: normalized.budgetMax,
            hourlyRateMin: normalized.hourlyRateMin,
            hourlyRateMax: normalized.hourlyRateMax,
            currency: normalized.currency,
            workMode: normalized.workMode,
            scope: normalized.scope,
            estimatedDuration: normalized.estimatedDuration,
            description: normalized.description,
            skills: normalized.skills,
            source: 'MANUAL',
            sourceUrl: normalized.sourceUrl,
            status: normalized.status,
          },
        });
      }
    } catch {
      // Memory fallback active
    }

    return normalized;
  }

  async getAllGigs(): Promise<GigItem[]> {
    try {
      if ((this.prisma as any).gig) {
        const found = await (this.prisma as any).gig.findMany({
          orderBy: { createdAt: 'desc' },
        });
        if (found && found.length > 0) return found;
      }
    } catch {
      // Memory fallback
    }
    return this.memoryGigs;
  }

  async getGigById(id: string): Promise<GigItem | null> {
    try {
      if ((this.prisma as any).gig) {
        const found = await (this.prisma as any).gig.findUnique({
          where: { id },
        });
        if (found) return found;
      }
    } catch {
      // Memory fallback
    }
    return this.memoryGigs.find((g) => g.id === id) || null;
  }

  async updateGigStatus(id: string, status: any): Promise<GigItem | null> {
    const idx = this.memoryGigs.findIndex((g) => g.id === id);
    if (idx !== -1) {
      this.memoryGigs[idx].status = status;
    }

    try {
      if ((this.prisma as any).gig) {
        return await (this.prisma as any).gig.update({
          where: { id },
          data: { status },
        });
      }
    } catch {
      // Memory fallback
    }

    return idx !== -1 ? this.memoryGigs[idx] : null;
  }
}
