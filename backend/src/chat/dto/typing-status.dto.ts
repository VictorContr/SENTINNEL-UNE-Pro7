import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class TypingStatusDto_sm_vc {
  @IsBoolean()
  isTyping_sm_vc: boolean;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  estudianteId_sm_vc: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  materiaId_sm_vc?: number;
}