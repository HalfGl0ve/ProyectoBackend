import {
  CreateProductDto,
  UpdateProductDto,
} from '../dto/product.dto';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductServiceInterface {
  create(createProductDto: CreateProductDto, userId: string, categoryId: string): Promise<Product>;
  findAll(userId?: string): Promise<Product[]>;
  findById(id: string): Promise<Product>;
  findByName(name: string): Promise<Product>;
  update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
  delete(id: string): Promise<boolean>;
}
