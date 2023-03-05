import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  createUser(createUserDto: CreateUserDto) {
    return 'This will add a new user';
  }
  getAllUsers() {
    return 'This will return all users';
  }
  getUser(id: string) {
    return 'This will return a user';
  }
  updateUser(id: string, updateUserDto: UpdateUserDto) {
    return `This will update ${id} user details`;
  }
  deleteUser(id: string) {
    return 'This will delete a new';
  }
}
