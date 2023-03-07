import { HttpStatus } from '@nestjs/common/enums';
import {
  JwtAuthGuard,
  LocalAuthGuard,
  RolesGuard,
  SessionGuard,
} from 'src/auth/utils/Guards';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  Res,
  Req,
} from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
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
    @Body() loginDto: LoginUserDto,
  ): Promise<{ token: string; status: string }> {
    return await this.authService.login(loginDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login-local')
  login_local(@Res() res: Response) {
    res.status(HttpStatus.OK).json({ message: 'Login Successful' });
  }

  @UseGuards(SessionGuard)
  @Get('status')
  login_session(@Req() req: Request, @Res() res: Response) {
    res.status(HttpStatus.OK).send({ status: 'Success', user: req.user });
  }

  @Post('verify/:token')
  @HttpCode(200)
  async confirmEmail(
    @Param('token') token: string,
  ): Promise<{ status: string; user: object; jwt: string }> {
    return this.authService.confirmEmail(token);
  }

  @Post('resend-code')
  @HttpCode(200)
  async resendVerification(@Body() email) {
    return this.authService.resendVerification(email);
  }

  // @Get('logout')
  // @HttpCode(200)
  // async logout(@Request() req) {
  //   req.session.destroy();
  //   return { status: 'Sucess', message: 'Logged out successfully' };
  // }
}
