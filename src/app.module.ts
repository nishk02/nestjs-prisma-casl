import { Module, ValidationPipe } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response/response.interceptor';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { CryptService } from './common/services/crypt/crypt.service';
import { PermissionsModule } from './permissions/permissions.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PermissionsModule,
    UsersModule,
    PostsModule,
  ],
  providers: [
    CryptService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
