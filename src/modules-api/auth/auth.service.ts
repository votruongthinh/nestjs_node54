import { TotpService } from './../totp/totp.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/modules-system/token/token.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private totpService: TotpService,
  ) {}

  async login(body: LoginDto) {
    // nhận dữ liệu
    const { email, password, token } = body;

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

  
    if (userExist.totpSecret) {
      if (token) {
        // FE gọi api login lần 2
        const { valid } = await this.totpService.totp.verify(token, {
          secret: userExist.totpSecret,
        });

        if (!valid) {
          throw new BadRequestException('Verify TOTP invalid');
        }
      } else {
        // FE gọi api login lần 1
        console.log('/ FE gọi api login lần 1');
        return { isTotp: true };
      }
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
  async refreshToken(req: Request) {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken) {
      throw new UnauthorizedException('Không có accessToken để kiểm tra');
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Không có refreshToken để kiểm tra.');
    }

    // tại vì accessToken đang bị hết hạn, FE đang muốn làm mới
    // cho nên không được kiểm tra hạn của accessToken { ignoreExpiration: true }
    const decodeAccessToken: any = this.tokenService.verifyAccessToken(
      accessToken,
      {
        ignoreExpiration: true,
      },
    );
    const decodeRefreshToken: any =
      this.tokenService.verifyRefreshToken(refreshToken);

    if (decodeAccessToken.userId !== decodeRefreshToken.userId) {
      throw new UnauthorizedException('Token không hợp lệ..');
    }

    const userExits = await this.prisma.users.findUnique({
      where: {
        id: decodeAccessToken.userId,
      },
    });

    if (!userExits) {
      throw new UnauthorizedException('Không tìm thấy user trong db');
    }

    const accessTokenNew = this.tokenService.createAccessToken(userExits.id);
    const refreshTokenNew = this.tokenService.createRefreshToken(userExits.id);

    // thời hạn của refreshToken là 1 ngày

    // Trường hợp 1: trả về cả cặp 2 token (rotate)
    // refreshToken luôn được làm mới: tự động gia hạn thời gian login
    // nếu trong 1 ngày, người dùng này không sử dụng => logout

    // Trường hợp 2: trả về 1 accessToken
    // refreshToken sẽ không được gia hạn
    // đúng 1 ngày người dùng sẽ luôn phải login lại

    // console.log({ accessToken, refreshToken, decodeAccessToken, decodeRefreshToken, userExits });

    return {
      accessToken: accessTokenNew,
      refreshToken: refreshTokenNew,
    };
  }
}
