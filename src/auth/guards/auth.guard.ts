// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromRequest(request);
//     if (!token) {
//       throw new UnauthorizedException('UNAUTHORIZED');
//     }

//     try {
//       const payload = await this.jwtService.verifyAsync(token, {
//         secret: this.configService.get<string>('JWT_AT_SECRET'),
//       });
//       request.user = payload;
//     } catch (error) {
//       throw new UnauthorizedException('UNAUTHORIZED');
//     }

//     return true;
//   }

//   private extractTokenFromRequest(request: Request): string | undefined {
//     const [type, token] = request.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { UserWithRoles } from 'src/users/types/user.type';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Override the `canActivate` method to check for public routes
   * @param context The execution context
   * @returns true if the route is public or if the JWT is valid
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  /**
   * Used to protect admin routes
   * Check if the user has admin role
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserWithRoles = request.user;

    if (
      !user ||
      !user.userRoles?.some(
        (userRole) => userRole.role?.name === UserRole.ADMIN,
      )
    ) {
      throw new ForbiddenException('FORBIDDEN');
    }
    return true;
  }
}
