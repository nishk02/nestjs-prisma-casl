import { PureAbility } from '@casl/ability';
import { Subjects, PrismaQuery } from '@casl/prisma';
import { Post, User } from '@prisma/client';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

export type AppPrismaSubjects = {
  User: Partial<User>;
  Post: Partial<Post>;
};

export type AppSubjects = Subjects<AppPrismaSubjects> | 'all';

export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>;
