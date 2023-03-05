import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role, Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RolesGuard, SessionGuard } from 'src/auth/utils/Guards';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(SessionGuard || JwtAuthGuard, RolesGuard) // use one of either sessionGuard or JWTGuard depending on preference
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return { status: 'Success', count: users.length, data: users };
  }
  @Get(':id')
  @Roles(Role.User, Role.Manager)
  async getUser(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const user = await this.usersService.getUser(id);
    return { status: 'Success', data: user };
  }
  @Patch(':id')
  updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }
  @Delete(':id')
  deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteUser(id);
  }
}
