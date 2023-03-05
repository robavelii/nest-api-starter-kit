import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phoneNumber: string;
}
export interface CreateUserParams {
  name: string;
  email: string;
  phoneNumber: string;
}
