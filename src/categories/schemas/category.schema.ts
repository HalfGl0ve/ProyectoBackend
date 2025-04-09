import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
    timestamps: true,
    toJSON: {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
        }
    }
})
export class Category {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({default: true})
    isActive?: boolean;

    @Prop({required: false})
    imageUrl?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);