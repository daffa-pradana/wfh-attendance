import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  changePassword(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(
      req.user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  updatePhoto(
    @Req() req: Request & { user: JwtPayload },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No File Uploaded');
    }
    const photoUrl = `/uploads/photos/${file.filename}`;
    return this.profileService.updatePhoto(req.user.sub, photoUrl);
  }
}
