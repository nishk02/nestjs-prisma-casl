import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from '../guards/policies.guard';

export const CHECK_POLICIES_KEY = 'check-policies';
export const CheckPolicies = (...args: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, args);
