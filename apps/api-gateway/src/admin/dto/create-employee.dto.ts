import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Role } from '../../../generated/prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  position!: string;

  @IsString()
  @MinLength(1)
  @Matches(/^[0-9+\-\s]+$/)
  phone!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
