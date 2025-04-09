// products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product as ProductModel, ProductDocument } from './schema/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductServiceInterface, Product } from './interfaces/product.interface';

@Injectable()
export class ProductsService implements ProductServiceInterface {
    constructor(
        @InjectModel(ProductModel.name) private productModel: Model<ProductDocument>,
    ) {}
    async findByName(name: string): Promise<Product> {
        const product = await this.productModel.findOne({ name }).lean().exec();

        if (!product) {
            throw new NotFoundException(`Product with name ${name} not found`);
        }
        return this.mapToProductInterface(product);
    }

    async findAll(userId?: string): Promise<Product[]> {
        const query = userId ? { createdBy: userId } : {};
        const products = await this.productModel.find(query).lean().exec();

        return products.map(product => this.mapToProductInterface(product));
    }

    async findById(id: string): Promise<Product> {
        const product = await this.productModel.findById(id).lean().exec();
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return this.mapToProductInterface(product);
    }

    async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
        const newProduct = new this.productModel({
        ...createProductDto,
        createdBy: userId,
        category: createProductDto.category,
        });

        newProduct.save();
        return this.mapToProductInterface(newProduct.toObject());
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateProductDto, { new: true })
        .exec();
        if (!updatedProduct) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return this.mapToProductInterface(updatedProduct);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.productModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return true;
    }

    private mapToProductInterface(product: any): Product {
        return {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            price: product.price,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    
    }
}