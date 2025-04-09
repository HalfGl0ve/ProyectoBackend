import { Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';
import { CheckPolicies } from 'src/users/decorators/check-policies.decorator';
import { Action } from 'src/abilities/ability.factory';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService
    ){}

    @CheckPolicies({action: Action.Read, subject: 'Category'})
    @Get()
    async getAllCategories(): Promise<CreateCategoryDto[]> {
        return this.categoriesService.findAll();
    }
    
    async getCategoryById(id: string): Promise<CreateCategoryDto> {
        return this.categoriesService.findOne(id);
    }

    @CheckPolicies({action: Action.Create, subject: 'Category'})
    @UseInterceptors(FileInterceptor('image'))
    @Post()
    async createCategory(@Body() createCategoryDto: CreateCategoryDto, @UploadedFile() image: Express.Multer.File): Promise<CreateCategoryDto> {
        return this.categoriesService.create(createCategoryDto, image);
    }

    @CheckPolicies({action: Action.Update, subject: 'Category'})
    @UseInterceptors(FileInterceptor('image'))
    @Put(':id')
    async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @UploadedFile() image: Express.Multer.File): Promise<UpdateCategoryDto> {
        return this.categoriesService.update(id, updateCategoryDto, image);
    }

    @CheckPolicies({action: Action.Delete, subject: 'Category'})
    @Delete(':id')
    async deleteCategory(@Param('id') id: string): Promise<void> {
        this.categoriesService.remove(id);
    }


}
