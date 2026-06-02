import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/database/prisma.service';

@Injectable()
export class InvoiceNumberService {
  constructor(private prisma: PrismaService) {}

  async generate(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}${month}`;

    // Cari invoice terbaru bulan ini
    const latest = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: { startsWith: prefix },
        deletedAt: null,
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (latest) {
      const lastSeq = parseInt(latest.invoiceNumber.split('-')[1], 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}-${String(sequence).padStart(5, '0')}`;
  }
}
