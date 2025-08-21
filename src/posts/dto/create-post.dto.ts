import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(3, {
    message: 'Title must be at least 3 characters long',
    context: { code: 'TITLE_TOO_SHORT', minLength: 3, maxLength: 120 },
  })
  @MaxLength(120, {
    message: 'Title must be at most 120 characters long',
    context: { code: 'TITLE_TOO_LONG', minLength: 3, maxLength: 120 },
  })
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean = false;
}
