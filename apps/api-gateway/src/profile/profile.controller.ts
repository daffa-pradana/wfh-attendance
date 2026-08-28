import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePhoneDto } from './dto/update-phone.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: Request & { user: JwtPayload }) {
    return this.profileService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('phone')
  updatePhone(
    @Req() req: Request & { user: JwtPayload },
    @Body() updatePhoneDto: UpdatePhoneDto,
  ) {
    return this.profileService.updatePhone(req.user.sub, updatePhoneDto.phone);
  }
}
