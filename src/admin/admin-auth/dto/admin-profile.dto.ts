import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class AdminProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 120, { message: 'Name must be between 1 and 120 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  first_name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  last_name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone must be a valid 10-digit number' })
  phone?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone must be a valid 10-digit number' })
  mobile?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Phone must be a valid 10-digit number' })
  mobile_number?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Organization must be between 1 and 100 characters' })
  organization?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Organization must be between 1 and 100 characters' })
  organisation?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Designation must be between 1 and 100 characters' })
  designation?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200, { message: 'Address must be between 1 and 200 characters' })
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80, { message: 'City must be between 1 and 80 characters' })
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80, { message: 'State must be between 1 and 80 characters' })
  state?: string;

  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'Pincode must be a valid 6-digit number' })
  pincode?: string;
}
