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
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { ResponseUtil, StandardResponse } from 'src/utils/respnse-utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<StandardResponse<User>> {
    let user = this.usersRepository.create(createUserDto);

    const emailToken = await user.createEmailVerificationCode();
    console.log(emailToken);

    try {
      const email = await new Email(user).sendEmailVerificationCode(emailToken);
      console.log('inside auth service: ', email);
    } catch (error) {
      throw new HttpException(
        `Couldn't send Email ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const hashedPassowrd = await User.hashPassword(user.password);

    user.password = hashedPassowrd;

    user = await this.usersRepository.save(user);
    return ResponseUtil.StandardResponse(
      'Registration Successful',
      'Verification code sent to Email',
      user,
    );
  }

  async confirmEmail(token: string): Promise<StandardResponse<User>> {
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

    return ResponseUtil.StandardResponse('Successful', 'Email Verified', user);
  }

  async resendVerification({
    email,
  }: EmailDto): Promise<StandardResponse<User>> {
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
    return ResponseUtil.StandardResponse(
      'Successful',
      'Verification code resent to Email',
      user,
    );
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

  async forgotPassword({ email }: EmailDto): Promise<StandardResponse<User>> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const resetToken = await user.createPasswordResetToken();

    await user.save();

    try {
      await new Email(user).passwordResetToken(resetToken);
      console.log(resetToken);
    } catch (error) {
      throw new HttpException(
        `Couldn't send Email ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ResponseUtil.StandardResponse(
      'Successful',
      'Password reset code sent to Email',
      user,
    );
  }

  async resetPassword({
    resetToken,
    password,
  }: ResetPasswordDto): Promise<StandardResponse<User>> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await this.usersRepository.findOneBy({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: MoreThanOrEqual(new Date(Date.now())),
    });

    if (!user) {
      throw new HttpException(
        'User not found or token expired',
        HttpStatus.NOT_FOUND,
      );
    }
    const hashNewPassowrd = await User.hashPassword(password);

    user.password = hashNewPassowrd;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;

    await user.save();

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return ResponseUtil.StandardResponse(
      'Successful',
      'Password has been reset',
      user,
    );
  }

  async changePassword(
    loggedIn: User,
    { oldPassword, newPassword }: ChangePasswordDto,
  ): Promise<StandardResponse<User>> {
    const user = await this.usersRepository.findOneBy({
      id: loggedIn.id,
      email: loggedIn.email,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const validPassword = await User.comparePasswords(
      oldPassword,
      user.password,
    );
    if (!validPassword) {
      throw new HttpException('Invalid Password', HttpStatus.UNAUTHORIZED);
    }

    const hashNewPassowrd = await User.hashPassword(newPassword);

    user.password = hashNewPassowrd;

    await user.save();

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return ResponseUtil.StandardResponse(
      'Successful',
      'Password changed',
      user,
      token,
    );
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ email });
    if (user && (await User.comparePasswords(password, user.password))) {
      return user;
    }

    return null;
  }
}
