import { Body, Controller, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { Query, Post, Get, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './interfaces/user.interface';
import { ChangePasswordDto, CreateUserDto, LoginDto, RefreshTokenDto, VerifyEmailDto, VerifyLoginCodeDto } from './dto/user.dto';
import { Public } from './decorators/public.decorator';
import { CheckPolicies } from './decorators/check-policies.decorator';
import { Action } from 'src/abilities/ability.factory';


@Controller('api/v1/user')
export class UserController {


    constructor(private readonly userService: UserService
    ){}


    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() CreateUserDto: CreateUserDto): Promise<User>{
        const user = await this.userService.create(CreateUserDto);
        return user;
    }

    @Public()
    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() LoginDto: LoginDto): Promise<{message: string}> {
        return this.userService.login(LoginDto);
    }

    @Public()
    @Post('/login/verify-login-code')
    @HttpCode(HttpStatus.OK)
    async verifyLoginCode(@Body() verifyLoginCode: VerifyLoginCodeDto): Promise<{message: string, accessToken: string, refreshToken: string}> {
        return this.userService.verifyLoginCode(verifyLoginCode);
    }

    @CheckPolicies({action: Action.Update, subject: 'User'})
    @Put('refresh-token')
    async refreshToken(@Body() refreshToken: RefreshTokenDto): Promise<{accessToken: string}>{
        return this.userService.refreshToken(refreshToken);
    }

    @CheckPolicies({action: Action.Read, subject: 'User'})
    @Get()
    async findAll(): Promise<User[]>{
        return this.userService.findAll();
    }

    @Public()
    @Post('verify-email')
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
        await this.userService.verifyEmailToken(verifyEmailDto);
        return { message: 'Email verificado exitosamente' };
    }

    @CheckPolicies({action: Action.Read, subject: 'User'})
    @Get(':id')
    async findById(@Param('id') id: string): Promise<User>{
        return this.userService.findOne(id);
    }

    @CheckPolicies({action: Action.Read, subject: 'User'})
    @Get('/em/:email')
    async findByEmail(@Param('email') email: string): Promise<User>{
        return this.userService.findByEmail(email);
    }


    @CheckPolicies({action: Action.Update, subject: 'User'})
    @Put('/:id/password')
    async changePassword(@Param('id') id: string, @Body() changePasswordDTO: ChangePasswordDto): Promise<string>{
        await this.userService.changePassword(id, changePasswordDTO);

        return 'Contraseña cambiada con exito';
    }

    @CheckPolicies({action: Action.Delete, subject: 'User'})
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void>{
        return this.userService.remove(id);
    }


}
