import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
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
    if (result?.isTotp) {
      console.log(123);
      return { isTotp: true };
    } else {
      res.cookie('accessToken', result.accessToken);
      res.cookie('refreshToken', result.refreshToken);

      return true;
    }
  }

  
  @Get('get-info')
  @Role('USER')
  getInfo(@User() user) {
    console.log('get-info', user);

    if (user.totpSecret) {
      user.isTotp = true;
    }
    delete user.totpSecret;
    delete user.password;
    return user;
  }


  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.AuthService.refreshToken(req);
    res.cookie('accessToken', result.accessToken);
    res.cookie('refreshToken', result.refreshToken);
    return true;
  }
}
