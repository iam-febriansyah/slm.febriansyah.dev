import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateStatusDto, AddInvoiceItemDto } from './dto/invoice.dto';
import { InvoiceStatus } from '@prisma/client';
export declare class InvoiceController {
    private readonly invoiceService;
    constructor(invoiceService: InvoiceService);
    create(dto: CreateInvoiceDto, user: any): Promise<{
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
    addItem(id: string, dto: AddInvoiceItemDto): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    removeItem(id: string, itemId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
