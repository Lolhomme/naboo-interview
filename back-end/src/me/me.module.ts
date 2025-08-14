import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { MeResolver } from './resolver/me.resolver';

@Module({
  imports: [UserModule, AuthModule],
  providers: [MeResolver],
})
export class MeModule {}
