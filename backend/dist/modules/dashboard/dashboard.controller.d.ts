import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            totalInvoices: number;
            totalRevenue: number;
            paidCount: number;
            unpaidCount: number;
            draftCount: number;
            cancelledCount: number;
            recentInvoices: ({
                items: {
                    description: string;
                    id: string;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    quantity: number;
                    itemId: string | null;
                    totalPrice: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                invoiceNumber: string;
                status: import(".prisma/client").$Enums.InvoiceStatus;
                issueDate: Date;
                dueDate: Date;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                discountPercent: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                taxPercent: import("@prisma/client/runtime/library").Decimal;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                notes: string | null;
                customerId: string;
                userId: string;
            })[];
            monthlyRevenue: {
                month: string;
                revenue: number;
            }[];
        };
        message: string;
    }>;
}
