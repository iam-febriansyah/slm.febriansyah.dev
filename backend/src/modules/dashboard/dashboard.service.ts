import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/database/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(dateFrom?: string, dateTo?: string) {
    const where = {
      deletedAt: null,
      ...(dateFrom && dateTo && {
        issueDate: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      }),
    };

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: { items: true },
    });

    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const paidCount = invoices.filter((inv) => inv.status === InvoiceStatus.PAID).length;
    const unpaidCount = invoices.filter((inv) => inv.status === InvoiceStatus.UNPAID).length;
    const draftCount = invoices.filter((inv) => inv.status === InvoiceStatus.DRAFT).length;
    const cancelledCount = invoices.filter((inv) => inv.status === InvoiceStatus.CANCELLED).length;

    const recentInvoices = invoices
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Monthly revenue trend
    const monthlyRevenue = this.calculateMonthlyRevenue(invoices);

    return {
      success: true,
      data: {
        totalInvoices,
        totalRevenue,
        paidCount,
        unpaidCount,
        draftCount,
        cancelledCount,
        recentInvoices,
        monthlyRevenue,
      },
      message: 'Ringkasan dashboard berhasil diambil',
    };
  }

  private calculateMonthlyRevenue(invoices: any[]) {
    const months: { [key: string]: number } = {};

    invoices.forEach((inv) => {
      const monthKey = `${inv.issueDate.getFullYear()}-${String(inv.issueDate.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = (months[monthKey] || 0) + Number(inv.totalAmount);
    });

    return Object.entries(months)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
