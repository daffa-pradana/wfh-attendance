import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { AttendanceService } from './attendance.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { AttendanceSummaryQueryDto } from './dto/attendance-summary-query.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  record(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: RecordAttendanceDto,
  ) {
    return this.attendanceService.recordAttendance(req.user.sub, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  summary(
    @Req() req: Request & { user: JwtPayload },
    @Query() query: AttendanceSummaryQueryDto,
  ) {
    return this.attendanceService.getSummary(
      req.user.sub,
      query.from,
      query.to,
    );
  }
}
