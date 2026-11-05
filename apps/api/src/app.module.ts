import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { CandidateController } from './candidate/candidate.controller';
import { CandidateService } from './candidate/candidate.service';
import { JobsController } from './jobs/jobs.controller';
import { JobsService } from './jobs/jobs.service';

// Freelancer & Autonomous Agent Modules
import { FreelancerController } from './freelancer/freelancer.controller';
import { FreelancerService } from './freelancer/freelancer.service';
import { GigsController } from './gigs/gigs.controller';
import { GigsService } from './gigs/gigs.service';
import { GigScoringService } from './gigs/scoring/gig-scoring.service';
import { DeterministicProposalProvider } from './gigs/proposals/deterministic-proposal.provider';
import { GeminiProposalProvider } from './gigs/proposals/gemini-proposal.provider';
import { ProposalDraftService } from './gigs/proposals/proposal-draft.service';
import { ProjectNormalizer } from './gigs/discovery/project-normalizer';
import { PermittedFeedProvider } from './gigs/discovery/providers/permitted-feed.provider';
import { ProjectDiscoveryService } from './gigs/discovery/project-discovery.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    HealthController,
    CandidateController,
    JobsController,
    FreelancerController,
    GigsController,
  ],
  providers: [
    CandidateService,
    JobsService,
    FreelancerService,
    GigsService,
    GigScoringService,
    DeterministicProposalProvider,
    GeminiProposalProvider,
    ProposalDraftService,
    ProjectNormalizer,
    PermittedFeedProvider,
    ProjectDiscoveryService,
  ],
})
export class AppModule {}
