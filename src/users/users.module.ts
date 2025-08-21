import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CryptService } from 'src/common/services/crypt/crypt.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, CryptService],
  exports: [UsersService],
})
export class UsersModule {}
