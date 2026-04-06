import {
  Global,
  Inject,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { RABBIT_MQ_URL } from 'src/common/constant/app.constant';
import { ORDER_SERVICE } from 'src/common/constant/rabbit-mq.constant';
@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [RABBIT_MQ_URL!],
          queue: 'order_queue',
          queueOptions: {
            durable: false,
          },
          socketOptions: {
            connectionOptions: {
              clientProperties: {
                connection_name: 'order-send',
              },
            },
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMqModule implements OnModuleInit {
  constructor(@Inject(ORDER_SERVICE) private client: ClientProxy) {}
  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('✅ [RABBIT-MQ] Kết nối thành công');
    } catch (error) {
      console.log({ RabbitMqModule: error });
    }
  }
}
