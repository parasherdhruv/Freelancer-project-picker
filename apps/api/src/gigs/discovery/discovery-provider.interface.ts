import { CompensationPeriod, PricingType, ProjectScope } from '../gigs.types';

export interface DiscoveredProject {
  title: string;
  clientName: string;
  clientLocation?: string;
  clientRating?: number;
  clientReviewCount?: number;
  clientTotalSpent?: number;
  paymentVerified?: boolean;
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
}

export interface DiscoveryProvider {
  readonly name: string;
  discover(): Promise<DiscoveredProject[]>;
}
