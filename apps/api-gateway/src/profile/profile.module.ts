import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports: [AuthModule],
})
export class ProfileModule {}
