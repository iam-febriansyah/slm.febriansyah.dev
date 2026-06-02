import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/database/prisma.module';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceNumberService } from './invoice-number.service';

@Module({
  imports: [PrismaModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceNumberService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
