import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateStatusDto, AddInvoiceItemDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvoiceStatus } from '@prisma/client';

@ApiTags('Invoices')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Buat invoice baru (DRAFT)' })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoiceService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar invoice (dengan filter & pagination)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: InvoiceStatus,
    @Query('customerId') customerId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.invoiceService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      status,
      customerId,
      dateFrom,
      dateTo,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail invoice' })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update info invoice (DRAFT saja)' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoiceService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status invoice (State Machine)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.invoiceService.updateStatus(id, dto);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Tambah item ke invoice (DRAFT saja)' })
  addItem(@Param('id') id: string, @Body() dto: AddInvoiceItemDto) {
    return this.invoiceService.addItem(id, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Hapus item dari invoice (DRAFT saja)' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiParam({ name: 'itemId', description: 'Invoice Item ID' })
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.invoiceService.removeItem(id, itemId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus invoice (soft delete, DRAFT saja)' })
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }
}
