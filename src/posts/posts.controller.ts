import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { FindAllDto } from 'src/common/dto/find-all.dto';
import { Prisma, Post as P } from '@prisma/client';
import { PaginatedResponseDto } from 'src/common/interface/http/http.interface';
import { CheckPolicies } from 'src/auth/decorators/check-policies.decorator';
import { AuthAbility } from 'src/auth/decorators/auth-ability.decorator';
import { subject } from '@casl/ability';
import { AppAbility } from 'src/auth/factories/casl-ability/casl-ability.types';
import { AdminGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserWithRoles } from 'src/users/types/user.type';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'Post'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('POST_CREATED')
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: UserWithRoles,
  ) {
    return this.postsService.create(createPostDto, user);
  }

  @Get()
  @CheckPolicies((ability) => ability.can('read', 'Post'))
  async findAll(
    @Query() query: FindAllDto<Prisma.PostOrderByWithRelationInput>,
    @AuthAbility() ability: AppAbility,
  ): Promise<PaginatedResponseDto<Partial<P>>> {
    const { page, limit, filters, orderBy } = query;
    const where = JSON.parse(filters || '{}');
    return this.postsService.findAll(ability, {
      page,
      limit,
      where,
      orderBy: orderBy ?? { createdAt: 'asc' },
    });
  }

  @Get(':slug')
  @CheckPolicies((ability) => ability.can('read', 'Post'))
  async findBySlug(
    @AuthAbility() ability: AppAbility,
    @Param('slug') slug: string,
  ) {
    return this.postsService.findOneBySlug(slug, ability);
  }

  @Patch(':uuid')
  @CheckPolicies((ability) => ability.can('update', 'Post'))
  @ResponseMessage('POST_UPDATED')
  async update(
    @AuthAbility() ability: AppAbility,
    @Param('uuid') uuid: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(uuid, updatePostDto, ability);
  }

  @Delete(':uuid')
  @UseGuards(AdminGuard)
  @CheckPolicies((ability) => ability.can('delete', 'Post'))
  @ResponseMessage('POST_DELETED')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number, @AuthAbility() ability: AppAbility) {
    return this.postsService.remove(id, ability);
  }
}
