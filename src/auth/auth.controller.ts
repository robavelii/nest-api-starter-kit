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
  Request,
  Patch,
} from '@nestjs/common';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Request as ERequest, Response } from 'express';
import { AuthenticatedRequest } from 'src/users/dto/user.interface';
import { EmailDto } from '../users/dto/email.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
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
  login_session(@Req() req: ERequest, @Res() res: Response) {
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

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() email: EmailDto) {
    return this.authService.forgotPassword(email);
  }

  @Post('resend-forgot-password')
  @HttpCode(200)
  async resendForgotPassword(@Body() email: EmailDto) {
    return this.authService.forgotPassword(email);
  }

  @Patch('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(200)
  async changePassword(
    @Request() req: ERequest & { user: User },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user, changePasswordDto);
  }

  @UseGuards(SessionGuard)
  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    // req.session.destroy();
    req.logout((err) => {
      return err
        ? res.send(400)
        : res.send({ status: 'Sucess', message: 'Logged out successfully' });
    });
  }
}
