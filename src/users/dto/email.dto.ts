import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class EmailDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'johndoe@mail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
