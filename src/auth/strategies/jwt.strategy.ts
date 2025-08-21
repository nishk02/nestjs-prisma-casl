import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { JwtAccessTokenPayload } from '../dto/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    protected readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_AT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_AT_SECRET is not defined in the environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtAccessTokenPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException(['INVALID_TOKEN']);
    }
    const user = await this.userService.findOne(payload.sub, true);
    if (!user) {
      throw new UnauthorizedException(['USER_NOT_FOUND']);
    }
    return {
      ...payload,
      ...user,
    };
  }
}
