import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';

@Injectable()
export class SearchAppService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {
    //xoa index cu neu co
    // this.elasticsearchService.indices.delete({
    //   index: 'articles',
    //   ignore_unavailable:true,
    // })
    this.initArticle();
    this.initUser();
    this.initFood();
  }

  async searchApp(text: string) {
    console.log({ text });
    const result = await this.elasticsearchService.search({
      index: ['articles', 'users', 'foods'],
      query: {
        multi_match: {
          query: text,
          fields: ['title', 'content', 'email', 'fullName', 'description'],
          operator: 'or', // chi can khop 1 tu khoa
          fuzziness: 'AUTO', //ho tro tim kiem bi thieu, user go thieu chu
          minimum_should_match: '60%', // khop 60% tu khoa moi duoc tinh la trung
        },
      },
    });
    return result;
  }
  async initArticle() {
    const articles = await this.prisma.articles.findMany();
    articles.forEach((article) => {
      this.elasticsearchService.index({
        index: 'articles',
        id: String(article.id),
        document: article,
      });
    });
  }
  async initUser() {
    const users = await this.prisma.users.findMany();
    users.forEach((user) => {
      this.elasticsearchService.index({
        index: 'users',
        id: String(user.id),
        document: user,
      });
    });
  }
  async initFood() {
    const foods = await this.prisma.foods.findMany();
    foods.forEach((food) => {
      this.elasticsearchService.index({
        index: 'foods',
        id: String(food.id),
        document: food,
      });
    });
  }
}
