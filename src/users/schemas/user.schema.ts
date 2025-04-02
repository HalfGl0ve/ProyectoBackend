import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

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
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: null })
    refreshToken: string;

    @Prop({ required: true, default: 'user' })
    role: string;

    @Prop({ type: String, required: false })
    loginCode?: string;

    @Prop({ type: Date, required: false })
    loginCodeExpires?: Date;

    @Prop({ type: String, required: false })
    verificationCode?: string;

    @Prop({ type: Date, required: false })
    verificationCodeExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
