import { CatalogService } from './catalog.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    create(dto: CreateItemDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            description: string | null;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            sku: string | null;
            isActive: boolean;
        };
        message: string;
    }>;
    findAll(page?: number, limit?: number, search?: string, isActive?: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                description: string | null;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
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
            unitPrice: import("@prisma/client/runtime/library").Decimal;
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
            unitPrice: import("@prisma/client/runtime/library").Decimal;
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
