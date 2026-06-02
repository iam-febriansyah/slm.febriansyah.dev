import { PrismaService } from '@/common/database/prisma.service';
import { InvoiceNumberService } from './invoice-number.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateStatusDto, AddInvoiceItemDto } from './dto/invoice.dto';
import { InvoiceStatus, Prisma } from '@prisma/client';
export declare class InvoiceService {
    private prisma;
    private invoiceNumberService;
    constructor(prisma: PrismaService, invoiceNumberService: InvoiceNumberService);
    private recalculateInvoice;
    create(dto: CreateInvoiceDto, userId: string): Promise<{
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
                unitPrice: Prisma.Decimal;
                quantity: number;
                itemId: string | null;
                totalPrice: Prisma.Decimal;
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
            subtotal: Prisma.Decimal;
            discountPercent: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            taxPercent: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
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
                    unitPrice: Prisma.Decimal;
                    quantity: number;
                    itemId: string | null;
                    totalPrice: Prisma.Decimal;
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
                subtotal: Prisma.Decimal;
                discountPercent: Prisma.Decimal;
                discountAmount: Prisma.Decimal;
                taxPercent: Prisma.Decimal;
                taxAmount: Prisma.Decimal;
                totalAmount: Prisma.Decimal;
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
                unitPrice: Prisma.Decimal;
                quantity: number;
                itemId: string | null;
                totalPrice: Prisma.Decimal;
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
            subtotal: Prisma.Decimal;
            discountPercent: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            taxPercent: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
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
                unitPrice: Prisma.Decimal;
                quantity: number;
                itemId: string | null;
                totalPrice: Prisma.Decimal;
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
            subtotal: Prisma.Decimal;
            discountPercent: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            taxPercent: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
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
                unitPrice: Prisma.Decimal;
                quantity: number;
                itemId: string | null;
                totalPrice: Prisma.Decimal;
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
            subtotal: Prisma.Decimal;
            discountPercent: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            taxPercent: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            notes: string | null;
            customerId: string;
            userId: string;
        };
        message: string;
    }>;
    addItem(invoiceId: string, dto: AddInvoiceItemDto): Promise<{
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
                unitPrice: Prisma.Decimal;
                quantity: number;
                itemId: string | null;
                totalPrice: Prisma.Decimal;
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
            subtotal: Prisma.Decimal;
            discountPercent: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            taxPercent: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            notes: string | null;
            customerId: string;
            userId: string;
        };
        message: string;
    }>;
    removeItem(invoiceId: string, itemId: string): Promise<{
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
                unitPrice: Prisma.Decimal;
                quantity: number;
                itemId: string | null;
                totalPrice: Prisma.Decimal;
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
            subtotal: Prisma.Decimal;
            discountPercent: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            taxPercent: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
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
