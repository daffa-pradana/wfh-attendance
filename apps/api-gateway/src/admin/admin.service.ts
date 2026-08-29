import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

const EMPLOYEE_SELECT = {
  id: true,
  name: true,
  email: true,
  position: true,
  phone: true,
  photoUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listEmployees() {
    return this.prisma.employee.findMany({
      select: EMPLOYEE_SELECT,
      orderBy: { name: 'asc' },
    });
  }

  async createEmployee(dto: CreateEmployeeDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      return await this.prisma.employee.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          position: dto.position,
          phone: dto.phone,
          role: dto.role,
        },
        select: EMPLOYEE_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Email is already in use');
      }
      throw err;
    }
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Employee not found');
    }

    try {
      return await this.prisma.employee.update({
        where: { id },
        data: dto,
        select: EMPLOYEE_SELECT,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Email is already in use');
      }
      throw err;
    }
  }

  listAttendance() {
    return this.prisma.attendance.findMany({
      select: {
        id: true,
        status: true,
        recordedAt: true,
        employee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
