import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from '../../schemas/company.schema';
import { isProposalDocumentWritePath } from '../proposal-document-write-path.util';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = String(request?.method || '').toUpperCase();
    const path = String(request?.path || request?.url || '');
    if (['POST', 'PUT', 'PATCH'].includes(method) && isProposalDocumentWritePath(path)) {
      return true;
    }

    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Unauthorized. Please check your credentials.',
      });
    }

    const company = await this.companyModel.findById(user.userId);

    if (!company) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Unauthorized. Please check your credentials.',
      });
    }

    if (company.account_status !== '1') {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Account In-Active! Please Contact Greenco Team.',
      });
    }

    // Note: The API spec mentions "disapproved" status, but the schema only has account_status
    // If you need a separate disapproved status, you'll need to add it to the schema
    // For now, we'll treat account_status !== '1' as inactive/disapproved

    return true;
  }
}

