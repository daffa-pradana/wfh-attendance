import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.employee.update({
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
  }

  async updatePhoto(id: string, photoUrl: string) {
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
    return updatedProfile;
  }
}
