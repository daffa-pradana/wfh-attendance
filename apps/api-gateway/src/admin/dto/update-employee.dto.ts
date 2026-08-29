import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  position?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Matches(/^[0-9+\-\s]+$/)
  phone?: string;
}
