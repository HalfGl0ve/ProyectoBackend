import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    UnauthorizedException,
    } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Roles } from '../users/decorators/roles.decorator';
import { Public } from '../users/decorators/public.decorator';
import { CheckPolicies } from 'src/users/decorators/check-policies.decorator';
import { Action } from 'src/abilities/ability.factory';


@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Public()
    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findById(id);
    }

    // Ruta protegida por defecto
    @CheckPolicies({ action: Action.Create, subject: 'Product' })
    @Post()
    create(@Body() createProductDto: CreateProductDto, @Request() req) {
        return this.productsService.create(createProductDto, req.user.id);
    }

    @CheckPolicies({ action: Action.Update, subject: 'Product' })
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @Request() req,
    ) {
        const product = await this.productsService.findById(id);
        
        return this.productsService.update(id, updateProductDto);
    }

    @CheckPolicies({ action: Action.Delete, subject: 'Product' })
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req) {
        const product = await this.productsService.findById(id);
        
        return this.productsService.delete(id);
    }
}