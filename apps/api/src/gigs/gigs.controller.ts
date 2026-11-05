import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GigsService } from './gigs.service';
import { CreateGigDto } from './dto/create-gig.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';

@Controller('gigs')
export class GigsController {
  constructor(private readonly gigsService: GigsService) {}

  @Post()
  create(@Body() dto: CreateGigDto) {
    return this.gigsService.create(dto);
  }

  @Get()
  list(
    @Query('pricingType') pricingType?: string,
    @Query('workMode') workMode?: string,
  ) {
    return this.gigsService.list({ pricingType, workMode });
  }

  @Get('matches')
  matches() {
    return this.gigsService.matches();
  }

  @Post('discover')
  discover() {
    return this.gigsService.syncDiscovery();
  }

  @Get('proposals')
  allProposals() {
    return this.gigsService.getAllProposals();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.gigsService.getById(id);
  }

  @Post(':id/proposals/generate')
  generateProposal(
    @Param('id') id: string,
    @Body('provider') provider?: string,
  ) {
    return this.gigsService.generateProposal(id, provider);
  }

  @Get(':id/proposals')
  getProposals(@Param('id') id: string) {
    return this.gigsService.getProposalsForGig(id);
  }

  @Patch('proposals/:id/status')
  updateProposalStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProposalStatusDto,
  ) {
    return this.gigsService.updateProposalStatus(id, dto.status, dto.coverLetter, dto.notes);
  }
}
