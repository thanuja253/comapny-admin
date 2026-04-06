import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateAssessorDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Mobile is required' })
  @Matches(/^[6-9]\d{9}$/, { message: 'Mobile must be a valid 10-digit number' })
  mobile: string;

  @IsOptional()
  @IsIn(['0', '1', 0, 1], { message: 'Status must be 0 or 1' })
  status?: string | number;
}
