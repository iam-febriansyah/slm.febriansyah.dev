import { PrismaService } from '@/common/database/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
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
                    id: string;
                    description: string;
                    quantity: number;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    totalPrice: import("@prisma/client/runtime/library").Decimal;
                    invoiceId: string;
                    itemId: string | null;
                }[];
            } & {
                id: string;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
    private calculateMonthlyRevenue;
}
