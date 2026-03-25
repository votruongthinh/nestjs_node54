import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules-api/auth/auth.module';
import { PrimaModule } from './modules-system/prisma/prisma.module';

@Module({
  imports: [AuthModule,PrimaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
