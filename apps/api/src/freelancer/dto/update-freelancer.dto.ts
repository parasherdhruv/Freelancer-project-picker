import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFreelancerDto {
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetHourlyRateUsd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetHourlyRateInr?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minProjectBudgetUsd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weeklyCapacityHours?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLocations?: string[];

  @IsOptional()
  @IsBoolean()
  remoteOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  immediateAvailability?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioLinks?: string[];

  @IsOptional()
  @IsString()
  customPitchIntro?: string;
}
