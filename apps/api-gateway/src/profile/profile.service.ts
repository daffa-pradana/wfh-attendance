import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';

interface ProfileUpdatedEvent {
  employeeId: string;
  changedField: 'phone' | 'photo' | 'password';
  oldValue: string | null;
  newValue: string | null;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientProxy,
  ) {}

  private emitProfileUpdated(event: ProfileUpdatedEvent) {
    this.auditClient.emit('profile.updated', event).subscribe({
      error: (err: unknown) => {
        console.error('Failed to publish profile.updated event', err);
      },
    });
  }

  async getProfile(id: string) {
    const profile = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return profile;
  }

  async updatePhone(id: string, phone: string) {
    const previous = await this.prisma.employee.findUnique({
      where: { id },
      select: { phone: true },
    });

    const updatedProfile = await this.prisma.employee.update({
      where: { id },
      data: { phone },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.emitProfileUpdated({
      employeeId: id,
      changedField: 'phone',
      oldValue: previous?.phone ?? null,
      newValue: phone,
    });

    return updatedProfile;
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: { passwordHash: true },
    });

    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      employee.passwordHash,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedProfile = await this.prisma.employee.update({
      where: { id },
      data: { passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.emitProfileUpdated({
      employeeId: id,
      changedField: 'password',
      oldValue: null,
      newValue: null,
    });

    return updatedProfile;
  }

  async updatePhoto(id: string, photoUrl: string) {
    const previous = await this.prisma.employee.findUnique({
      where: { id },
      select: { photoUrl: true },
    });

    const updatedProfile = await this.prisma.employee.update({
      where: { id },
      data: { photoUrl },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        phone: true,
        photoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.emitProfileUpdated({
      employeeId: id,
      changedField: 'photo',
      oldValue: previous?.photoUrl ?? null,
      newValue: photoUrl,
    });

    return updatedProfile;
  }
}
