"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const invoice_number_service_1 = require("./invoice-number.service");
const client_1 = require("@prisma/client");
let InvoiceService = class InvoiceService {
    constructor(prisma, invoiceNumberService) {
        this.prisma = prisma;
        this.invoiceNumberService = invoiceNumberService;
    }
    recalculateInvoice(items, discountPercent, taxPercent) {
        const subtotal = items.reduce((sum, item) => {
            return sum + item.quantity * Number(item.unitPrice);
        }, 0);
        const discountAmount = subtotal * (discountPercent / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (taxPercent / 100);
        const totalAmount = afterDiscount + taxAmount;
        return { subtotal, discountAmount, taxAmount, totalAmount };
    }
    async create(dto, userId) {
        const invoiceNumber = await this.invoiceNumberService.generate();
        const totals = this.recalculateInvoice(dto.items, dto.discountPercent || 0, dto.taxPercent || 0);
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
        const result = await this.prisma.$queryRaw `
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${invoice.id}
      LIMIT 1
    `;
        const items = await this.prisma.$queryRaw `
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
    async findAll(page = 1, limit = 10, status, customerId, dateFrom, dateTo) {
        const skip = (page - 1) * limit;
        let whereConditions = 'i.deleted_at IS NULL';
        const params = [];
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
        const countResult = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM invoices i WHERE ${whereConditions}`, ...params);
        const total = Number(countResult[0].count);
        const data = await this.prisma.$queryRawUnsafe(`
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE ${whereConditions}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
      `, ...params, limit, skip);
        const invoiceIds = data.map((inv) => inv.id);
        const itemsMap = {};
        if (invoiceIds.length > 0) {
            const placeholders = invoiceIds.map(() => '?').join(',');
            const items = await this.prisma.$queryRawUnsafe(`SELECT * FROM invoice_items WHERE invoice_id IN (${placeholders})`, ...invoiceIds);
            items.forEach((item) => {
                if (!itemsMap[item.invoice_id]) {
                    itemsMap[item.invoice_id] = [];
                }
                itemsMap[item.invoice_id].push(item);
            });
        }
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
    async findOne(id) {
        const invoice = await this.prisma.$queryRaw `
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
            throw new common_1.NotFoundException('Invoice tidak ditemukan');
        }
        const items = await this.prisma.$queryRaw `
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
    async update(id, dto) {
        const existing = await this.findOne(id);
        const invoice = existing.data;
        if (invoice.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException('Hanya invoice DRAFT yang bisa diubah');
        }
        const totals = this.recalculateInvoice(invoice.items, dto.discountPercent ?? Number(invoice.discountPercent), dto.taxPercent ?? Number(invoice.taxPercent));
        await this.prisma.invoice.update({
            where: { id },
            data: { ...dto, ...totals },
        });
        const result = await this.prisma.$queryRaw `
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${id}
      LIMIT 1
    `;
        const items = await this.prisma.$queryRaw `
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
    async updateStatus(id, dto) {
        const existing = await this.findOne(id);
        const invoice = existing.data;
        const validTransitions = {
            [client_1.InvoiceStatus.DRAFT]: [client_1.InvoiceStatus.UNPAID, client_1.InvoiceStatus.CANCELLED],
            [client_1.InvoiceStatus.UNPAID]: [client_1.InvoiceStatus.PAID, client_1.InvoiceStatus.CANCELLED],
            [client_1.InvoiceStatus.PAID]: [],
            [client_1.InvoiceStatus.CANCELLED]: [],
        };
        const allowedStatuses = validTransitions[invoice.status];
        if (!allowedStatuses.includes(dto.status)) {
            throw new common_1.BadRequestException(`Tidak bisa mengubah status dari ${invoice.status} ke ${dto.status}`);
        }
        await this.prisma.invoice.update({
            where: { id },
            data: { status: dto.status },
        });
        const result = await this.prisma.$queryRaw `
      SELECT
        i.*,
        c.id as customer_id, c.name as customer_name, c.email as customer_email,
        c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${id}
      LIMIT 1
    `;
        const items = await this.prisma.$queryRaw `
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
    async addItem(invoiceId, dto) {
        const existing = await this.findOne(invoiceId);
        const invoice = existing.data;
        if (invoice.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException('Hanya invoice DRAFT yang bisa ditambah item');
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
        const items = await this.prisma.$queryRaw `
      SELECT * FROM invoice_items WHERE invoice_id = ${invoiceId}
    `;
        const totals = this.recalculateInvoice(items, Number(invoice.discountPercent), Number(invoice.taxPercent));
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { ...totals },
        });
        const result = await this.prisma.$queryRaw `
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
    async removeItem(invoiceId, itemId) {
        const existing = await this.findOne(invoiceId);
        const invoice = existing.data;
        if (invoice.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException('Hanya invoice DRAFT yang bisa diubah itemnya');
        }
        await this.prisma.invoiceItem.delete({
            where: { id: itemId },
        });
        const items = await this.prisma.$queryRaw `
      SELECT * FROM invoice_items WHERE invoice_id = ${invoiceId}
    `;
        const totals = this.recalculateInvoice(items, Number(invoice.discountPercent), Number(invoice.taxPercent));
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { ...totals },
        });
        const result = await this.prisma.$queryRaw `
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
    async remove(id) {
        const existing = await this.findOne(id);
        const invoice = existing.data;
        if (invoice.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException('Hanya invoice DRAFT yang bisa dihapus');
        }
        await this.prisma.invoice.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Invoice dihapus' };
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        invoice_number_service_1.InvoiceNumberService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map