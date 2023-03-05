import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { Role } from 'src/auth/decorators/role.decorator';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ default: Role.User })
  role: Role;

  @Column()
  @Exclude()
  password: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
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
}
