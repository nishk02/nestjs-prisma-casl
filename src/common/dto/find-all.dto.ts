import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FindAllDto<T> {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  filters?: string;

  @IsOptional()
  orderBy?: T | T[];
}

export interface FindAllArgs<T, W, S> {
  page: number;
  limit: number;
  orderBy?: T | T[];
  where?: W;
  select?: S;
}
