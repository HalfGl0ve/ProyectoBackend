import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateProductDto{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateProductDto{
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}