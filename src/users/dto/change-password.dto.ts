import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Password in plain text',
    example: 'Pass@1234',
  })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'Pass@1234',
  })
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({
    description: 'Password in plain text',
    example: 'Pass@1234',
  })
  @IsNotEmpty()
  newPasswordConfirm: string;
}
