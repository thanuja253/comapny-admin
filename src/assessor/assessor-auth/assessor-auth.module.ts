import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessorAuthController } from './assessor-auth.controller';
import { AssessorAuthService } from './assessor-auth.service';
import { Assessor, AssessorSchema } from '../../company/schemas/assessor.schema';
import {
  CompanyAssessor,
  CompanyAssessorSchema,
} from '../../company/schemas/company-assessor.schema';
import {
  CompanyProject,
  CompanyProjectSchema,
} from '../../company/schemas/company-project.schema';
import { AssessorJwtStrategy } from './strategies/assessor-jwt.strategy';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('ASSESSOR_JWT_SECRET') ||
          configService.get<string>('JWT_SECRET') ||
          'your-secret-key',
        signOptions: {
          expiresIn:
            configService.get<string>('ASSESSOR_JWT_EXPIRES_IN') ||
            configService.get<string>('JWT_EXPIRES_IN') ||
            '7d',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Assessor.name, schema: AssessorSchema },
      { name: CompanyAssessor.name, schema: CompanyAssessorSchema },
      { name: CompanyProject.name, schema: CompanyProjectSchema },
    ]),
    MailModule,
  ],
  controllers: [AssessorAuthController],
  providers: [AssessorAuthService, AssessorJwtStrategy],
  exports: [AssessorAuthService],
})
export class AssessorAuthModule {}
