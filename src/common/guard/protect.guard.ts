import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { TokenExpiredError } from 'jsonwebtoken';
  import { PrismaService } from 'src/modules-system/prisma/prisma.service';
  import { TokenService } from 'src/modules-system/token/token.service';
  import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
  
  @Injectable()
  export class ProtectGuard implements CanActivate {
    constructor(
      private tokenService: TokenService,
      private prisma: PrismaService,
      private reflector: Reflector,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
          IS_PUBLIC_KEY,
          [context.getHandler(), context.getClass()],
        );
        console.log({ isPublic });
        if (isPublic) {
          // 💡 See this condition
          return true;
        }
  
        const req = context.switchToHttp().getRequest();
  
        // để lấy được cookies bắt buộc phải tích hợp thư viện cookie-parser
        const { accessToken } = req.cookies;
  
        if (!accessToken) {
          throw new UnauthorizedException('Không có token');
        }
  
        // kiểm tra token
        const decode = this.tokenService.verifyAccessToken(accessToken);
  
        // kiểm tra người dùng có trong db hay không
        const userExits = await this.prisma.users.findUnique({
          where: {
            id: (decode as any).userId,
          },
        });
  
        if (!userExits) {
          throw new UnauthorizedException('Người dùng không tồn tại');
        }
  
        req.user = userExits;
  
        console.log('ProtectGuard', { cookies: req.cookies });
        return true;
      } catch (error) {
        console.log({ error });
        switch (error.constructor) {
          case TokenExpiredError:
            throw new ForbiddenException(error.message);
  
          default:
            throw new UnauthorizedException();
        }
      }
    }
  }