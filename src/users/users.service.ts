import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const customers: CreateUserDto[] = [
  { id: 1, email: 'rob@rob.com', name: 'rob' },
  { id: 2, email: 'rob1@rob.com', name: 'rob1' },
  { id: 3, email: 'rob2@rob.com', name: 'rob2' },
  { id: 4, email: 'rob3@rob.com', name: 'rob3' },
];
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  createUser(createUserDto: CreateUserDto) {
    return customers.push(createUserDto);
  }
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return users;
  }
  getUser(id: number) {
    return customers.find((cus) => cus.id === id);
  }
  updateUser(id: number, updateUserDto: UpdateUserDto) {
    return `This will update ${id} user details`;
  }
  deleteUser(id: number) {
    return customers.filter((cus) => cus.id !== id);
  }
}
