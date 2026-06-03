import { PrismaService } from '@/common/database/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            totalInvoices: number;
            totalRevenue: any;
            paidCount: number;
            unpaidCount: number;
            draftCount: number;
            cancelledCount: number;
            recentInvoices: any[];
            monthlyRevenue: {
                month: string;
                revenue: number;
            }[];
        };
        message: string;
    }>;
    private calculateMonthlyRevenue;
}
