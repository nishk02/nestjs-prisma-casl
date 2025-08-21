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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { FindAllDto } from 'src/common/dto/find-all.dto';
import { Prisma, User } from '@prisma/client';
import { PaginatedResponseDto } from 'src/common/interface/http/http.interface';
import { CheckPolicies } from 'src/auth/decorators/check-policies.decorator';
import { AuthAbility } from 'src/auth/decorators/auth-ability.decorator';
import { subject } from '@casl/ability';
import { AppAbility } from 'src/auth/factories/casl-ability/casl-ability.types';
import { AdminGuard } from 'src/auth/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CheckPolicies((ability) => ability.can('create', 'User'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('USER_CREATED')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @CheckPolicies((ability) => ability.can('read', 'User'))
  async findAll(
    @Query() query: FindAllDto<Prisma.UserOrderByWithRelationInput>,
  ): Promise<PaginatedResponseDto<Partial<User>>> {
    const { page, limit, filters, orderBy } = query;
    const where = JSON.parse(filters || '{}');
    return this.usersService.findAll({
      page,
      limit,
      where,
      orderBy: orderBy ?? { createdAt: 'asc' }, // Default ordering by createdAt
    });
  }

  @Get(':uuid')
  @CheckPolicies((ability) => ability.can('read', 'User'))
  async findOne(
    @AuthAbility() ability: AppAbility,
    @Param('uuid') uuid: string,
  ) {
    if (!ability.can('read', subject('User', { uuid: uuid }))) {
      throw new ForbiddenException(['FORBIDDEN']);
    }
    return this.usersService.findOne(uuid);
  }

  @Patch(':uuid')
  @CheckPolicies((ability) => ability.can('update', 'User'))
  @ResponseMessage('USER_UPDATED')
  async update(
    @AuthAbility() ability: AppAbility,
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!ability.can('update', subject('User', { uuid: uuid }))) {
      throw new ForbiddenException(['FORBIDDEN']);
    }
    return this.usersService.update(uuid, updateUserDto);
  }

  @Delete(':uuid')
  @UseGuards(AdminGuard)
  @CheckPolicies((ability) => ability.can('delete', 'User'))
  @ResponseMessage('USER_DELETED')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('uuid') uuid: string) {
    return this.usersService.remove(uuid);
  }
}
