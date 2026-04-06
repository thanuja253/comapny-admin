import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true, collection: 'admins' })
export class Admin {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: '1' })
  status: string;

  @Prop({ trim: true })
  first_name?: string;

  @Prop({ trim: true })
  last_name?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  organization?: string;

  @Prop({ trim: true })
  designation?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  pincode?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
