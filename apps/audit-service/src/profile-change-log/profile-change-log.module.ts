import { Module } from '@nestjs/common';
import { ProfileChangeLogController } from './profile-change-log.controller';
import { ProfileChangeLogService } from './profile-change-log.service';

@Module({
  controllers: [ProfileChangeLogController],
  providers: [ProfileChangeLogService],
})
export class ProfileChangeLogModule {}
