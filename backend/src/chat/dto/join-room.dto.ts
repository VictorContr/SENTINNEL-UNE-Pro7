import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class JoinRoomDto_sm_vc {
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