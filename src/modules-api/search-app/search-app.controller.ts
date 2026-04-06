import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SearchAppService } from './search-app.service';
import { CreateSearchAppDto } from './dto/create-search-app.dto';
import { UpdateSearchAppDto } from './dto/update-search-app.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';

@Controller('search-app')
export class SearchAppController {
  constructor(
    private readonly searchAppService: SearchAppService,
    private prisma: PrismaService,
  ) {}

  @Get()
  searchApp(@Query('text') text:string) {
    return this.searchAppService.searchApp(text);
  }

}
