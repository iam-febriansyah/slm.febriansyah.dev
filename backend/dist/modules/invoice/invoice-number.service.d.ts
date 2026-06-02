import { PrismaService } from '@/common/database/prisma.service';
export declare class InvoiceNumberService {
    private prisma;
    constructor(prisma: PrismaService);
    generate(): Promise<string>;
}
