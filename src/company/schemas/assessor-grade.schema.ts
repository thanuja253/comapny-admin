import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssessorGradeDocument = AssessorGrade & Document;

@Schema({ timestamps: true, collection: 'assessor_grades' })
export class AssessorGrade {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '1' })
  status: string;

  @Prop({ default: 0 })
  order: number;
}

export const AssessorGradeSchema = SchemaFactory.createForClass(AssessorGrade);
