import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
export class LoginUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'janedoe@mail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'Pass@1234',
  })
  @IsNotEmpty()
  password: string;
}

export class LoginLocalDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'janedoe@mail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'Pass@1234',
  })
  @IsNotEmpty()
  password: string;
}
