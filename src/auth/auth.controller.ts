import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }

  @Get('logout')
  async logout() {
    return this.authService.logout();
  }
}
