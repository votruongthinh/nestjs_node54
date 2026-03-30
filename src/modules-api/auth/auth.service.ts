import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/modules-system/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async login(body: LoginDto) {
    // nhận dữ liệu
    const { email, password } = body;

    // kiểm tra email xem tồn tại chưa
    // nếu chưa tồn tại => từ chối, kêu người dùng đăng ký
    // nếu mà tồn tại => đi xử lý tiếp
    const userExist = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
      omit: {
        password: false,
      },
    });

    if (!userExist) {
      // throw new BadRequestException("Account Invalid.");
      throw new BadRequestException('Người chưa tồn tại, vui lòng đăng ký');
    }

    const isPassword = bcrypt.compareSync(password, userExist.password); // true

    if (!isPassword) {
      // throw new BadRequestException("Account Invalid..");
      throw new BadRequestException('Mật khẩu khống chính xác');
    }

    const accessToken = this.tokenService.createAccessToken(userExist.id);
    const refreshToken = this.tokenService.createRefreshToken(userExist.id);

    // console.log({ email, password, userExist, isPassword });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
