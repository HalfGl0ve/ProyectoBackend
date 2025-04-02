import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from '../email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, JwtAuthGuard, RolesGuard, EmailService],
  exports: [JwtStrategy, JwtAuthGuard, RolesGuard,UserService],
})
export class UserModule {}