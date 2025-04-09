import { ConflictException, Injectable, UploadedFile } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { CategoryDocument, Category as CategoryModel } from './schemas/category.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryServiceInterface } from './interfaces/category.interface';

@Injectable()
export class CategoriesService implements CategoryServiceInterface{

    constructor(@InjectModel(CategoryModel.name) private categoryModel: Model<CategoryDocument>){}
    async findAll(): Promise<Category[]> {
        const categories = await this.categoryModel.find().lean().exec();
        return categories.map(category => this.mapToCategoryInterface(category));
    }

    async findOne(id: string): Promise<Category> {
        const category = this.categoryModel.findById(id).lean().exec();
        if (!category) {
            throw new ConflictException('Category not found');
        }

        return await this.mapToCategoryInterface(category);
    }

    async remove(id: string): Promise<void> {
        const category = await this.categoryModel.findByIdAndDelete(id).exec();
        if (!category) {
            throw new ConflictException('Category not found');
        };
    }

    async create(createCategoryDto: CreateCategoryDto, @UploadedFile() image: Express.Multer.File): Promise<Category> {
        const existingCategory = await this.categoryModel.findOne({ name: createCategoryDto.name }).exec();
        if (existingCategory) {
            throw new ConflictException('El email ya esta registrado');
        }

        if(image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpg') {
            throw new ConflictException('Invalid file type. Only JPEG and PNG are allowed.');
        }

        const newCategory = new this.categoryModel({
            ...createCategoryDto,
            imageUrl: image.path,
        });

        await newCategory.save();

        return this.mapToCategoryInterface(newCategory.toObject());
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto, @UploadedFile() image: Express.Multer.File): Promise<Category> {
        const category = await this.categoryModel.findById(id).exec();
        if (!category) {
            throw new ConflictException('Category not found');
        }
        
        if (updateCategoryDto.name) {
            const existingCategory = await this.categoryModel.findOne({ name: updateCategoryDto.name }).exec();
            if (existingCategory && existingCategory._id?.toString() !== id) {
                throw new ConflictException('Category with this name already exists');
            }
        }

        if(image && image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png' && image.mimetype !== 'image/jpg') {
            throw new ConflictException('Invalid file type. Only JPEG and PNG are allowed.');
        }
        
        Object.assign(category, {
            ...updateCategoryDto,
            imageUrl: image ? image.path : category.imageUrl,
        });
        await category.save();

        return this.mapToCategoryInterface(category.toObject());
    }

    

    private mapToCategoryInterface(categoryDoc: any): Category {
        return {
            id: categoryDoc._id ? categoryDoc._id.toString() : categoryDoc.id,
            name: categoryDoc.name,
            description: categoryDoc.description,
            isActive: categoryDoc.isActive,
            createdAt: categoryDoc.createdAt,
            updatedAt: categoryDoc.updatedAt,
        };
    }
}
