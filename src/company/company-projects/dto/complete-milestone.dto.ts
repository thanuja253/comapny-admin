import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class CompleteMilestoneDto {
  @IsInt()
  @Min(1)
  @Max(24) // Updated to support all 24 milestones
  milestone_flow: number;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean = true;
}


