import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assessor, AssessorDocument } from '../../../company/schemas/assessor.schema';

@Injectable()
export class AssessorJwtStrategy extends PassportStrategy(
  Strategy,
  'assessor-jwt',
) {
  constructor(
    @InjectModel(Assessor.name) private assessorModel: Model<AssessorDocument>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('ASSESSOR_JWT_SECRET') ||
        configService.get<string>('JWT_SECRET') ||
        'your-secret-key',
    });
  }

  async validate(payload: any) {
    const assessor = await this.assessorModel.findById(payload.sub);
    if (!assessor || assessor.status !== '1') {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Unauthorized. Please check your credentials.',
      });
    }
    return { userId: assessor._id.toString(), email: assessor.email, role: 'assessor' };
  }
}
