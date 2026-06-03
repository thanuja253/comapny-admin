import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assessor, AssessorDocument } from '../schemas/assessor.schema';
import { lookupIfscDetails } from '../../common/ifsc-lookup.util';
import {
  ASSESSOR_PROFILE_DOCUMENT_KEYS,
  ASSESSOR_REVIEW_REQUIRED_DOCUMENT_KEYS,
} from './assessor-profile-document-keys';
import { S3Service } from '../../s3/s3.service';
import { persistMulterFile } from '../../common/stored-file.util';

@Injectable()
export class AssessorProfileService {
  constructor(
    @InjectModel(Assessor.name)
    private readonly assessorModel: Model<AssessorDocument>,
    private readonly s3Service: S3Service,
  ) {}

  private async uploadField(f?: Express.Multer.File[]): Promise<string | undefined> {
    return f?.[0]
      ? (await persistMulterFile(this.s3Service, f[0], 'uploads/assessors')).publicUrl
      : undefined;
  }

  private toBool(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'y';
  }

  private async deriveBankDetails(
    ifscCodeRaw: unknown,
    fallbackBankName = '',
    fallbackBranchName = '',
  ): Promise<{ ifsc_code: string; bank_name: string; branch_name: string }> {
    const ifscCode = String(ifscCodeRaw || '').trim().toUpperCase();
    if (!ifscCode) {
      return {
        ifsc_code: '',
        bank_name: String(fallbackBankName || '').trim(),
        branch_name: String(fallbackBranchName || '').trim(),
      };
    }

    const lookedUp = await lookupIfscDetails(ifscCode);
    return {
      ifsc_code: lookedUp.ifsc_code,
      bank_name: lookedUp.bank_name || String(fallbackBankName || '').trim(),
      branch_name: lookedUp.branch_name || String(fallbackBranchName || '').trim(),
    };
  }

  private requireNonEmpty(value: unknown): boolean {
    return String(value ?? '').trim().length > 0;
  }

  private assertRequiredProfileFields(
    body: Record<string, any>,
    existing: AssessorDocument,
    files?: {
      profile_image?: Express.Multer.File[];
      biodata?: Express.Multer.File[];
      vendor_registration_form?: Express.Multer.File[];
      non_disclosure_agreement?: Express.Multer.File[];
      health_declaration?: Express.Multer.File[];
      gst_declaration?: Express.Multer.File[];
      pan_card?: Express.Multer.File[];
      cancelled_cheque?: Express.Multer.File[];
    },
  ) {
    const errors: Record<string, string[]> = {};
    const pick = (k: string) => body?.[k] ?? (existing as any)?.[k];

    // All text fields mandatory except alternate_mobile and address_line_2 (per requirement)
    const requiredTextFields = [
      'name',
      'email',
      'mobile',
      'industry_category',
      'address_line_1',
      'pincode',
      'city',
      'state',
      'pan_number',
      'enrollment_date',
      'gst_registered',
      'lead_assessor',
      'assessor_grade',
      'emergency_contact_name',
      'emergency_mobile',
      'emergency_address_line_1',
      'emergency_city',
      'emergency_state',
      'emergency_pincode',
      'account_number',
      'ifsc_code',
    ];

    for (const field of requiredTextFields) {
      if (!this.requireNonEmpty(pick(field))) {
        errors[field] = [`${field} is required.`];
      }
    }

    // GST number is required only when GST registered = Yes/true/1
    const gstRegisteredRaw = pick('gst_registered');
    const gstRegistered = this.toBool(gstRegisteredRaw);
    if (gstRegistered && !this.requireNonEmpty(pick('gst_number'))) {
      errors.gst_number = ['gst_number is required when GST is Yes.'];
    }

    // Required documents (assessor flow)
    const requiredDocs = [
      'profile_image',
      'biodata',
      'vendor_registration_form',
      'non_disclosure_agreement',
      'health_declaration',
      'pan_card',
      'cancelled_cheque',
    ] as const;

    for (const docField of requiredDocs) {
      const hasNew = !!files?.[docField]?.[0];
      const hasExisting = this.requireNonEmpty((existing as any)?.[docField]);
      if (!hasNew && !hasExisting) {
        errors[docField] = [`${docField} document is required.`];
      }
    }

    // GST declaration required only when GST is Yes/true/1
    if (gstRegistered) {
      const docField = 'gst_declaration';
      const hasNew = !!files?.[docField]?.[0];
      const hasExisting = this.requireNonEmpty((existing as any)?.[docField]);
      if (!hasNew && !hasExisting) {
        errors[docField] = [`${docField} document is required when GST is Yes.`];
      }
    }

    if (Object.keys(errors).length) {
      throw new BadRequestException({ status: 'validations', errors });
    }
  }

  async getMyProfile(assessorId: string): Promise<any> {
    const row = await this.assessorModel.findById(assessorId).lean();
    if (!row) throw new NotFoundException({ status: 'error', message: 'Assessor not found' });
    return {
      status: 'success',
      message: 'Profile fetched successfully',
      data: {
        ...row,
        id: String((row as any)._id),
      },
    };
  }

  async updateMyProfile(
    assessorId: string,
    body: Record<string, any>,
    files?: {
      profile_image?: Express.Multer.File[];
      biodata?: Express.Multer.File[];
      vendor_registration_form?: Express.Multer.File[];
      non_disclosure_agreement?: Express.Multer.File[];
      health_declaration?: Express.Multer.File[];
      gst_declaration?: Express.Multer.File[];
      pan_card?: Express.Multer.File[];
      cancelled_cheque?: Express.Multer.File[];
    },
  ): Promise<any> {
    const assessor = await this.assessorModel.findById(assessorId);
    if (!assessor) throw new NotFoundException({ status: 'error', message: 'Assessor not found' });

    /** Mutable profile fields extend beyond strict `Assessor` typings (snake_case API + Mongo flexibility). */
    const a = assessor as unknown as AssessorDocument & Record<string, unknown>;

    // Strict validations for assessor self-submission.
    this.assertRequiredProfileFields(body, assessor, files);
    const email = String(body?.email ?? a.email ?? '').trim().toLowerCase();

    const bankInfo = await this.deriveBankDetails(
      body?.ifsc_code ?? a.ifsc_code,
      body?.bank_name ?? a.bank_name,
      body?.branch_name ?? a.branch_name,
    );

    a.name = String(body?.name ?? a.name ?? '').trim();
    a.email = email;
    a.mobile = String(body?.mobile ?? a.mobile ?? '').trim();
    a.status = String(body?.status ?? a.status ?? '1');

    a.industry_category = body?.industry_category ?? a.industry_category;
    a.alternate_mobile = body?.alternate_mobile ?? a.alternate_mobile;
    a.address_line_1 = body?.address_line_1 ?? a.address_line_1;
    a.address_line_2 = body?.address_line_2 ?? a.address_line_2;
    a.pincode = body?.pincode ?? a.pincode;
    a.city = body?.city ?? a.city;
    a.state = body?.state ?? a.state;
    a.pan_number = body?.pan_number ?? a.pan_number;
    a.enrollment_date = body?.enrollment_date ?? a.enrollment_date;

    if (body?.gst_registered !== undefined) a.gst_registered = this.toBool(body.gst_registered);
    a.gst_number = body?.gst_number ?? a.gst_number;
    if (body?.lead_assessor !== undefined) a.lead_assessor = this.toBool(body.lead_assessor);
    a.assessor_grade = body?.assessor_grade ?? a.assessor_grade;

    a.emergency_contact_name = body?.emergency_contact_name ?? a.emergency_contact_name;
    a.emergency_mobile = body?.emergency_mobile ?? a.emergency_mobile;
    a.emergency_address_line_1 = body?.emergency_address_line_1 ?? a.emergency_address_line_1;
    a.emergency_address_line_2 = body?.emergency_address_line_2 ?? a.emergency_address_line_2;
    a.emergency_city = body?.emergency_city ?? a.emergency_city;
    a.emergency_state = body?.emergency_state ?? a.emergency_state;
    a.emergency_pincode = body?.emergency_pincode ?? a.emergency_pincode;

    a.bank_name = bankInfo.bank_name;
    a.account_number = body?.account_number ?? a.account_number;
    a.branch_name = bankInfo.branch_name;
    a.ifsc_code = bankInfo.ifsc_code;

    a.profile_image = (await this.uploadField(files?.profile_image)) ?? a.profile_image;
    a.biodata = (await this.uploadField(files?.biodata)) ?? a.biodata;
    a.vendor_registration_form =
      (await this.uploadField(files?.vendor_registration_form)) ?? a.vendor_registration_form;
    a.non_disclosure_agreement =
      (await this.uploadField(files?.non_disclosure_agreement)) ?? a.non_disclosure_agreement;
    a.health_declaration = (await this.uploadField(files?.health_declaration)) ?? a.health_declaration;
    a.gst_declaration = (await this.uploadField(files?.gst_declaration)) ?? a.gst_declaration;
    a.pan_card = (await this.uploadField(files?.pan_card)) ?? a.pan_card;
    a.cancelled_cheque = (await this.uploadField(files?.cancelled_cheque)) ?? a.cancelled_cheque;

    const prev = (a.document_approvals || {}) as Record<
      string,
      { status?: string; remarks?: string }
    >;
    const docApprovals: Record<string, { status: string; remarks: string }> = {};
    for (const k of Object.keys(prev)) {
      const e = prev[k];
      docApprovals[k] = {
        status: String(e?.status || 'Pending'),
        remarks: String(e?.remarks ?? '').trim(),
      };
    }
    let reviewRequiredDocChanged = false;
    for (const key of ASSESSOR_PROFILE_DOCUMENT_KEYS) {
      if (files?.[key]?.[0]) {
        docApprovals[key] = { status: 'Pending', remarks: '' };
        if ((ASSESSOR_REVIEW_REQUIRED_DOCUMENT_KEYS as readonly string[]).includes(key)) {
          reviewRequiredDocChanged = true;
        }
      }
    }
    a.document_approvals = docApprovals;

    // Re-review only when one of the approval-required docs changes.
    if (reviewRequiredDocChanged) {
      a.approval_status = 'Pending';
      a.approval_remarks = '';
    }
    a.profile_status = 'Complete';

    await assessor.save();

    return {
      status: 'success',
      message: 'Profile submitted for approval',
      data: {
        id: assessor._id.toString(),
        approval_status: a.approval_status,
        profile_status: a.profile_status,
      },
    };
  }
}

