import { Inject, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules-api/auth/auth.module';
import { PrimaModule } from './modules-system/prisma/prisma.module';
import { TokenModule } from './modules-system/token/token.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ProtectGuard } from './common/guard/protect.guard';
import { RoleGuard } from './common/guard/role.guard';
import { ArticleModule } from './modules-api/article/article.module';
import { LoggingInterceptor } from './common/interceptos/logging.interceptor';
import { ResponseSuccessInterceptor } from './common/interceptos/response-success.interceptor';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { REDIS_URL } from './common/constant/app.constant';
import type { Cache } from 'cache-manager';
import { ElasticSearchModule } from './modules-system/elastic-search/elastic-search/elastic-search.module';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchAppModule } from './modules-api/search-app/search-app.module';
import { TotpModule } from './modules-api/totp/totp.module';
import { OrderModule } from './modules-api/order/order.module';
import { RabbitMqModule } from './modules-system/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [
    AuthModule,
    PrimaModule,
    TokenModule,
    ArticleModule,
    CacheModule.register({
      isGlobal: true,
      stores: [new KeyvRedis(REDIS_URL)],
    }),
    ElasticSearchModule,
    SearchAppModule,
    TotpModule,
    OrderModule,
    RabbitMqModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ProtectGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSuccessInterceptor,
    },
  ],
})
export class AppModule {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {
    try {
      await this.cacheManager.get('healthcheck');
      console.log('✅ [REDIS] Kết nối redis thành công');
    } catch (error) {
      console.log({ error });
    }

    try {
      const result = await this.elasticsearchService.ping();
      console.log('✅ [ELASTIC-SEARCH] Kết nối thành công', result);
    } catch (error) {
      console.log({ elasticSearch: error });
    }
  }
}