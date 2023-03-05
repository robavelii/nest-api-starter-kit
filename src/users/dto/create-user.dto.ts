import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @Length(6, 24)
  password: string;

  @IsNotEmpty()
  @Length(6, 24)
  @Match('password')
  passwordConfirm: string;
}
