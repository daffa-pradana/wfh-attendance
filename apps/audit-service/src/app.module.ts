import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileChangeLogModule } from './profile-change-log/profile-change-log.module';

@Module({
  imports: [PrismaModule, ProfileChangeLogModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
