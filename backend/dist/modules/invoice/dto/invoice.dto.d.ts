import { InvoiceStatus } from '@prisma/client';
export declare class AddInvoiceItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    itemId?: string;
}
export declare class CreateInvoiceDto {
    customerId: string;
    dueDate: Date;
    discountPercent?: number;
    taxPercent?: number;
    notes?: string;
    items: AddInvoiceItemDto[];
}
export declare class UpdateInvoiceDto {
    dueDate?: Date;
    discountPercent?: number;
    taxPercent?: number;
    notes?: string;
}
export declare class UpdateStatusDto {
    status: InvoiceStatus;
}
