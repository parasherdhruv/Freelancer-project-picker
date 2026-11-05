import { Body, Controller, Get, Put } from '@nestjs/common';
import { FreelancerService } from './freelancer.service';
import { UpdateFreelancerDto } from './dto/update-freelancer.dto';

@Controller('freelancer')
export class FreelancerController {
  constructor(private readonly freelancerService: FreelancerService) {}

  @Get('profile')
  getProfile() {
    return this.freelancerService.getProfile();
  }

  @Put('profile')
  saveProfile(@Body() dto: UpdateFreelancerDto) {
    return this.freelancerService.saveProfile(dto);
  }
}
