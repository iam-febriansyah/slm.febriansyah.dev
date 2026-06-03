import { PrismaService } from '@/common/database/prisma.service';
import { InvoiceNumberService } from './invoice-number.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateStatusDto, AddInvoiceItemDto } from './dto/invoice.dto';
import { InvoiceStatus } from '@prisma/client';
export declare class InvoiceService {
    private prisma;
    private invoiceNumberService;
    constructor(prisma: PrismaService, invoiceNumberService: InvoiceNumberService);
    private recalculateInvoice;
    create(dto: CreateInvoiceDto, userId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    findAll(page?: number, limit?: number, status?: InvoiceStatus, customerId?: string, dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            items: any[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    update(id: string, dto: UpdateInvoiceDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    addItem(invoiceId: string, dto: AddInvoiceItemDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    removeItem(invoiceId: string, itemId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
