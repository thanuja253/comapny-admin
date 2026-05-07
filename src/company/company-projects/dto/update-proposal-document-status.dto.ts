import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/** Company accepts (1) or rejects (2) the proposal PDF; remarks required when rejecting. */
export class UpdateProposalDocumentStatusDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsIn([1, 2])
  proposal_status: number;

  @IsOptional()
  @IsString()
  proposal_remarks?: string;
}
