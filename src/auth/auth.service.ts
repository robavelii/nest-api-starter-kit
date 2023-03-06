import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Email } from 'src/utils/email-config.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    let user = this.usersRepository.create(createUserDto);

    const emailToken = await user.createEmailVerificationCode();

    try {
      await new Email(user).sendEmailVerificationCode(emailToken);
    } catch (error) {
      throw new HttpException(
        `Couldn't send Email ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    user = await this.usersRepository.save(user);
    return user;
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
