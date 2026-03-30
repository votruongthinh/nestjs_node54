import { BadRequestException, Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken"
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from 'src/common/constant/app.constant';
@Injectable()
export class TokenService {
    createAccessToken(userId) {
        if (!userId) {
          throw new BadRequestException('không có userId để tạo token');
        }
    
        // accessToken <=> AT (ghi tắt)
        const accessToken = jwt.sign({ userId: userId }, ACCESS_TOKEN_SECRET as string, {
          expiresIn: '5s',
        });
    
        return accessToken;
      }
      createRefreshToken(userId) {
        if (!userId) {
          throw new BadRequestException('không có userId để tạo token');
        }
    
        // refreshToken <=> RT (ghi tắt)
        const refreshToken = jwt.sign({ userId: userId }, REFRESH_TOKEN_SECRET, {
          expiresIn: '1d',
        });
    
        return refreshToken;
      }
    
      verifyAccessToken(acccessToken, option) {
        const decode = jwt.verify(acccessToken, ACCESS_TOKEN_SECRET, option);
        return decode;
      }
      verifyRefreshToken(refreshToken, option) {
        const decode = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, option);
        return decode;
      }
}