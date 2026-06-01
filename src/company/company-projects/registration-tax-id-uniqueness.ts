import { BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { CompanyProjectDocument } from '../schemas/company-project.schema';

export type RegistrationTaxIdField =
  | 'pan_number'
  | 'gstin'
  | 'tan_no'
  | 'cin_number'
  | 'registration_number';

export type RegistrationTaxIds = Partial<Record<RegistrationTaxIdField, string>>;

export type RegistrationTaxIdConflict = {
  field: RegistrationTaxIdField;
  value: string;
  projectId: string;
  companyId: string;
};

type TaxIdFieldConfig = {
  field: RegistrationTaxIdField;
  dtoKeys: readonly string[];
  dbPaths: readonly string[];
  label: string;
};

const TAX_ID_FIELD_CONFIG: readonly TaxIdFieldConfig[] = [
  {
    field: 'pan_number',
    dtoKeys: ['pan_number', 'pan_no', 'panNumber'],
    dbPaths: ['registration_info.pan_number', 'registration_info.pan_no'],
    label: 'PAN',
  },
  {
    field: 'gstin',
    dtoKeys: ['gstin', 'gstin_no', 'gstinNo'],
    dbPaths: ['registration_info.gstin', 'registration_info.gstin_no'],
    label: 'GSTIN',
  },
  {
    field: 'tan_no',
    dtoKeys: ['tan_no', 'tanNo'],
    dbPaths: ['registration_info.tan_no'],
    label: 'TAN',
  },
  {
    field: 'cin_number',
    dtoKeys: ['cin_number', 'cinNumber'],
    dbPaths: ['registration_info.cin_number'],
    label: 'CIN',
  },
  {
    field: 'registration_number',
    dtoKeys: ['registration_number', 'registrationNumber'],
    dbPaths: ['registration_info.registration_number'],
    label: 'Registration number',
  },
];

function normalizeTaxIdValue(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s === '' ? undefined : s.toUpperCase();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Pull canonical tax/registration ids from merged registration payload (snake + legacy aliases). */
export function extractRegistrationTaxIdsFromDto(
  data: Record<string, unknown>,
): RegistrationTaxIds {
  const out: RegistrationTaxIds = {};
  for (const cfg of TAX_ID_FIELD_CONFIG) {
    for (const key of cfg.dtoKeys) {
      const normalized = normalizeTaxIdValue(data[key]);
      if (normalized) {
        out[cfg.field] = normalized;
        break;
      }
    }
  }
  return out;
}

export type FindRegistrationTaxIdConflictsOptions = RegistrationTaxIds & {
  excludeProjectId: string;
  excludeCompanyId: string;
};

/** Other companies' projects that already use the same registration tax id. */
export async function findRegistrationTaxIdConflicts(
  projectModel: Model<CompanyProjectDocument>,
  options: FindRegistrationTaxIdConflictsOptions,
): Promise<RegistrationTaxIdConflict[]> {
  const { excludeProjectId, excludeCompanyId, ...taxIds } = options;
  if (!Types.ObjectId.isValid(excludeProjectId) || !Types.ObjectId.isValid(excludeCompanyId)) {
    return [];
  }

  const excludeProjectOid = new Types.ObjectId(excludeProjectId);
  const excludeCompanyOid = new Types.ObjectId(excludeCompanyId);
  const conflicts: RegistrationTaxIdConflict[] = [];

  for (const cfg of TAX_ID_FIELD_CONFIG) {
    const value = taxIds[cfg.field];
    if (!value) continue;

    const matchClause = cfg.dbPaths.map((path) => ({
      [path]: { $regex: `^${escapeRegex(value)}$`, $options: 'i' },
    }));

    const existing = await projectModel
      .findOne({
        _id: { $ne: excludeProjectOid },
        company_id: { $ne: excludeCompanyOid },
        $or: matchClause,
      })
      .select('_id company_id')
      .lean()
      .exec();

    if (existing) {
      conflicts.push({
        field: cfg.field,
        value,
        projectId: String(existing._id),
        companyId: String(existing.company_id),
      });
    }
  }

  return conflicts;
}

export function throwIfRegistrationTaxIdConflicts(conflicts: RegistrationTaxIdConflict[]): void {
  if (!conflicts.length) return;

  const errors: Record<string, string[]> = {};
  const labels: string[] = [];

  for (const c of conflicts) {
    const cfg = TAX_ID_FIELD_CONFIG.find((x) => x.field === c.field);
    const label = cfg?.label ?? c.field;
    labels.push(label);
    const msg = `${label} is already registered on another company account.`;
    errors[c.field] = errors[c.field] ? [...errors[c.field], msg] : [msg];
  }

  throw new BadRequestException({
    status: 'error',
    message:
      labels.length === 1
        ? `${labels[0]} is already registered on another company account.`
        : 'One or more tax/registration numbers are already registered on another company account.',
    errors,
  });
}
