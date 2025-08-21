import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, Post } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import slug from 'slug';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { FindAllArgs } from 'src/common/dto/find-all.dto';
import { PaginatedResponseDto } from 'src/common/interface/http/http.interface';
import { AppAbility } from 'src/auth/factories/casl-ability/casl-ability.types';
import { UserWithRoles } from 'src/users/types/user.type';

@Injectable()
export class PostsService {
  private readonly select: Prisma.PostSelect = {
    uuid: true,
    title: true,
    slug: true,
    content: true,
    published: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: {
        uuid: true,
        firstName: true,
        lastName: true,
      },
    },
  };

  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createPostDto: CreatePostDto,
    user: UserWithRoles,
  ): Promise<Post> {
    try {
      return await this.prismaService.post.create({
        data: {
          ...createPostDto,
          slug: slug(createPostDto.title),
          author: {
            connect: { id: user.id },
          },
        },
        select: this.select,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(['POST_CREATION_FAILED']);
    }
  }

  async findAll(
    ability: AppAbility,
    args?: FindAllArgs<
      Prisma.PostOrderByWithRelationInput,
      Prisma.PostWhereInput,
      Prisma.PostSelect
    >,
  ): Promise<PaginatedResponseDto<Partial<Post>>> {
    const page = args?.page ?? 1;
    const take = args?.limit ?? 10;
    const skip = (page - 1) * take;

    const [posts, total] = await this.prismaService.$transaction([
      this.prismaService.client.post.findMany({
        skip,
        take,
        select: this.select,
        orderBy: args?.orderBy ?? { createdAt: 'desc' },
        where: {
          AND: [accessibleBy(ability, 'read').Post, args?.where ?? {}],
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      }),
      this.prismaService.client.post.count({
        where: {
          AND: [accessibleBy(ability, 'read').Post, args?.where ?? {}],
        },
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit: take,
      },
    };
  }

  async findOne(id: number, ability: AppAbility): Promise<Partial<Post>> {
    const post = await this.prismaService.client.post
      .findUnique({
        where: { id, AND: [accessibleBy(ability).Post] },
        select: this.select,
        cacheStrategy: {
          swr: 60,
          ttl: 60,
        },
      })
      .withAccelerateInfo();

    if (!post) {
      throw new NotFoundException(['POST_NOT_FOUND']);
    }

    return post as any;
  }

  async findOneByUuid(
    uuid: string,
    ability: AppAbility,
  ): Promise<Partial<Post>> {
    const post = await this.prismaService.client.post.findUnique({
      where: { uuid, AND: [accessibleBy(ability, 'read').Post] },
      select: this.select,
    });

    if (!post) {
      throw new NotFoundException(['POST_NOT_FOUND']);
    }

    return post;
  }

  async findOneBySlug(
    slug: string,
    ability: AppAbility,
  ): Promise<Partial<Post>> {
    const post = await this.prismaService.client.post.findUnique({
      where: { slug, AND: [accessibleBy(ability, 'read').Post] },
      select: this.select,
      cacheStrategy: {
        swr: 60,
        ttl: 60,
      },
    });

    if (!post) {
      throw new NotFoundException(['POST_NOT_FOUND']);
    }

    return post;
  }

  async update(
    uuid: string,
    updatePostDto: UpdatePostDto,
    ability: AppAbility,
  ): Promise<Partial<Post>> {
    const post = await this.findOneByUuid(uuid, ability);

    return await this.prismaService.client.post.update({
      where: { uuid: post.uuid },
      data: updatePostDto,
      select: this.select,
    });
  }

  async remove(id: number, ability: AppAbility): Promise<void> {
    await this.findOne(id, ability); // Ensure post exists

    await this.prismaService.client.post.delete({
      where: { id },
    });
  }
}
