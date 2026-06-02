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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(dateFrom, dateTo) {
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
        const paidCount = invoices.filter((inv) => inv.status === client_1.InvoiceStatus.PAID).length;
        const unpaidCount = invoices.filter((inv) => inv.status === client_1.InvoiceStatus.UNPAID).length;
        const draftCount = invoices.filter((inv) => inv.status === client_1.InvoiceStatus.DRAFT).length;
        const cancelledCount = invoices.filter((inv) => inv.status === client_1.InvoiceStatus.CANCELLED).length;
        const recentInvoices = invoices
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);
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
    calculateMonthlyRevenue(invoices) {
        const months = {};
        invoices.forEach((inv) => {
            const monthKey = `${inv.issueDate.getFullYear()}-${String(inv.issueDate.getMonth() + 1).padStart(2, '0')}`;
            months[monthKey] = (months[monthKey] || 0) + Number(inv.totalAmount);
        });
        return Object.entries(months)
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map