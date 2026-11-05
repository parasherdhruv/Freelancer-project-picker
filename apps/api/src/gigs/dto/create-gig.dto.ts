import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateGigDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientLocation?: string;

  @IsOptional()
  @IsNumber()
  clientRating?: number;

  @IsOptional()
  @IsNumber()
  clientTotalSpent?: number;

  @IsOptional()
  @IsBoolean()
  paymentVerified?: boolean;

  @IsOptional()
  @IsString()
  pricingType?: 'HOURLY' | 'FIXED_PRICE' | 'RETAINER';

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMax?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  workMode?: 'REMOTE' | 'HYBRID' | 'ONSITE';

  @IsOptional()
  @IsString()
  scope?: 'SMALL' | 'MEDIUM' | 'LARGE';

  @IsOptional()
  @IsString()
  estimatedDuration?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsUrl()
  sourceUrl!: string;

  @IsOptional()
  @IsString()
  source?: 'MANUAL' | 'COMPANY_SITE' | 'API' | 'RSS' | 'OTHER';
}
