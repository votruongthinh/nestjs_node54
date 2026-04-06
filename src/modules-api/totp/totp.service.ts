import { BadRequestException, Injectable } from '@nestjs/common';
import { ScureBase32Plugin } from '@otplib/plugin-base32-scure';
import { NodeCryptoPlugin } from '@otplib/plugin-crypto-node';
import { TOTP } from 'otplib';
import * as qrcode from 'qrcode';
import { Users } from 'src/modules-system/prisma/generated/prisma/client';
import { SaveTotpDto } from './dto/save-totp.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { DisableTotpDto } from './dto/disable-totp.dto';

/**
 * nếu mà trường hợp tài khoản của người dùng đăng nhập trên thiết bị khác
 * tự động xoá secret, reset
 */
@Injectable()
export class TotpService {
  public totp: TOTP;
  constructor(private prisma: PrismaService) {
    this.totp = new TOTP({
      crypto: new NodeCryptoPlugin(),
      base32: new ScureBase32Plugin(),
    });
  }

  async generate(user: Users) {
    if (user.totpSecret) {
      throw new BadRequestException('Người dùng đã bật TOTP rồi');
    }

    const secret = this.totp.generateSecret();

    const uri = this.totp.toURI({
      issuer: 'NODE_54',
      secret: secret,
      label: user.email,
    });

    const qrCode = await qrcode.toDataURL(uri);

    return { secret, qrCode };
  }

  async save(user: Users, body: SaveTotpDto) {
    if (user.totpSecret) {
      throw new BadRequestException('Người dùng đã bật TOTP rồi');
    }

    const { valid } = await this.totp.verify(body.token, {
      secret: body.secret,
    });

    if (!valid) {
      throw new BadRequestException('Verify TOTP invalid');
    }

    await this.prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        totpSecret: body.secret,
      },
    });

    return true;
  }

  async disable(user: Users, body: DisableTotpDto) {
    if (!user.totpSecret) {
      throw new BadRequestException('Người dùng đã bật TOTP rồi');
    }

    const { valid } = await this.totp.verify(body.token, {
      secret: user.totpSecret,
    });

    if (!valid) {
      throw new BadRequestException('Verify TOTP invalid');
    }

    await this.prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        totpSecret: null,
      },
    });

    return true;
  }
}