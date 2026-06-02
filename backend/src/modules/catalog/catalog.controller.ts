import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Items')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('items')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @ApiOperation({ summary: 'Buat item baru' })
  create(@Body() dto: CreateItemDto) {
    return this.catalogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar item (dengan pagination)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.catalogService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      search,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail item' })
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data item' })
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.catalogService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus item (soft delete)' })
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
