import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { SignInDto, SignInInput, SignUpInput } from './types';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.schema';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => SignInDto)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Allow only 5 login attempts per minute
  async login(
    @Args('signInInput') loginUserDto: SignInInput,
    @Context() ctx: any,
  ): Promise<SignInDto> {
    const data = await this.authService.signIn(loginUserDto);
    ctx.res.cookie('jwt', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.FRONTEND_DOMAIN,
    });

    return data;
  }

  @Mutation(() => User)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Allow only 3 registration attempts per minute
  async register(
    @Args('signUpInput') createUserDto: SignUpInput,
  ): Promise<User> {
    return this.authService.signUp(createUserDto);
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: any): Promise<boolean> {
    ctx.res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.FRONTEND_DOMAIN,
    });
    return true;
  }
}
