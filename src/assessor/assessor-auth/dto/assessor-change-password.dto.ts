import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'AssessorMatchPassword', async: false })
export class AssessorMatchPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(confirmed: string, args: ValidationArguments) {
    const obj = args.object as AssessorChangePasswordDto;
    return confirmed === obj.new_password;
  }

  defaultMessage() {
    return 'New Password and Confirm Password does not match.';
  }
}

export class AssessorChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  current_password: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[1-9])(?=.*[@])[A-Za-z\d@$!%*#?&]/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number (1-9), and @',
  })
  new_password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString()
  @Validate(AssessorMatchPasswordConstraint)
  confirmed: string;
}
