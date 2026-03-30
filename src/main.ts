import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  const PORT = 3069;

  await app.listen(PORT, () => {
    console.log(`Start BE successfully at http://localhost:${PORT}`);
  });
}
bootstrap();
