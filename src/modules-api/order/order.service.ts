import { Inject, Injectable } from '@nestjs/common';
import { ORDER_SERVICE } from 'src/common/constant/rabbit-mq.constant';
import { Users } from 'src/modules-system/prisma/generated/prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(@Inject(ORDER_SERVICE) private client: ClientProxy) {}

  async create(createOrderDto: CreateOrderDto, user: Users) {
    const data = { userId: user.id, foodId: createOrderDto.foodId };

    console.log({ user, createOrderDto, data });

    // send: quan trọng kết quả trả về, phải dợi kết quả trả về
    // bọc với await lastValueFrom

    const reuslt = await lastValueFrom(this.client.send('createOrder', data));

    return reuslt;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
