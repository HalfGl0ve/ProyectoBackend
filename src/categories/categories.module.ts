import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [MulterModule.register({
        dest: './uploads',
      }),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule {}
