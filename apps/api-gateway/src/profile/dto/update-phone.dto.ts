import { IsString, Matches, MinLength } from 'class-validator';

export class UpdatePhoneDto {
  @IsString()
  @MinLength(1)
  @Matches(/^[0-9+\-\s]+$/)
  phone!: string;
}
