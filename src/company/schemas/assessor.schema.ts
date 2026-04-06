import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssessorDocument = Assessor & Document;

@Schema({ timestamps: true })
export class Assessor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ trim: true })
  mobile?: string;

  @Prop({ default: '1' })
  status: string;

  @Prop({ default: '0' })
  verification_status?: string;

  @Prop({ default: '0' })
  profile_updated?: string;

  @Prop({ trim: true })
  alternate_mobile?: string;

  @Prop({ trim: true })
  category_id?: string;

  @Prop({ trim: true })
  industryCategory?: string;

  @Prop({ trim: true })
  assessor_grade_id?: string;

  @Prop({ trim: true })
  assessor_grade?: string;

  @Prop({ trim: true })
  grade?: string;

  @Prop({ trim: true })
  state_id?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  address1?: string;

  @Prop({ trim: true })
  address2?: string;

  @Prop({ trim: true })
  pincode?: string;

  @Prop({ trim: true })
  gst_enabled?: string;

  @Prop({ trim: true })
  gst?: string;

  @Prop({ trim: true })
  gstin_no?: string;

  @Prop({ trim: true })
  emergency_name?: string;

  @Prop({ trim: true })
  emergency_mobile?: string;

  @Prop({ trim: true })
  emergency_address1?: string;

  @Prop({ trim: true })
  emergency_address2?: string;

  @Prop({ trim: true })
  emergency_city?: string;

  @Prop({ trim: true })
  emergency_state_id?: string;

  @Prop({ trim: true })
  emergency_pincode?: string;

  @Prop({ trim: true })
  bank_name?: string;

  @Prop({ trim: true })
  account_number?: string;

  @Prop({ trim: true })
  branch_name?: string;

  @Prop({ trim: true })
  ifsc_code?: string;

  @Prop({ trim: true })
  company_logo?: string;

  @Prop({ trim: true })
  cancelled_check?: string;

  @Prop({ trim: true })
  health_doc?: string;

  @Prop({ trim: true })
  gst_form?: string;

  @Prop({ trim: true })
  vendor_stamp?: string;

  @Prop({ trim: true })
  ndc_form?: string;

  @Prop({ trim: true })
  pan?: string;

  @Prop({ trim: true })
  pan_number?: string;

  @Prop({ trim: true })
  pan_no?: string;

  @Prop({ trim: true })
  biodata?: string;
}

export const AssessorSchema = SchemaFactory.createForClass(Assessor);



