import * as crypto from 'crypto';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Email } from 'src/utils/email-config.utils';
import { EmailDto } from 'src/users/dto/email.dto';
import { UserInformation } from 'src/users/dto/user.interface';

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

  async confirmEmail(
    token: string,
  ): Promise<{ status: string; user: object; jwt: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersRepository.findOneBy({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: MoreThanOrEqual(new Date(Date.now())),
    });

    if (!user) {
      throw new HttpException(
        'Token invalid or expired',
        HttpStatus.UNAUTHORIZED,
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;

    await user.save();

    const jwt = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { status: 'Sucess', user, jwt };
  }

  async resendVerification({ email }: EmailDto) {
    const user = await this.usersRepository.findOneBy({
      email,
      isEmailVerified: false,
    });

    if (!user) {
      throw new HttpException(
        "User doesn't exsist or Email already Verified",
        HttpStatus.NOT_FOUND,
      );
    }
    const emailToken = await user.createEmailVerificationCode();

    await user.save();

    try {
      await new Email(user).sendEmailVerificationCode(emailToken);
    } catch (error) {
      throw new HttpException(
        `Couldn't send email ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { status: 'Success', message: 'Verification Code sent', user };
  }
  async login(
    user: UserInformation,
  ): Promise<{ token: string; status: string }> {
    try {
      const found = await this.validateUser(user.email, user.password);
      if (found) {
        const token = await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
          role: user.role,
        });
        return { status: 'success', token };
      } else {
        throw new HttpException(
          'Login Failed, Invalid Credentials',
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Login Failed, Invalid Credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
  // async login(
  //   user: UserInformation,
  // ): Promise<{ status: string; token: string }> {
  //   try {
  //     const found = await this.usersRepository.findOneBy({
  //       email: user.email,
  //       isEmailVerified: true,
  //     });
  //     if (found) {
  //       const match: boolean = await User.comparePasswords(
  //         found.password,
  //         user.password,
  //       );
  //       console.log(match);
  //       if (match) {
  //         const token = await this.jwtService.signAsync({
  //           sub: user.id,
  //           email: user.email,
  //           role: user.role,
  //         });
  //         console.log(found.id);
  //         console.log(token);
  //         return { status: 'Sucess', token };
  //       } else {
  //         throw new HttpException(
  //           'Login Failed, Invalid Credentials',
  //           HttpStatus.UNAUTHORIZED,
  //         );
  //       }
  //     } else {
  //       throw new HttpException(
  //         'Login Failed, Invalid Credentials',
  //         HttpStatus.UNAUTHORIZED,
  //       );
  //     }
  //   } catch (error) {
  //     throw new HttpException(
  //       'Login Failed, Invalid Credentials',
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  // }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ email });
    if (user && (await User.comparePasswords(password, user.password))) {
      return user;
    }

    return null;
  }
}
