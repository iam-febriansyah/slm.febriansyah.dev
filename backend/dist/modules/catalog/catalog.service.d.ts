import { PrismaService } from '@/common/database/prisma.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { Prisma } from '@prisma/client';
export declare class CatalogService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateItemDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            unitPrice: Prisma.Decimal;
            unit: string | null;
            sku: string | null;
            isActive: boolean;
        };
        message: string;
    }>;
    findAll(page?: number, limit?: number, search?: string, isActive?: boolean): Promise<{
        success: boolean;
        data: {
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                description: string | null;
                unitPrice: Prisma.Decimal;
                unit: string | null;
                sku: string | null;
                isActive: boolean;
            }[];
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            unitPrice: Prisma.Decimal;
            unit: string | null;
            sku: string | null;
            isActive: boolean;
        };
    }>;
    update(id: string, dto: UpdateItemDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            unitPrice: Prisma.Decimal;
            unit: string | null;
            sku: string | null;
            isActive: boolean;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
