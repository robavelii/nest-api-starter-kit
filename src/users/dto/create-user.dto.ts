import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { IsEmailAlreadyExist } from '../decorators/email.decorator';
import { Match } from '../decorators/match.decorator';
import { IsPhoneNumberAlreadyExist } from '../decorators/phoneNumber.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsEmail()
  @ApiProperty()
  @IsEmailAlreadyExist({
    message: 'This Email: $value already exists',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsPhoneNumberAlreadyExist({
    message: 'This phone number: $value already exists',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @ApiProperty()
  @Length(6, 24)
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  @Length(6, 24)
  @Match('password')
  passwordConfirm: string;
}
