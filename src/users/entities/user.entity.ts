import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { Role } from 'src/auth/decorators/role.decorator';
import BaseModel from 'src/auth/entities/baseModel.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { addMinutes } from 'date-fns';

@Entity({ name: 'users' })
export class User extends BaseModel {
  @Column()
  @ApiProperty()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  @ApiProperty()
  email: string;

  @Column({ default: Role.User })
  @ApiProperty()
  role: Role;

  @Column()
  @Exclude()
  @ApiProperty()
  password: string;

  @Column({ unique: true })
  @ApiProperty()
  phoneNumber: string;

  @Column({ default: false })
  @ApiProperty()
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationToken: string;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationTokenExpires: Date;

  @Column({ nullable: true })
  @Exclude()
  passwordResetToken: string;

  @Column({ nullable: true })
  @Exclude()
  passwordResetTokenExpires: Date;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  /**
   *  Hash Password before insert
   * @param rawPassword string
   * @param hashedPassword string
   * @returns Promise<boolean>
   */
  static async hashPassword(rawpassword: string): Promise<string> {
    return await bcrypt.hash(rawpassword, 10);
  }

  /**
   *  Compare Password Static Method
   * @param rawPassword string
   * @param hashedPassword string
   * @returns Promise<boolean>
   */

  static async comparePasswords(
    rawPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(rawPassword, hashedPassword);
  }

  async createEmailVerificationCode() {
    const verificationToken = crypto.randomBytes(3).toString('hex');

    this.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    let date = new Date();

    date = addMinutes(date, 10);

    this.emailVerificationTokenExpires = date;

    return verificationToken;
  }

  async createPasswordResetToken() {
    // unencrypted reset token
    const resetToken = crypto.randomBytes(3).toString('hex');

    // create and save encrypted reset token
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    let date = new Date();

    date = addMinutes(date, 10);

    this.passwordResetTokenExpires = date;

    // send the unencrypted reset token to users email
    return resetToken;
  }
}
