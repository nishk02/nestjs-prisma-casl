import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';

/**
 * Provides methods for hashing passwords, comparing passwords,
 * generating secure tokens, and hashing tokens using environment variables.
 */
@Injectable()
export class CryptService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Hash a password using bcrypt with a configurable salt rounds and pepper.
   * @param password The password to hash.
   * @returns The hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS') ?? '12',
      10,
    );
    const pepper = this.configService.get<string>('BCRYPT_PASSWORD_PEPPER');
    if (!pepper) {
      throw new Error(
        'BCRYPT_PASSWORD_PEPPER is not defined in the environment variables',
      );
    }
    return await bcrypt.hash(password + pepper, saltRounds);
  }

  /**
   * Compare a plain password with a hashed password.
   * @param password The plain password to compare.
   * @param hashedPassword The hashed password to compare against.
   * @returns True if the passwords match, false otherwise.
   */
  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const pepper = this.configService.get<string>('BCRYPT_PASSWORD_PEPPER');
    if (!pepper) {
      throw new Error(
        'BCRYPT_PASSWORD_PEPPER is not defined in the environment variables',
      );
    }
    return await bcrypt.compare(password + pepper, hashedPassword);
  }

  /**
   * Generate a secure verification token.
   * This can be used for email verification or password reset links.
   * @returns A secure token.
   */
  generateVerificationToken(): string {
    const tokenSecret = this.configService.get<string>('TOKEN_SECRET');
    if (!tokenSecret) {
      throw new Error(
        'TOKEN_SECRET is not defined in the environment variables',
      );
    }
    return createHmac('sha256', tokenSecret)
      .update(Math.random().toString())
      .digest('hex');
  }

  /**
   * Hash a token using a secret key.
   * This can be used to securely store tokens in the database.
   * @param token The token to hash.
   * @returns The hashed token.
   */
  hashToken(token: string): string {
    const tokenSecret = this.configService.get<string>('TOKEN_SECRET');
    if (!tokenSecret) {
      throw new Error(
        'TOKEN_SECRET is not defined in the environment variables',
      );
    }
    return createHmac('sha256', tokenSecret).update(token).digest('hex');
  }
}
