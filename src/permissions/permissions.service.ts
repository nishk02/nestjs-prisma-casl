import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createPermissionDto: CreatePermissionDto) {
    return 'This action adds a new permission';
  }

  findAll() {
    return `This action returns all permissions`;
  }

  async getPermissionsForUser(userId: number): Promise<Permission[]> {
    const userWithRolesAndPermissions =
      await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!userWithRolesAndPermissions) {
      throw new NotFoundException(['USER_NOT_FOUND']);
    }

    const permissions = userWithRolesAndPermissions.userRoles.flatMap(
      (userRole) => userRole.role.rolePermissions.map((rp) => rp.permission),
    );

    return permissions;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
