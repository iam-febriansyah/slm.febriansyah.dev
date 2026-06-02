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
                name: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                phone: string | null;
                address: string | null;
            };
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
        };
        message: string;
    }>;
    findAll(page?: number, limit?: number, status?: InvoiceStatus, customerId?: string, dateFrom?: string, dateTo?: string): Promise<{
        success: boolean;
        data: {
            items: ({
                customer: {
                    name: string;
                    email: string | null;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    phone: string | null;
                    address: string | null;
                };
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
            user: {
                name: string;
                email: string;
                password: string;
                id: string;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
            customer: {
                name: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                phone: string | null;
                address: string | null;
            };
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
        };
    }>;
    update(id: string, dto: UpdateInvoiceDto): Promise<{
        success: boolean;
        data: {
            customer: {
                name: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                phone: string | null;
                address: string | null;
            };
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
        };
        message: string;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto): Promise<{
        success: boolean;
        data: {
            customer: {
                name: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                phone: string | null;
                address: string | null;
            };
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
        };
        message: string;
    }>;
    addItem(id: string, dto: AddInvoiceItemDto): Promise<{
        success: boolean;
        data: {
            customer: {
                name: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                phone: string | null;
                address: string | null;
            };
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
        };
        message: string;
    }>;
    removeItem(id: string, itemId: string): Promise<{
        success: boolean;
        data: {
            customer: {
                name: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                phone: string | null;
                address: string | null;
            };
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
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
