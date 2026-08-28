import { Injectable } from '@nestjs/common';
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
