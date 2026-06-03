import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/database/prisma.service';
import { InvoiceNumberService } from './invoice-number.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateStatusDto, AddInvoiceItemDto } from './dto/invoice.dto';
import { InvoiceStatus, Prisma } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private invoiceNumberService: InvoiceNumberService,
  ) { }

  private recalculateInvoice(
    items: { quantity: number; unitPrice: any }[],
    discountPercent: number,
    taxPercent: number,
  ) {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * Number(item.unitPrice);
    }, 0);

    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxPercent / 100);
    const totalAmount = afterDiscount + taxAmount;

    return { subtotal, discountAmount, taxAmount, totalAmount };
  }

  async create(dto: CreateInvoiceDto, userId: string) {
    const invoiceNumber = await this.invoiceNumberService.generate();

    const totals = this.recalculateInvoice(
      dto.items,
      dto.discountPercent || 0,
      dto.taxPercent || 0,
    );

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: dto.customerId,
        userId,
        dueDate: new Date(dto.dueDate),
        discountPercent: dto.discountPercent || 0,
        taxPercent: dto.taxPercent || 0,
        notes: dto.notes,
        ...totals,
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            itemId: item.itemId,
          })),
        },
      },
    });

    // Fetch created invoice with relationships using raw query
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${invoice.id}
      LIMIT 1
    `;

    const items = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM invoice_items
      WHERE invoice_id = ${invoice.id}
    `;

    const formattedInvoice = {
      ...result[0],
      customer: {
        id: result[0].customer_id,
        name: result[0].customer_name,
        email: result[0].customer_email,
        phone: result[0].customer_phone,
        address: result[0].customer_address,
      },
      items,
    };

    return { success: true, data: formattedInvoice, message: 'Invoice berhasil dibuat' };
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: InvoiceStatus,
    customerId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const skip = (page - 1) * limit;

    // Build WHERE clause dynamically
    let whereConditions = 'i.deleted_at IS NULL';
    const params: any[] = [];

    if (status) {
      whereConditions += ' AND i.status = ?';
      params.push(status);
    }

    if (customerId) {
      whereConditions += ' AND i.customer_id = ?';
      params.push(customerId);
    }

    if (dateFrom && dateTo) {
      whereConditions += ' AND i.issue_date BETWEEN ? AND ?';
      params.push(new Date(dateFrom), new Date(dateTo));
    }

    // Get total count
    const countResult = await this.prisma.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT COUNT(*) as count FROM invoices i WHERE ${whereConditions}`,
      ...params,
    );
    const total = countResult[0].count;

    // Get paginated data with JOIN
    const data = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE ${whereConditions}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
      `,
      ...params,
      limit,
      skip,
    );

    // Get items for each invoice
    const invoiceIds = data.map((inv) => inv.id);
    const itemsMap: Record<string, any[]> = {};

    if (invoiceIds.length > 0) {
      const placeholders = invoiceIds.map(() => '?').join(',');
      const items = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM invoice_items WHERE invoice_id IN (${placeholders})`,
        ...invoiceIds,
      );

      items.forEach((item) => {
        if (!itemsMap[item.invoice_id]) {
          itemsMap[item.invoice_id] = [];
        }
        itemsMap[item.invoice_id].push(item);
      });
    }

    // Map results to include customer and items
    const formattedData = data.map((inv) => ({
      ...inv,
      customer: {
        id: inv.customer_id,
        name: inv.customer_name,
        email: inv.customer_email,
        phone: inv.customer_phone,
        address: inv.customer_address,
      },
      items: itemsMap[inv.id] || [],
    }));

    return {
      success: true,
      data: {
        items: formattedData,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.$queryRaw<any[]>`
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address,
        u.id as user_id, u.name as user_name, u.email as user_email
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = ${id} AND i.deleted_at IS NULL
      LIMIT 1
    `;

    if (!invoice || invoice.length === 0) {
      throw new NotFoundException('Invoice tidak ditemukan');
    }

    const items = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM invoice_items
      WHERE invoice_id = ${id}
      ORDER BY id
    `;

    const result = {
      ...invoice[0],
      customer: {
        id: invoice[0].customer_id,
        name: invoice[0].customer_name,
        email: invoice[0].customer_email,
        phone: invoice[0].customer_phone,
        address: invoice[0].customer_address,
      },
      user: {
        id: invoice[0].user_id,
        name: invoice[0].user_name,
        email: invoice[0].user_email,
      },
      items,
    };

    return { success: true, data: result };
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const existing = await this.findOne(id);
    const invoice = existing.data;

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Hanya invoice DRAFT yang bisa diubah');
    }

    const totals = this.recalculateInvoice(
      invoice.items,
      dto.discountPercent ?? Number(invoice.discountPercent),
      dto.taxPercent ?? Number(invoice.taxPercent),
    );

    await this.prisma.invoice.update({
      where: { id },
      data: { ...dto, ...totals },
    });

    // Fetch updated invoice with relationships using raw query
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${id}
      LIMIT 1
    `;

    const items = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM invoice_items
      WHERE invoice_id = ${id}
    `;

    const updated = {
      ...result[0],
      customer: {
        id: result[0].customer_id,
        name: result[0].customer_name,
        email: result[0].customer_email,
        phone: result[0].customer_phone,
        address: result[0].customer_address,
      },
      items,
    };

    return { success: true, data: updated, message: 'Invoice diperbarui' };
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const existing = await this.findOne(id);
    const invoice = existing.data;

    // State machine validation
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      [InvoiceStatus.DRAFT]: [InvoiceStatus.UNPAID, InvoiceStatus.CANCELLED],
      [InvoiceStatus.UNPAID]: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
      [InvoiceStatus.PAID]: [],
      [InvoiceStatus.CANCELLED]: [],
    };

    const allowedStatuses = validTransitions[invoice.status];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Tidak bisa mengubah status dari ${invoice.status} ke ${dto.status}`,
      );
    }

    await this.prisma.invoice.update({
      where: { id },
      data: { status: dto.status },
    });

    // Fetch updated invoice with relationships using raw query
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${id}
      LIMIT 1
    `;

    const items = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM invoice_items
      WHERE invoice_id = ${id}
    `;

    const updated = {
      ...result[0],
      customer: {
        id: result[0].customer_id,
        name: result[0].customer_name,
        email: result[0].customer_email,
        phone: result[0].customer_phone,
        address: result[0].customer_address,
      },
      items,
    };

    return { success: true, data: updated, message: 'Status invoice diperbarui' };
  }

  async addItem(invoiceId: string, dto: AddInvoiceItemDto) {
    const existing = await this.findOne(invoiceId);
    const invoice = existing.data;

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Hanya invoice DRAFT yang bisa ditambah item');
    }

    await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalPrice: dto.quantity * dto.unitPrice,
        itemId: dto.itemId,
      },
    });

    // Recalculate totals with updated items
    const items = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM invoice_items WHERE invoice_id = ${invoiceId}
    `;

    const totals = this.recalculateInvoice(
      items,
      Number(invoice.discountPercent),
      Number(invoice.taxPercent),
    );

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { ...totals },
    });

    // Fetch updated invoice with relationships
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${invoiceId}
      LIMIT 1
    `;

    const updated = {
      ...result[0],
      customer: {
        id: result[0].customer_id,
        name: result[0].customer_name,
        email: result[0].customer_email,
        phone: result[0].customer_phone,
        address: result[0].customer_address,
      },
      items,
    };

    return { success: true, data: updated, message: 'Item ditambahkan' };
  }

  async removeItem(invoiceId: string, itemId: string) {
    const existing = await this.findOne(invoiceId);
    const invoice = existing.data;

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Hanya invoice DRAFT yang bisa diubah itemnya');
    }

    await this.prisma.invoiceItem.delete({
      where: { id: itemId },
    });

    // Recalculate totals with remaining items
    const items = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM invoice_items WHERE invoice_id = ${invoiceId}
    `;

    const totals = this.recalculateInvoice(
      items,
      Number(invoice.discountPercent),
      Number(invoice.taxPercent),
    );

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { ...totals },
    });

    // Fetch updated invoice with relationships
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${invoiceId}
      LIMIT 1
    `;

    const updated = {
      ...result[0],
      customer: {
        id: result[0].customer_id,
        name: result[0].customer_name,
        email: result[0].customer_email,
        phone: result[0].customer_phone,
        address: result[0].customer_address,
      },
      items,
    };

    return { success: true, data: updated, message: 'Item dihapus' };
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    const invoice = existing.data;

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Hanya invoice DRAFT yang bisa dihapus');
    }

    await this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Invoice dihapus' };
  }
}
