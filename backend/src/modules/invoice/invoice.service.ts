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
  ) {}

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
      include: { items: true, customer: true },
    });

    return { success: true, data: invoice, message: 'Invoice berhasil dibuat' };
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

    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...(dateFrom && dateTo && {
        issueDate: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, items: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: { customer: true, items: true, user: true },
    });
    if (!invoice) throw new NotFoundException('Invoice tidak ditemukan');
    return { success: true, data: invoice };
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

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { ...dto, ...totals },
      include: { customer: true, items: true },
    });

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

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: dto.status },
      include: { customer: true, items: true },
    });

    return { success: true, data: updated, message: 'Status invoice diperbarui' };
  }

  async addItem(invoiceId: string, dto: AddInvoiceItemDto) {
    const existing = await this.findOne(invoiceId);
    const invoice = existing.data;

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Hanya invoice DRAFT yang bisa ditambah item');
    }

    const newItem = await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        description: dto.description,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        totalPrice: dto.quantity * dto.unitPrice,
        itemId: dto.itemId,
      },
    });

    const items = [...invoice.items, newItem];
    const totals = this.recalculateInvoice(
      items,
      Number(invoice.discountPercent),
      Number(invoice.taxPercent),
    );

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { ...totals },
      include: { customer: true, items: true },
    });

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

    const items = invoice.items.filter((item) => item.id !== itemId);
    const totals = this.recalculateInvoice(
      items,
      Number(invoice.discountPercent),
      Number(invoice.taxPercent),
    );

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { ...totals },
      include: { customer: true, items: true },
    });

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
