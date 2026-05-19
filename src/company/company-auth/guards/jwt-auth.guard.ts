import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isProposalDocumentWritePath } from '../proposal-document-write-path.util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const method = String(request?.method || '').toUpperCase();
    const path = String(request?.path || request?.url || '');
    if (['POST', 'PUT', 'PATCH'].includes(method) && isProposalDocumentWritePath(path)) {
      return true;
    }

    return super.canActivate(context);
  }
}



