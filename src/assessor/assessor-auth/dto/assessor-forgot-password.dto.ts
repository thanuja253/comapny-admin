import { IsEmail, IsNotEmpty } from 'class-validator';

export class AssessorForgotPasswordDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;
}
