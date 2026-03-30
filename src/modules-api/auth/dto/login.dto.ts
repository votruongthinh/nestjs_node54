import { IsNotEmpty,IsEmail } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({})
  @IsEmail(undefined,{message:"email sai ròi"})
  email: string;

  @IsNotEmpty()
  password: string;
}
