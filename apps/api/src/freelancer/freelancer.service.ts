import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFreelancerDto } from './dto/update-freelancer.dto';
import { VERIFIED_FREELANCER_PROFILE, VerifiedFreelancerProfile } from './freelancer.types';

@Injectable()
export class FreelancerService {
  private readonly logger = new Logger(FreelancerService.name);
  private memoryProfile: VerifiedFreelancerProfile = { ...VERIFIED_FREELANCER_PROFILE };

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(): Promise<VerifiedFreelancerProfile> {
    try {
      if ((this.prisma as any).freelancerProfile) {
        const found = await (this.prisma as any).freelancerProfile.findUnique({
          where: { id: 'default' },
        });
        if (found) return found;
      }
    } catch (err) {
      this.logger.warn(`Could not fetch profile from DB, using memory fallback: ${err}`);
    }
    return this.memoryProfile;
  }

  async saveProfile(dto: UpdateFreelancerDto): Promise<VerifiedFreelancerProfile> {
    this.memoryProfile = {
      ...this.memoryProfile,
      ...dto,
    };

    try {
      if ((this.prisma as any).freelancerProfile) {
        return await (this.prisma as any).freelancerProfile.upsert({
          where: { id: 'default' },
          create: { id: 'default', ...dto },
          update: dto,
        });
      }
    } catch (err) {
      this.logger.warn(`Could not save profile to DB, updated in-memory: ${err}`);
    }
    return this.memoryProfile;
  }
}
