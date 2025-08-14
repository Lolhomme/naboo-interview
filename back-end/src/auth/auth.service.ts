import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/user.schema';
import { UserService } from '../user/user.service';
import { SignInDto, SignInInput, SignUpInput } from './types';
import { PayloadDto } from './types/jwtPayload.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn({ email, password }: SignInInput): Promise<SignInDto> {
    try {
      const user = await this.userService.getByEmail(email);
      const isSamePassword = await bcrypt.compare(password, user.password);

      if (!isSamePassword) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = await this.generateToken({ user });

      return { access_token: token };
    } catch (error) {
      // Don't leak information about whether user exists or not
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async generateToken({ user }: { user: User }): Promise<string> {
    const payload: PayloadDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return await this.jwtService.signAsync(payload);
  }

  async signUp({
    email,
    password,
    firstName,
    lastName,
  }: SignUpInput): Promise<User> {
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    return this.userService.createUser({
      email,
      password,
      firstName,
      lastName,
    });
  }
}
