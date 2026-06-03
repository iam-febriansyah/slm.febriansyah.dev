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
        let whereConditions = 'i.deleted_at IS NULL';
        const params = [];
        if (dateFrom && dateTo) {
            whereConditions += ' AND i.issue_date BETWEEN ? AND ?';
            params.push(new Date(dateFrom), new Date(dateTo));
        }
        const invoices = await this.prisma.$queryRawUnsafe(`SELECT * FROM invoices i WHERE ${whereConditions}`, ...params);
        const totalInvoices = invoices.length;
        const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
        const paidCount = invoices.filter((inv) => inv.status === client_1.InvoiceStatus.PAID).length;
        const unpaidCount = invoices.filter((inv) => inv.status === client_1.InvoiceStatus.UNPAID).length;
        const draftCount = invoices.filter((inv) => inv.status === client_1.InvoiceStatus.DRAFT).length;
        const cancelledCount = invoices.filter((inv) => inv.status === client_1.InvoiceStatus.CANCELLED).length;
        const recentInvoiceIds = invoices
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
            .slice(0, 5)
            .map((inv) => inv.id);
        let recentInvoices = [];
        if (recentInvoiceIds.length > 0) {
            const placeholders = recentInvoiceIds.map(() => '?').join(',');
            recentInvoices = await this.prisma.$queryRawUnsafe(`SELECT * FROM invoices WHERE id IN (${placeholders}) ORDER BY created_at DESC`, ...recentInvoiceIds);
            const items = await this.prisma.$queryRawUnsafe(`SELECT * FROM invoice_items WHERE invoice_id IN (${placeholders})`, ...recentInvoiceIds);
            const itemsMap = {};
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
            const issueDate = inv.issue_date || inv.issueDate;
            const totalAmount = inv.total_amount || inv.totalAmount;
            const date = new Date(issueDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months[monthKey] = (months[monthKey] || 0) + Number(totalAmount);
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