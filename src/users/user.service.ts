import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserServiceInterface } from './interfaces/user.interface';
import { CreateUserDto, UpdateUserDto, LoginDto, ChangePasswordDto, RefreshTokenDto, VerifyEmailDto, VerifyLoginCodeDto } from './dto/user.dto';
import { UserDocument, User as UserModel } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/email/email.service';
import twilio from 'twilio';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService implements UserServiceInterface {

    constructor(
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService, // Inyecta el JwtService
        private emailService: EmailService,
        private configService: ConfigService,
    ) {}


    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = await this.userModel.findOne({ email: createUserDto.email }).exec();

        if(user){
            throw new ConflictException('El email ya esta registrado');
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 
        const verificationCodeExpires = new Date();
        verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 2); 

        createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
        const newUser = new this.userModel({
            ...createUserDto,
            verificationCode,
            verificationCodeExpires,
        })

        

        const savedUser = await newUser.save();

        const emailContent = `
                    <p>Hola ${savedUser.name},</p>
                    <p>Para verificar tu cuenta, utiliza el siguiente codigo:</p>
                    <p>${savedUser.verificationCode}</p>
                    <p>Si no solicitaste este correo, ignóralo.</p>
                `;
                
        await this.emailService.sendEmail({
            recipients: [savedUser.email],
            subject: 'Verifica tu cuenta',
            html: emailContent,
        });

        return this.mapToUserInterface(savedUser.toObject());
    }

    async findAll(): Promise<User[]> {
        const users = await this.userModel.find().lean().exec();
        return users.map(user => this.mapToUserInterface(user));
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel.findById(id).lean().exec();
        
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return this.mapToUserInterface(user);
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).lean().exec();
        if (!user) {
            throw new NotFoundException(`Usuario con el email ${email} no encontrado`);
        }
        return this.mapToUserInterface(user);
    }

    update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        throw new Error('Method not implemented.');
    }

    async remove(id: string): Promise<void> {
        const result = await this.userModel.findByIdAndDelete(id).lean().exec();
        if (!result) {
            throw new NotFoundException(`Usuario con el ID ${id} no encontrado`);
        }
    }


    async verifyEmailToken(verifyEmailDto: VerifyEmailDto): Promise<{message: string}> {
        const {email, code} = verifyEmailDto;
        
        const user = await this.userModel.findOne({email}).exec();

        if(!user){
            throw new NotFoundException('No se encontro un usuario con ese email');
        }

        if(user.isVerified){
            return {message: 'El email ya ha sido verificado'};
        }

        if(user.verificationCode !== code){
            throw new BadRequestException('Codigo invalido');
        }

        if(user.verificationCodeExpires && new Date() > user.verificationCodeExpires){
            throw new BadRequestException('El codigo expiro');
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();
        return {message: 'Correo verificado con exito'};
    }

    async verifyUser(userId: string): Promise<User> {
        const userDoc = await this.userModel.findById(userId).exec();
        if (!userDoc) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }
        userDoc.isVerified = true;
        await userDoc.save();
        return this.mapToUserInterface(userDoc.toObject());
    }

    async login(loginDto: LoginDto): Promise<{message: string}> {
        const { email, password } = loginDto;
        const userDoc = await this.userModel.findOne({ email }).exec();
        if (!userDoc) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        if(!userDoc.isVerified){
            throw new UnauthorizedException('La cuenta no ha sido verificada');
        }

        const isValidPassword = await bcrypt.compare(password, userDoc.password);
        if (!isValidPassword) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
        const loginCodeExpires = new Date();
        loginCodeExpires.setMinutes(loginCodeExpires.getMinutes() + 2);

        userDoc.loginCode = loginCode;
        userDoc.loginCodeExpires = loginCodeExpires;

        userDoc.save();

        const client = twilio(this.configService.get<string>('TWILIO_ACCOUNT_SID'), this.configService.get<string>('TWILIO_AUTH_TOKEN'));

        client.messages.create({
            body: `Tu código de inicio de sesión es: ${loginCode}`,
            from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
            to: userDoc.phoneNumber,
        })


        return {message: 'Verifica el codigo que llego a tu telefono'};
    }

    async verifyLoginCode(verifyLoginCode: VerifyLoginCodeDto): Promise<{message: string, accessToken: string, refreshToken: string}> {
        const { email, code } = verifyLoginCode;

        const userDoc = await this.userModel.findOne({ email }).exec();
        if (!userDoc) {
            throw new NotFoundException('No se encontro un usuario con ese email');
        }
        if (userDoc.loginCode !== code) {
            throw new BadRequestException('Codigo invalido');
        }
        if (userDoc.loginCodeExpires && new Date() > userDoc.loginCodeExpires) {
            throw new BadRequestException('El codigo expiro');
        }

        userDoc.loginCode = undefined;
        userDoc.loginCodeExpires = undefined;

        userDoc.save();

        const user = this.mapToUserInterface(userDoc.toObject());

        const payload = { email: user.email, sub: user.id, role: user.role };

        const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });
        const refreshTokenPayload = {...payload, type: 'refresh-token'};
        const refreshToken = this.jwtService.sign(refreshTokenPayload, { expiresIn: "7d" });

        return {message: 'Login exitoso', accessToken, refreshToken};

    }

    async refreshToken(refreshToken: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string}> {
        let payload
        try {
        payload = this.jwtService.verify(refreshToken.refreshToken);
        
        if (payload.type !== 'refresh-token') {
            throw new UnauthorizedException('Tipo de token inválido');
        }
        const userDoc = await this.userModel.findById(payload.sub).exec();
        if (!userDoc) {
            throw new UnauthorizedException('Usuario no encontrado');
        }
        if (userDoc.refreshToken !== refreshToken.refreshToken) {
            throw new UnauthorizedException('Refresh token no coincide');
        }
        const newPayload = { 
            email: userDoc.email, 
            sub: userDoc._id?.toString(),
            role: userDoc.role 
            };
        const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: "15m" });
        
        const newRefreshToken = this.jwtService.sign(
            { ...newPayload, type: 'refresh-token' },
            { expiresIn: '7d' },
        );
        userDoc.refreshToken = newRefreshToken;
        await userDoc.save();
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
            throw new UnauthorizedException('Refresh token inválido o expirado');
        }
    }

    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const userDoc = await this.userModel.findById(id).exec();

        if (!userDoc) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        const {currentPassword, newPassword} = changePasswordDto;

        const isValidPassword = await bcrypt.compare(currentPassword, userDoc.password);
        if(!isValidPassword){
            throw new UnauthorizedException('La contraseña actual es incorrecta');
        }

        userDoc.password = await bcrypt.hash(newPassword, 10);
        await userDoc.save();
    }

    async generateVerificationToken(user: User): Promise<string> {
        const payload = { sub: user.id, email: user.email, type: "email-verification" };
        const token = this.jwtService.sign(payload, { expiresIn: "24h" });
        return token;
    }

    private mapToUserInterface(userDoc: any): User {
        return {
            id: userDoc._id ? userDoc._id.toString() : userDoc.id,
            name: userDoc.name,
            email: userDoc.email,
            phoneNumber: userDoc.phoneNumber,
            isVerified: userDoc.isVerified,
            role: userDoc.role,
            refreshToken: userDoc.refreshToken,
            createdAt: userDoc.createdAt,
            updatedAt: userDoc.updatedAt
        };
    }
}
