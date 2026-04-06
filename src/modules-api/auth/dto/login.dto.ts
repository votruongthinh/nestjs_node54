import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({example:"Example@123"})
  @IsNotEmpty({})
  @IsEmail(undefined, { message: 'Email sài rùi' })
  email!: string;

  @ApiProperty({example:"123456"})
  @IsNotEmpty()
  password!: string;


  @ApiProperty()
  @IsOptional()
  @IsString()
  token?: string;
}