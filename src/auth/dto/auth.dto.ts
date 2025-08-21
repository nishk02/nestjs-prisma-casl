import { IsEmail, IsJWT, IsString, MinLength } from 'class-validator';
import { JwtPayload } from 'jsonwebtoken';

/**
 * DTO for user login
 * @property email - The user's email address
 * @property password - The user's password
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

/**
 * Interface for JWT tokens
 * @property refreshToken - The refresh token
 * @property accessToken - The access token
 */
export interface AuthTokens {
  refreshToken: string;
  accessToken: string;
}

/**
 * DTO for renewing tokens
 * @property token - The JWT token to be renewed
 */
export class TokenRenewDto {
  @IsJWT()
  @IsString()
  token: string;
}

/**
 * Interface for the JWT access token payload
 * @property email - The email of the user
 * @extends JwtPayload
 */
export interface JwtAccessTokenPayload extends JwtPayload {
  email?: string;
  roleId?: string;
  roleName?: string;
}
