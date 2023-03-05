import { Body, Controller, Get, HttpCode, Post, Request } from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Request as ERequest } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @HttpCode(201)
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.createUser(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Request() req: ERequest & { user: User },
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ token: string; status: string }> {
    return await this.authService.login(req.user);
  }

  @Get('logout')
  @HttpCode(200)
  async logout(@Request() req) {
    req.session.destroy();
    return { status: 'Sucess', message: 'Logged out successfully' };
  }
}
