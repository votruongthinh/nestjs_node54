import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { User } from 'src/common/decorator/user.decorator';
import { Role } from 'src/common/decorator/role.decorator';

// class BodyDto {
//   email:string;
//   password:string;

// }

// interface BodyDto {
//   email:string;
//   password:string;
// }

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}
  @Post('login')
  @Public()
  @Role('ADMIN')
  async login(
    @Body()
    body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.AuthService.login(body);

    res.cookie('accessToken', result.accessToken);
    res.cookie('refreshToken', result.refreshToken);

    return true;
  }
  @Get('get-info')
  @Role('USER')
  getInfo(@User() user) {
    console.log('get-info', user);
    return 'user';
  }
}
