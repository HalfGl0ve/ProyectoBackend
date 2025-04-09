import { UploadedFile } from '@nestjs/common';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../dto/categories.dto';

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryServiceInterface {
  create(createUserDto: CreateCategoryDto, image: Express.Multer.File): Promise<Category>;
  findAll(): Promise<Category[]>;
  findOne(id: string): Promise<Category>;
  update(id: string, updateUserDto: UpdateCategoryDto, image: Express.Multer.File): Promise<Category>;
  remove(id: string): Promise<void>;
}
