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
            include: { items: true, customer: true },
        });
        return { success: true, data: invoice, message: 'Invoice berhasil dibuat' };
    }
    async findAll(page = 1, limit = 10, status, customerId, dateFrom, dateTo) {
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(id) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, deletedAt: null },
            include: { customer: true, items: true, user: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice tidak ditemukan');
        return { success: true, data: invoice };
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        const invoice = existing.data;
        if (invoice.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException('Hanya invoice DRAFT yang bisa diubah');
        }
        const totals = this.recalculateInvoice(invoice.items, dto.discountPercent ?? Number(invoice.discountPercent), dto.taxPercent ?? Number(invoice.taxPercent));
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: { ...dto, ...totals },
            include: { customer: true, items: true },
        });
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
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: { status: dto.status },
            include: { customer: true, items: true },
        });
        return { success: true, data: updated, message: 'Status invoice diperbarui' };
    }
    async addItem(invoiceId, dto) {
        const existing = await this.findOne(invoiceId);
        const invoice = existing.data;
        if (invoice.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException('Hanya invoice DRAFT yang bisa ditambah item');
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
        const totals = this.recalculateInvoice(items, Number(invoice.discountPercent), Number(invoice.taxPercent));
        const updated = await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { ...totals },
            include: { customer: true, items: true },
        });
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
        const items = invoice.items.filter((item) => item.id !== itemId);
        const totals = this.recalculateInvoice(items, Number(invoice.discountPercent), Number(invoice.taxPercent));
        const updated = await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { ...totals },
            include: { customer: true, items: true },
        });
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