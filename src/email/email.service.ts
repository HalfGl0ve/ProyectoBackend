import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SendEmailDTO } from './dto/email.dto';

@Injectable()
export class EmailService {

    constructor(private readonly configService: ConfigService){}

    emailTransport(){
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('EMAIL_HOST'),
            port: this.configService.get<number>('PORT'),
            secure: false,
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASSWORD'),
            },
        })
        return transporter;
    }

    async sendEmail(dto: SendEmailDTO){
        const {recipients, subject, html} = dto;

        const transport = this.emailTransport();

        const options: nodemailer.SendMailOptions = {
            from: this.configService.get<string>('EMAIL_USER'),
            to: recipients,
            subject: subject,
            html: html,
        };
        try{
            await transport.sendMail(options);
            console.log('Email sent succesfully');
        }
        catch(error){
            console.log('Error sending email: ',error);
        }
    }
}
