import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { isStringObject } from "util/types";

export class SendEmailDTO{
@IsEmail({}, {each: true})
recipients: string[];

@IsString()
subject: string;

@IsString()
html: string;

@IsOptional()
@IsString()
text?: string;

}