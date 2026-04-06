import { IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

type FinalSubmitFlag = boolean | number | string;

export class UpdateAssessorDto {
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Mobile must be a valid 10-digit number' })
  mobile?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Mobile number must be a valid 10-digit number' })
  mobile_number?: string;

  @IsOptional()
  @IsIn(['0', '1', 0, 1], { message: 'Status must be 0 or 1' })
  status?: string | number;

  @IsOptional()
  @IsIn(['0', '1', 0, 1], { message: 'Verification status must be 0 or 1' })
  verification_status?: string | number;

  @IsOptional()
  @IsIn(['0', '1', 0, 1], { message: 'Verification status must be 0 or 1' })
  verificationStatus?: string | number;

  @IsOptional()
  @IsIn(['0', '1', 0, 1], { message: 'Profile updated must be 0 or 1' })
  profile_updated?: string | number;

  @IsOptional()
  @IsIn(['Pending', 'Completed'], { message: 'Profile status must be Pending or Completed' })
  profileStatus?: string;

  @IsOptional()
  @IsIn(['Pending', 'Completed', 'pending', 'completed'], {
    message: 'Profile status must be Pending or Completed',
  })
  profile_status?: string;

  @IsOptional()
  @IsString()
  state_id?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  assessor_grade?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  assessor_grade_id?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsString()
  industryCategory?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Alternate mobile must be a valid 10-digit number' })
  alternate_mobile?: string;

  @IsOptional()
  @IsIn(['0', '1', 0, 1], { message: 'GST flag must be 0 or 1' })
  gst_enabled?: string | number;

  @IsOptional()
  @IsIn(['0', '1', 0, 1], { message: 'GST flag must be 0 or 1' })
  gst?: string | number;

  @IsOptional()
  @IsString()
  gstin_no?: string;

  @IsOptional()
  @IsString()
  emergency_name?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Emergency mobile must be a valid 10-digit number' })
  emergency_mobile?: string;

  @IsOptional()
  @IsString()
  emergency_address1?: string;

  @IsOptional()
  @IsString()
  emergency_address2?: string;

  @IsOptional()
  @IsString()
  emergency_city?: string;

  @IsOptional()
  @IsString()
  emergency_state_id?: string;

  @IsOptional()
  @IsString()
  emergency_pincode?: string;

  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  branch_name?: string;

  @IsOptional()
  @IsString()
  ifsc_code?: string;

  @IsOptional()
  @IsString()
  pan_number?: string;

  @IsOptional()
  @IsString()
  pan_no?: string;

  @IsOptional()
  finalSubmit?: FinalSubmitFlag;

  @IsOptional()
  final_submit?: FinalSubmitFlag;

  @IsOptional()
  is_final_submit?: FinalSubmitFlag;
}
