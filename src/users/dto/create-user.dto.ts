import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
    context: { code: 'PASSWORD_TOO_SHORT', minLength: 8, maxLength: 64 },
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
    context: { code: 'PASSWORD_NO_UPPERCASE' },
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
    context: { code: 'PASSWORD_NO_NUMBER' },
  })
  @Matches(/(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?])/, {
    message: 'Password must contain at least one special character',
    context: { code: 'PASSWORD_NO_SPECIAL_CHARACTER' },
  })
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'First name can only contain letters',
    context: { code: 'FIRST_NAME_INVALID_CHARACTERS' },
  })
  @MinLength(2, {
    message: 'First name must be at least 2 characters long',
    context: { code: 'FIRST_NAME_TOO_SHORT', minLength: 2, maxLength: 30 },
  })
  @MaxLength(30, {
    message: 'First name must be at most 30 characters long',
    context: { code: 'FIRST_NAME_TOO_LONG', minLength: 2, maxLength: 30 },
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Last name can only contain letters',
    context: { code: 'LAST_NAME_INVALID_CHARACTERS' },
  })
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  @MinLength(10, {
    message: 'Phone number must be at least 10 digits long',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  birthDate?: Date;
}

export class CreateUserDto extends SignUpUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
    context: { code: 'USERNAME_INVALID_CHARACTERS' },
  })
  @MinLength(3, {
    message: 'Username must be at least 3 characters long',
    context: { code: 'USERNAME_TOO_SHORT', minLength: 3, maxLength: 30 },
  })
  @MaxLength(30, {
    message: 'Username must be at most 30 characters long',
    context: { code: 'USERNAME_TOO_LONG', minLength: 3, maxLength: 30 },
  })
  username?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}