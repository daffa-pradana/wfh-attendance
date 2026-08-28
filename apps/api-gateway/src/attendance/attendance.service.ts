import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '../../generated/prisma/client';

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

function startOfMonthWib(now: Date): Date {
  const wibNow = new Date(now.getTime() + WIB_OFFSET_MS);
  const startMs = Date.UTC(
    wibNow.getUTCFullYear(),
    wibNow.getUTCMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  return new Date(startMs - WIB_OFFSET_MS);
}

function endOfTodayWib(now: Date): Date {
  const wibNow = new Date(now.getTime() + WIB_OFFSET_MS);
  const endMs = Date.UTC(
    wibNow.getUTCFullYear(),
    wibNow.getUTCMonth(),
    wibNow.getUTCDate(),
    23,
    59,
    59,
    999,
  );
  return new Date(endMs - WIB_OFFSET_MS);
}

function startOfDayWib(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - WIB_OFFSET_MS);
}

function endOfDayWib(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(
    Date.UTC(year, month - 1, day, 23, 59, 59, 999) - WIB_OFFSET_MS,
  );
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  recordAttendance(employeeId: string, status: AttendanceStatus) {
    return this.prisma.attendance.create({
      data: {
        employeeId,
        status,
        recordedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        recordedAt: true,
      },
    });
  }

  getSummary(employeeId: string, from?: string, to?: string) {
    const now = new Date();
    return this.prisma.attendance.findMany({
      where: {
        employeeId,
        recordedAt: {
          gte: from ? startOfDayWib(from) : startOfMonthWib(now),
          lte: to ? endOfDayWib(to) : endOfTodayWib(now),
        },
      },
      orderBy: { recordedAt: 'asc' },
      select: {
        id: true,
        status: true,
        recordedAt: true,
      },
    });
  }
}
