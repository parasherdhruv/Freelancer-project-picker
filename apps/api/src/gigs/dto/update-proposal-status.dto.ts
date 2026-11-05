import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProposalStatus } from '../gigs.types';

export class UpdateProposalStatusDto {
  @IsString()
  status!: ProposalStatus;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
