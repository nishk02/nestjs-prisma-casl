import { PrismaClient, UserRole } from '@prisma/client';
import {
  Action,
  AppPrismaSubjects,
} from 'src/auth/factories/casl-ability/casl-ability.types';

type PermissionTemplate = {
  [S in keyof AppPrismaSubjects]: {
    action: Action;
    subject: S;
    fields?: Array<keyof AppPrismaSubjects[S]>;
    conditions?: Record<string, any>;
  };
}[keyof AppPrismaSubjects];

export const permissionsTemplate: Partial<
  Record<UserRole, PermissionTemplate[]>
> = {
  USER: [
    {
      action: 'read',
      subject: 'User',
      fields: [
        'uuid',
        'username',
        'email',
        'firstName',
        'lastName',
        'fullName',
        'phone',
        'address',
        'city',
        'state',
        'country',
        'zipCode',
        'birthDate',
        'profilePicture',
        'emailVerified',
      ],
      conditions: { id: 'user.id' },
    },
    {
      action: 'update',
      subject: 'User',
      fields: [
        'firstName',
        'lastName',
        'fullName',
        'phone',
        'address',
        'city',
        'state',
        'country',
        'zipCode',
        'birthDate',
        'profilePicture',
      ],
      conditions: { id: 'user.id' },
    },
    {
      action: 'read',
      subject: 'Post',
      fields: [
        'title',
        'content',
        'published',
        'authorId',
        'createdAt',
        'updatedAt',
      ],
      conditions: { authorId: 'user.id' },
    },
    {
      action: 'create',
      subject: 'Post',
      fields: ['title', 'content', 'published'],
    },
    {
      action: 'update',
      subject: 'Post',
      fields: ['title', 'content', 'published'],
      conditions: { authorId: 'user.id' },
    },
  ],
  ADMIN: [
    {
      action: 'manage',
      subject: 'User',
    },
    {
      action: 'manage',
      subject: 'Post',
    },
  ],
} as const;

export async function seed(prisma: PrismaClient, step: number): Promise<void> {
  console.log(`\n${step}: Seeding Permissions...`);
  for (const [roleName, permissions] of Object.entries(permissionsTemplate)) {
    // Find the role
    const role = await prisma.role.findUnique({
      where: { name: roleName as UserRole },
    });
    if (!role) {
      console.warn(
        `Role ${roleName} not found, skipping permission seeding for this role.`,
      );
      continue;
    }
    for (const permissionData of permissions) {
      const { action, subject, fields, conditions } = permissionData;
      // Upsert permission
      const permission = await prisma.permission.upsert({
        where: {
          // Compound unique constraint recommended for production
          // Here, fallback to first found
          id: (await findPermissionId(prisma, action, subject)) ?? -1,
        },
        create: {
          action,
          subject,
          fields: fields ? JSON.stringify(fields) : null,
          conditions: conditions ? JSON.stringify(conditions) : null,
        },
        update: {
          fields: fields ? JSON.stringify(fields) : null,
          conditions: conditions ? JSON.stringify(conditions) : null,
        },
      });
      // Link permission to role
      await prisma.roleToPermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
        update: {},
      });
    }
  }
  console.log('☑️ Seeding Permissions Completed\n');
}

async function findPermissionId(
  prisma: PrismaClient,
  action: Action,
  subject: string,
): Promise<number | null> {
  const permission = await prisma.permission.findFirst({
    where: { action, subject },
  });
  return permission?.id ?? null;
}
