import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { CryptService } from 'src/common/services/crypt/crypt.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  AdminGuard,
  JwtAuthGuard,
  LocalAuthGuard,
} from 'src/auth/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { CaslAbilityFactory } from './factories/casl-ability/casl-ability.factory';
import { PoliciesGuard } from './guards/policies.guard';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        if (!configService.get<string>('JWT_AT_SECRET')) {
          throw new Error(
            'JWT_AT_SECRET is not defined in the environment variables',
          );
        }
        return {
          secret: configService.get<string>('JWT_AT_SECRET'),
          signOptions: {
            expiresIn:
              configService.get<string>('JWT_AT_EXPIRATION_TIME') ?? '15m',
          },
        };
      },
      inject: [ConfigService],
    }),
    PermissionsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CryptService,
    LocalStrategy,
    JwtStrategy,
    LocalAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
    CaslAbilityFactory,
    AdminGuard,
  ],
  exports: [AuthService, JwtModule, CaslAbilityFactory],
})
export class AuthModule {}
