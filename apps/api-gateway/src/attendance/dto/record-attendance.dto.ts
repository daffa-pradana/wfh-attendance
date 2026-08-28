import { IsEnum } from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/client';

export class RecordAttendanceDto {
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;
}
