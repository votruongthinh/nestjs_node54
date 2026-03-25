import { AuthService } from './auth.service';
import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}
  @Post('login')
  login() {
    const result = this.AuthService.login;
    return result;
  }
}
