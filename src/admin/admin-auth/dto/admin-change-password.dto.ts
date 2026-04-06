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

@ValidatorConstraint({ name: 'AdminMatchPassword', async: false })
export class AdminMatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmed: string, args: ValidationArguments) {
    const obj = args.object as AdminChangePasswordDto;
    return confirmed === obj.new_password;
  }

  defaultMessage() {
    return 'New Password and Confirm Password does not match.';
  }
}

export class AdminChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  current_password: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*#?&)',
  })
  new_password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString()
  @Validate(AdminMatchPasswordConstraint)
  confirmed: string;
}
