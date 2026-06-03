import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/database/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(dateFrom?: string, dateTo?: string) {
    // Build WHERE clause dynamically
    let whereConditions = 'i.deleted_at IS NULL';
    const params: any[] = [];

    if (dateFrom && dateTo) {
      whereConditions += ' AND i.issue_date BETWEEN ? AND ?';
      params.push(new Date(dateFrom), new Date(dateTo));
    }

    // Fetch invoices using raw SQL
    const invoices = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM invoices i WHERE ${whereConditions}`,
      ...params,
    );

    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
    const paidCount = invoices.filter((inv) => inv.status === InvoiceStatus.PAID).length;
    const unpaidCount = invoices.filter((inv) => inv.status === InvoiceStatus.UNPAID).length;
    const draftCount = invoices.filter((inv) => inv.status === InvoiceStatus.DRAFT).length;
    const cancelledCount = invoices.filter((inv) => inv.status === InvoiceStatus.CANCELLED).length;

    // Get recent invoices with items
    const recentInvoiceIds = invoices
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, 5)
      .map((inv) => inv.id);

    let recentInvoices: any[] = [];
    if (recentInvoiceIds.length > 0) {
      const placeholders = recentInvoiceIds.map(() => '?').join(',');
      recentInvoices = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM invoices WHERE id IN (${placeholders}) ORDER BY created_at DESC`,
        ...recentInvoiceIds,
      );

      // Fetch items for recent invoices
      const items = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM invoice_items WHERE invoice_id IN (${placeholders})`,
        ...recentInvoiceIds,
      );

      const itemsMap: Record<string, any[]> = {};
      items.forEach((item) => {
        if (!itemsMap[item.invoice_id]) {
          itemsMap[item.invoice_id] = [];
        }
        itemsMap[item.invoice_id].push(item);
      });

      recentInvoices = recentInvoices.map((inv) => ({
        ...inv,
        items: itemsMap[inv.id] || [],
      }));
    }

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
      const issueDate = inv.issue_date || inv.issueDate; // Handle both snake_case and camelCase
      const totalAmount = inv.total_amount || inv.totalAmount;

      const date = new Date(issueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = (months[monthKey] || 0) + Number(totalAmount);
    });

    return Object.entries(months)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
