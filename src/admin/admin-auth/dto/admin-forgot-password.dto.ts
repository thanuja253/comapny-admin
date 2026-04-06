import { IsEmail, IsNotEmpty } from 'class-validator';

export class AdminForgotPasswordDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;
}
