import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }
  async login(
    user: User,
  ): Promise<{ token: string; status: string; message: string }> {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { status: 'Success', message: 'Logged in successfully', token };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ email });
    if (user && (await User.comparePasswords(password, user.password))) {
      return user;
    }

    return null;
  }
}
