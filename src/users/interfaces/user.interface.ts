import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
  UpdateUserDto,
  VerifyLoginCodeDto,
} from '../dto/user.dto';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  role: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserServiceInterface {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
  verifyUser(id: string): Promise<User>;
  login(
    loginDto: LoginDto,
  ): Promise<{message: string}>;
  verifyLoginCode(
    verifyLoginCode: VerifyLoginCodeDto,
  ): Promise<{ message: string, accessToken: string, refreshToken: string }>;
  refreshToken(
    refreshToken: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void>;
}
