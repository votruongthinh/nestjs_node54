import { Body, Controller, Post } from '@nestjs/common';
import { TotpService } from './totp.service';
import { User } from 'src/common/decorator/user.decorator';
import type { Users } from 'src/modules-system/prisma/generated/prisma/client';
import { SaveTotpDto } from './dto/save-totp.dto';
import { DisableTotpDto } from './dto/disable-totp.dto';

@Controller('totp')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

@Post('generate')
generate(@User() user:Users){
  return this.totpService.generate(user);
}

@Post('save')
save(@User() user: Users, @Body() body: SaveTotpDto) {
  return this.totpService.save(user, body);
}

// disable: xoá secrect
@Post('disable')
disable(@User() user: Users, @Body() body: DisableTotpDto) {
  return this.totpService.disable(user, body);
}
}
