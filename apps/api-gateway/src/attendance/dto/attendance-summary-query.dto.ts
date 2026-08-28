import { IsDateString, IsOptional } from 'class-validator';

export class AttendanceSummaryQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
