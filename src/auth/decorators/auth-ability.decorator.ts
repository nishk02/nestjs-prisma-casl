import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppAbility } from '../factories/casl-ability/casl-ability.types';

export const AuthAbility = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ability as AppAbility;
  },
);
