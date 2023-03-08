import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password in plain text',
    example: 'Pass@1234',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'Pass@1234',
  })
  @IsNotEmpty()
  passwordConfirm: string;

  @ApiProperty({
    description: 'Reset code sent to email in plain text',
    example: 'adu0f9',
  })
  @IsNotEmpty()
  resetToken: string;
}
