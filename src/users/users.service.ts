import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { FindAllArgs } from 'src/common/dto/find-all.dto';
import { PaginatedResponseDto } from 'src/common/interface/http/http.interface';
import { CryptService } from 'src/common/services/crypt/crypt.service';
import { UserWithRoles } from './types/user.type';

@Injectable()
export class UsersService {
  private readonly safeSelect: Prisma.UserSelect = {
    uuid: true,
    email: true,
    firstName: true,
    lastName: true,
    fullName: true,
    phone: true,
    address: true,
    city: true,
    state: true,
    country: true,
    zipCode: true,
    birthDate: true,
    profilePicture: true,
  };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptService: CryptService,
  ) {}

  /**
   * Create a new user.
   * @param createUserDto The data to create a new user.
   * @returns The created user.
   */
  async create(createUserDto: CreateUserDto): Promise<UserWithRoles> {
    // Check for existing user and role in parallel
    const [existingUser, userRole] = await Promise.all([
      this.prismaService.user.findUnique({
        where: { email: createUserDto.email },
      }),
      this.prismaService.role.findUnique({
        where: { name: UserRole.USER },
      }),
    ]);

    if (existingUser) {
      throw new ConflictException(['EMAIL_ALREADY_EXISTS']);
    }
    if (!userRole) {
      throw new InternalServerErrorException(['DEFAULT_USER_ROLE_NOT_FOUND']);
    }

    const hashedPassword = await this.cryptService.hashPassword(
      createUserDto.password,
    );

    try {
      const user = await this.prismaService.$transaction(async (prisma) => {
        return await prisma.user.create({
          data: {
            ...createUserDto,
            password: hashedPassword,
            userRoles: {
              create: {
                roleId: userRole.id,
              },
            },
          },
          select: {
            ...this.safeSelect,
            userRoles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
      });
      return user;
    } catch {
      throw new InternalServerErrorException(['USER_CREATION_FAILED']);
    }
  }

  /**
   * Find all users with pagination and filtering.
   * @param args The arguments for pagination, filtering, and ordering.
   * @return A paginated response containing users and metadata.
   */
  async findAll(
    args?: FindAllArgs<
      Prisma.UserOrderByWithRelationInput,
      Prisma.UserWhereInput,
      Prisma.UserSelect
    >,
  ): Promise<PaginatedResponseDto<Partial<User>>> {
    const page = args?.page ?? 1;
    const take = args?.limit ?? 10;
    const skip = (page - 1) * take;

    const [users, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        skip,
        take,
        select: this.safeSelect,
        orderBy: args?.orderBy ?? { createdAt: 'asc' },
        where: args?.where ?? {},
      }),
      this.prismaService.user.count({
        where: args?.where ?? {},
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit: take,
      },
    };
  }

  /**
   * Find a user by UUID.
   * @param uuid The UUID of the user to find.
   * @returns The found user with roles, or null if not found.
   */
  async findOne(uuid: string, id = false): Promise<UserWithRoles> {
    const user = await this.prismaService.user.findUnique({
      where: { uuid },
      select: {
        ...{
          ...this.safeSelect,
          ...(id && { id: true }),
        },
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(['USER_NOT_FOUND']);
    }
    return user;
  }

  /**
   * Find a user by `email`.
   * @param email The email of the user to find.
   * @returns The found user.
   */
  async findByEmail(
    email: string,
    password = false,
  ): Promise<Partial<User> | null> {
    return await this.prismaService.user.findUnique({
      where: { email },
      select: { ...this.safeSelect, ...(password && { password: true }) },
    });
  }

  /**
   * Update a user by ID.
   * @param id The ID of the user to update.
   * @param updateUserDto The data to update the user.
   * @returns The updated user.
   */
  async update(
    uuid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    return await this.prismaService.user.update({
      where: { uuid },
      data: updateUserDto,
      select: this.safeSelect,
    });
  }

  /**
   * Remove a user by ID.
   * @param id The ID of the user to remove.
   * @returns The removed user.
   */
  async remove(uuid: string): Promise<void> {
    // Ensure the user exists before attempting to delete
    const user = await this.prismaService.user.findUnique({
      where: { uuid },
      select: this.safeSelect,
    });
    if (!user) {
      throw new NotFoundException(['USER_NOT_FOUND']);
    }
    // Instead of returning the user, just delete it
    await this.prismaService.user.delete({
      where: { uuid },
    });
  }
}
