export declare class CreateItemDto {
    name: string;
    description?: string;
    unitPrice: number;
    unit?: string;
    sku?: string;
    isActive?: boolean;
}
declare const UpdateItemDto_base: import("@nestjs/common").Type<Partial<CreateItemDto>>;
export declare class UpdateItemDto extends UpdateItemDto_base {
}
export {};
