import { ForbiddenException, Injectable } from '@nestjs/common';
import { AbilityBuilder, ExtractSubjectType } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { UserWithRoles } from 'src/users/types/user.type';
import { PermissionsService } from 'src/permissions/permissions.service';
import { AppAbility, Action, AppSubjects } from './casl-ability.types';

@Injectable()
export class CaslAbilityFactory {
  constructor(private readonly permissionService: PermissionsService) {}

  async createForUser(user: UserWithRoles): Promise<AppAbility> {
    const permissions = await this.permissionService.getPermissionsForUser(
      user.id,
    );

    if (!permissions || permissions.length === 0) {
      throw new ForbiddenException(['FORBIDDEN_NO_PERMISSIONS']);
    }

    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    for (const permission of permissions) {
      const action = permission.action as Action;

      const subject = permission.subject as ExtractSubjectType<AppSubjects>;

      const conditions = permission.conditions
        ? this.resolveConditions(
            this.safeJsonParse(permission.conditions),
            user,
          )
        : undefined;

      const fields = permission.fields
        ? this.safeJsonParse(permission.fields)
        : undefined;

      can(action, subject, fields, conditions);
    }

    const ability = build();

    return ability;
  }

  private safeJsonParse(json: string | null): any {
    if (!json) return undefined;
    try {
      return JSON.parse(json);
    } catch {
      console.warn(`Failed to parse JSON: ${json}`);
      return undefined;
    }
  }

  private resolveConditions(conditions: any, user: any): any {
    const resolved: any = {};
    for (const key in conditions) {
      const value = conditions[key];
      if (typeof value === 'string' && value.startsWith('user.')) {
        const field = value.split('.')[1];
        resolved[key] = user[field];
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }
}
