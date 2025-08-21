import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import {
  AuthTokens,
  JwtAccessTokenPayload,
  LoginDto,
  TokenRenewDto,
} from './dto/auth.dto';
import { CryptService } from 'src/common/services/crypt/crypt.service';
import { User } from '@prisma/client';
import { SignUpUserDto } from 'src/users/dto/create-user.dto';
import { UserWithRoles } from 'src/users/types/user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cryptService: CryptService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Login a user
   * @param loginDto The login credentials
   * @returns The JWT tokens
   */
  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }
    return this.generateJwtTokens(user.uuid as string);
  }

  /**
   * Sign up a new user
   * @param signUpUserDto The user details for signing up
   * @returns The created user
   */
  async register(signUpUserDto: SignUpUserDto): Promise<any> {
    return this.usersService.create(signUpUserDto);
  }

  /**
   * Validate user credentials
   * @param loginDto The login credentials
   * @returns The user if valid, null otherwise
   */
  async validateUser(loginDto: LoginDto): Promise<Partial<User> | null> {
    const user = await this.usersService.findByEmail(loginDto.email, true);
    if (!user?.password) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }
    const isPasswordValid = await this.cryptService.comparePasswords(
      loginDto.password,
      user.password,
    );
    return isPasswordValid ? user : null;
  }

  /**
   * Generate JWT tokens
   * @param payload The payload to include in the JWT.
   * @returns An object containing the access token and refresh token.
   */
  private async generateJwtTokens(
    sub: string,
    rt?: string,
  ): Promise<AuthTokens> {
    const user = await this.usersService.findOne(sub, true);
    const payload: JwtAccessTokenPayload = { sub, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_AT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_AT_EXP_TIME') ?? '15m', // Short expiry
    });
    let refreshToken: string;
    if (!rt) {
      if (!this.configService.get<string>('JWT_RT_SECRET')) {
        throw new Error(
          'JWT_REFRESH_SECRET is not defined in the environment variables',
        );
      }
      refreshToken = await this.jwtService.signAsync(
        { sub: payload.sub },
        {
          secret: this.configService.get<string>('JWT_RT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_RT_EXP_TIME') ?? '7d', // Longer expiry
        },
      );
    } else {
      refreshToken = rt;
    }
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh JWT tokens
   * @param tokenRenewDto The DTO containing the token to be renewed
   * @returns The new JWT tokens
   */
  async refreshToken(tokenRenewDto: TokenRenewDto): Promise<AuthTokens> {
    const { token } = tokenRenewDto;
    try {
      const { sub } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_RT_SECRET'),
      });
      return this.generateJwtTokens(sub, token);
    } catch (error) {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }
  }

  // /**
  //  * Find all permissions of a user.
  //  * @param user The user to find permissions for.
  //  * @returns The user's permissions.
  //  */
  // async findAllPermissionsOfUser(user: UserWithRoles) {
  //   return this.usersService.findAllPermissionsOfUser(user);
  // }
}
