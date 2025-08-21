import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserWithRoles } from 'src/users/types/user.type';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserWithRoles;
  },
);
