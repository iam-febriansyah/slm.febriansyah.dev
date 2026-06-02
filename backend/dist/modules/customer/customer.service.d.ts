import { PrismaService } from '@/common/database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
export declare class CustomerService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCustomerDto): Promise<{
        success: boolean;
        data: {
            name: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            phone: string | null;
            address: string | null;
        };
        message: string;
    }>;
    findAll(page?: number, limit?: number, search?: string): Promise<{
        success: boolean;
        data: {
            items: {
                name: string;
                email: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                phone: string | null;
                address: string | null;
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
            name: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            phone: string | null;
            address: string | null;
        };
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        success: boolean;
        data: {
            name: string;
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            phone: string | null;
            address: string | null;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
