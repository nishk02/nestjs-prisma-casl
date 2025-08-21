import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, TokenRenewDto } from './dto/auth.dto';
import { LocalAuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { SignUpUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpUserDto: SignUpUserDto) {
    return this.authService.register(signUpUserDto);
  }

  @Post('token')
  @Public()
  async refreshToken(@Body() tokenRenewDto: TokenRenewDto) {
    return this.authService.refreshToken(tokenRenewDto);
  }
}
