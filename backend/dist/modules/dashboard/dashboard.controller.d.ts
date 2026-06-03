import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
}
