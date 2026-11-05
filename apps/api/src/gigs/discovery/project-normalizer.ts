import { Injectable } from '@nestjs/common';
import { DiscoveredProject } from './discovery-provider.interface';
import { GigItem, PricingType, ProjectScope } from '../gigs.types';

@Injectable()
export class ProjectNormalizer {
  private normalizeSkill(skill: string): string {
    const s = skill.trim();
    const map: Record<string, string> = {
      'reactjs': 'React',
      'react.js': 'React',
      'nextjs': 'Next.js',
      'next.js': 'Next.js',
      'nodejs': 'Node.js',
      'node.js': 'Node.js',
      'nestjs': 'NestJS',
      'nest.js': 'NestJS',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'mongodb': 'MongoDB',
      'mongo': 'MongoDB',
      'postgres': 'PostgreSQL',
      'postgresql': 'PostgreSQL',
      'graphql': 'GraphQL',
      'tailwind': 'Tailwind CSS',
      'tailwindcss': 'Tailwind CSS',
    };
    const key = s.toLowerCase().replace(/\s+/g, '');
    return map[key] || s;
  }

  normalize(raw: DiscoveredProject, idPrefix = 'gig'): GigItem {
    const skills = [...new Set((raw.skills || []).map((s) => this.normalizeSkill(s)))];

    // Clean URL to base
    let cleanUrl = raw.sourceUrl.trim();
    try {
      const u = new URL(cleanUrl);
      cleanUrl = `${u.origin}${u.pathname}`;
    } catch {
      // Keep as-is if invalid url format
    }

    const now = new Date().toISOString();

    return {
      id: `${idPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: raw.title.trim(),
      clientName: raw.clientName?.trim() || 'Client',
      clientLocation: raw.clientLocation?.trim() || 'Remote',
      clientRating: raw.clientRating !== undefined ? raw.clientRating : 4.9,
      clientReviewCount: raw.clientReviewCount !== undefined ? raw.clientReviewCount : 8,
      clientTotalSpent: raw.clientTotalSpent !== undefined ? raw.clientTotalSpent : 15000,
      paymentVerified: raw.paymentVerified !== undefined ? raw.paymentVerified : true,
      pricingType: (raw.pricingType as PricingType) || 'FIXED_PRICE',
      budgetMin: raw.budgetMin,
      budgetMax: raw.budgetMax,
      hourlyRateMin: raw.hourlyRateMin,
      hourlyRateMax: raw.hourlyRateMax,
      currency: raw.currency || 'USD',
      workMode: raw.workMode || 'REMOTE',
      scope: (raw.scope as ProjectScope) || 'MEDIUM',
      estimatedDuration: raw.estimatedDuration || '2-4 weeks',
      description: raw.description.trim(),
      skills,
      source: raw.source || 'MANUAL',
      sourceUrl: cleanUrl,
      externalId: raw.externalId,
      status: 'DISCOVERED',
      postedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  isDuplicate(existing: GigItem[], incoming: GigItem): boolean {
    const incomingNormUrl = incoming.sourceUrl.toLowerCase().replace(/\/$/, '');
    const incomingNormTitle = incoming.title.toLowerCase().trim();
    const incomingClient = incoming.clientName.toLowerCase().trim();

    return existing.some((item) => {
      const existingNormUrl = item.sourceUrl.toLowerCase().replace(/\/$/, '');
      if (existingNormUrl && existingNormUrl === incomingNormUrl) return true;

      const existingNormTitle = item.title.toLowerCase().trim();
      const existingClient = item.clientName.toLowerCase().trim();
      return (
        existingNormTitle === incomingNormTitle &&
        existingClient === incomingClient
      );
    });
  }
}
