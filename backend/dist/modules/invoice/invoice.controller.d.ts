import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateStatusDto, AddInvoiceItemDto } from './dto/invoice.dto';
import { InvoiceStatus } from '@prisma/client';
export declare class InvoiceController {
    private readonly invoiceService;
    constructor(invoiceService: InvoiceService);
    create(dto: CreateInvoiceDto, user: any): Promise<{
        success: boolean;
        data: {
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
            };
            items: {
                id: string;
                description: string;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                itemId: string | null;
                invoiceId: string;
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
        };
        message: string;
    }>;
    findAll(page?: number, limit?: number, status?: InvoiceStatus, customerId?: string, dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            items: ({
                customer: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    name: string;
                    email: string | null;
                    phone: string | null;
                    address: string | null;
                };
                items: {
                    id: string;
                    description: string;
                    quantity: number;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    totalPrice: import("@prisma/client/runtime/library").Decimal;
                    itemId: string | null;
                    invoiceId: string;
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
        data: {
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
            };
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                email: string;
                password: string;
                role: import(".prisma/client").$Enums.Role;
            };
            items: {
                id: string;
                description: string;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                itemId: string | null;
                invoiceId: string;
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
        };
    }>;
    update(id: string, dto: UpdateInvoiceDto): Promise<{
        success: boolean;
        data: {
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
            };
            items: {
                id: string;
                description: string;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                itemId: string | null;
                invoiceId: string;
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
        };
        message: string;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto): Promise<{
        success: boolean;
        data: {
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
            };
            items: {
                id: string;
                description: string;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                itemId: string | null;
                invoiceId: string;
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
        };
        message: string;
    }>;
    addItem(id: string, dto: AddInvoiceItemDto): Promise<{
        success: boolean;
        data: {
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
            };
            items: {
                id: string;
                description: string;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                itemId: string | null;
                invoiceId: string;
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
        };
        message: string;
    }>;
    removeItem(id: string, itemId: string): Promise<{
        success: boolean;
        data: {
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                email: string | null;
                phone: string | null;
                address: string | null;
            };
            items: {
                id: string;
                description: string;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                itemId: string | null;
                invoiceId: string;
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
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
