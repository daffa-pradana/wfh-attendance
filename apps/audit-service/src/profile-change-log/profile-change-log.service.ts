import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ProfileUpdatedEvent {
  employeeId: string;
  changedField: 'phone' | 'photo' | 'password';
  oldValue: string | null;
  newValue: string | null;
}

@Injectable()
export class ProfileChangeLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logChange(event: ProfileUpdatedEvent) {
    return this.prisma.profileChangeLog.create({
      data: {
        employeeId: event.employeeId,
        changedField: event.changedField,
        oldValue: event.oldValue,
        newValue: event.newValue,
      },
    });
  }
}
